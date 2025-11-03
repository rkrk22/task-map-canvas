import Dexie, { Table } from 'dexie';

export type SyncState = 'pending' | 'synced' | 'failed';

export interface LocalTask {
  id: string;
  title: string;
  deadline: string;
  importance: number;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  syncState: SyncState;
  syncError?: string;
}

export interface SyncOperation {
  id: string; // UUID for operation
  taskId: string;
  type: 'create' | 'update' | 'delete';
  payload: Partial<LocalTask>;
  timestamp: number;
  retryCount: number;
  lastAttempt?: number;
  error?: string;
}

export class TaskDatabase extends Dexie {
  tasks!: Table<LocalTask, string>;
  syncQueue!: Table<SyncOperation, string>;

  constructor() {
    super('TaskDatabase');
    this.version(1).stores({
      tasks: 'id, importance, deadline, syncState, updated_at',
      syncQueue: 'id, taskId, timestamp, retryCount'
    });
    this.version(2).stores({
      tasks: 'id, importance, deadline, syncState, updated_at, created_at',
      syncQueue: 'id, taskId, timestamp, retryCount'
    });
  }
}

export const db = new TaskDatabase();
