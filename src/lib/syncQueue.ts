import { db, SyncOperation, LocalTask } from './db';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1000; // 1 second

export class SyncQueue {
  private isFlushingLock = false;
  private flushIntervalId?: number;

  constructor() {
    this.startPeriodicFlush();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => this.flush());
    window.addEventListener('focus', () => this.flush());
  }

  private startPeriodicFlush() {
    this.flushIntervalId = window.setInterval(() => {
      this.flush();
    }, 30000); // Every 30 seconds
  }

  async enqueue(
    taskId: string,
    type: SyncOperation['type'],
    payload: Partial<LocalTask>
  ): Promise<string> {
    const opId = uuidv4();
    const operation: SyncOperation = {
      id: opId,
      taskId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    };

    await db.syncQueue.add(operation);
    
    // Trigger flush in background (don't await)
    setTimeout(() => this.flush(), 0);
    
    return opId;
  }

  async flush(): Promise<void> {
    if (this.isFlushingLock || !navigator.onLine) return;
    
    this.isFlushingLock = true;
    
    try {
      const operations = await db.syncQueue
        .orderBy('timestamp')
        .toArray();

      for (const op of operations) {
        if (op.retryCount >= MAX_RETRIES) {
          await this.markTaskFailed(op.taskId, 'Max retries exceeded');
          await db.syncQueue.delete(op.id);
          continue;
        }

        try {
          await this.executeOperation(op);
          await db.syncQueue.delete(op.id);
          await db.tasks.update(op.taskId, { syncState: 'synced', syncError: undefined });
        } catch (error: any) {
          const backoff = INITIAL_BACKOFF * Math.pow(2, op.retryCount);
          const shouldRetry = Date.now() - (op.lastAttempt || 0) > backoff;

          if (shouldRetry) {
            await db.syncQueue.update(op.id, {
              retryCount: op.retryCount + 1,
              lastAttempt: Date.now(),
              error: error.message
            });
          }

          if (error.status === 409 || error.code === 'PGRST116') {
            await this.handleConflict(op);
          }
        }
      }
    } finally {
      this.isFlushingLock = false;
    }
  }

  private async executeOperation(op: SyncOperation): Promise<void> {
    const { type, taskId, payload } = op;

    switch (type) {
      case 'create': {
        const { syncState, syncError, ...taskData } = payload as LocalTask;
        const { error } = await supabase
          .from('tasks')
          .upsert({ ...taskData, id: taskId }, { onConflict: 'id' });
        if (error) throw error;
        break;
      }
      case 'update': {
        const { syncState, syncError, ...taskData } = payload as LocalTask;
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
        if (error) throw error;
        break;
      }
    }
  }

  private async handleConflict(op: SyncOperation): Promise<void> {
    const { data: serverTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', op.taskId)
      .single();

    if (!serverTask) {
      await db.syncQueue.delete(op.id);
      return;
    }

    const localTask = await db.tasks.get(op.taskId);
    if (!localTask) {
      await db.syncQueue.delete(op.id);
      return;
    }

    // Last-write-wins by updated_at
    const serverTime = new Date(serverTask.updated_at).getTime();
    const localTime = new Date(localTask.updated_at).getTime();

    if (serverTime > localTime) {
      // Server wins - update local
      await db.tasks.update(op.taskId, {
        ...serverTask,
        syncState: 'synced',
        syncError: undefined
      });
      await db.syncQueue.delete(op.id);
    } else {
      // Local wins - force update with incremented version
      const { error } = await supabase
        .from('tasks')
        .update({
          ...localTask,
          version: serverTask.version + 1
        })
        .eq('id', op.taskId);

      if (error) throw error;
      await db.syncQueue.delete(op.id);
    }
  }

  private async markTaskFailed(taskId: string, error: string): Promise<void> {
    await db.tasks.update(taskId, {
      syncState: 'failed',
      syncError: error
    });
  }

  destroy() {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
    }
  }
}

export const syncQueue = new SyncQueue();
