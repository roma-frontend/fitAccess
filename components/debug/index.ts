// components/debug/index.ts
export { SyncDebugPanel } from './SyncDebugPanel';
export { DebugSystemTest } from './DebugSystemTest';
// Типы для debug системы
export interface DebugEvent {
  _id?: string;
  id?: string;
  title?: string;
  status?: string;
  type?: string;
  trainerName?: string;
  clientName?: string;
  startTime?: string;
  createdAt?: string;
  price?: number;
}

export interface DebugNotification {
  id?: string;
  subject?: string;
  content?: string;
  senderRole?: string;
  senderName?: string;
  status?: string;
  createdAt?: string;
  recipientNames?: string[];
}

export interface SyncStatus {
  role: string;
  synced: boolean;
}

export interface DebugData {
  events: DebugEvent[];
  notifications: DebugNotification[];
  syncStatus: SyncStatus[];
}
