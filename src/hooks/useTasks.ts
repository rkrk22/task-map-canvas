import { useState, useEffect, useCallback } from 'react';
import { db, LocalTask } from '@/lib/db';
import { syncQueue } from '@/lib/syncQueue';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useConnectivity } from './useConnectivity';
import { useLiveQuery } from 'dexie-react-hooks';

export const useTasks = () => {
  const isOnline = useConnectivity();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Live query from IndexedDB
  const tasks = useLiveQuery(() => 
    db.tasks.orderBy('created_at').reverse().toArray()
  ) ?? [];

  // Initial sync from Supabase on mount
  useEffect(() => {
    const initSync = async () => {
      try {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) {
          for (const task of data) {
            const localTask: LocalTask = {
              id: task.id,
              title: task.title,
              deadline: task.deadline,
              importance: task.importance,
              status: task.status,
              version: task.version || 1,
              created_at: task.created_at,
              updated_at: task.updated_at,
              syncState: 'synced'
            };
            await db.tasks.put(localTask);
          }
        }
      } catch (error) {
        console.error('Initial sync failed:', error);
      }
    };

    initSync();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            await db.tasks.delete(payload.old.id);
          } else {
            const task = payload.new;
            const localTask = await db.tasks.get(task.id);
            
            // Only update if server version is newer
            if (!localTask || new Date(task.updated_at) > new Date(localTask.updated_at)) {
              const syncedTask: LocalTask = {
                id: task.id,
                title: task.title,
                deadline: task.deadline,
                importance: task.importance,
                status: task.status,
                version: task.version || 1,
                created_at: task.created_at,
                updated_at: task.updated_at,
                syncState: 'synced'
              };
              await db.tasks.put(syncedTask);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-flush sync queue when online
  useEffect(() => {
    if (isOnline) {
      syncQueue.flush();
    }
  }, [isOnline]);

  const createTask = useCallback(async (input: {
    title: string;
    deadline: string;
    importance: number;
  }) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTask: LocalTask = {
      id,
      title: input.title,
      deadline: input.deadline,
      importance: input.importance,
      status: 'in_progress',
      version: 1,
      created_at: now,
      updated_at: now,
      syncState: 'pending'
    };

    // Optimistic update to IndexedDB
    await db.tasks.add(newTask);
    
    // Enqueue sync operation
    await syncQueue.enqueue(id, 'create', newTask);
    
    return id;
  }, []);

  const updateTask = useCallback(async (
    id: string,
    patch: Partial<Pick<LocalTask, 'title' | 'deadline' | 'importance' | 'status'>>
  ) => {
    const existingTask = await db.tasks.get(id);
    if (!existingTask) return;

    const updatedTask: LocalTask = {
      ...existingTask,
      ...patch,
      updated_at: new Date().toISOString(),
      syncState: 'pending'
    };

    // Optimistic update
    await db.tasks.put(updatedTask);
    
    // Enqueue sync operation
    await syncQueue.enqueue(id, 'update', updatedTask);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const task = await db.tasks.get(id);
    if (!task) return;

    // Optimistic delete
    await db.tasks.delete(id);
    
    // Enqueue sync operation
    await syncQueue.enqueue(id, 'delete', task);
  }, []);

  const retryFailedTask = useCallback(async (id: string) => {
    const task = await db.tasks.get(id);
    if (!task || task.syncState !== 'failed') return;

    await db.tasks.update(id, { syncState: 'pending', syncError: undefined });
    
    // Re-enqueue with current task data
    await syncQueue.enqueue(id, 'update', task);
    await syncQueue.flush();
  }, []);

  return {
    tasks,
    isOnline,
    isSyncing,
    createTask,
    updateTask,
    deleteTask,
    retryFailedTask
  };
};
