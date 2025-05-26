// lib/export-utils.ts
import { Trainer, Client, Session } from '@/lib/mock-data';

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  entities: string[];
  filters?: {
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export interface ExportResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    totalRecords: number;
    recordCounts: { [key: string]: number };
    exportedAt: string;
  };
}

// Функция для валидации параметров экспорта
export function validateExportOptions(options: ExportOptions): { isValid: boolean; error?: string } {
  const validFormats = ['json', 'csv', 'xlsx'];
  if (!validFormats.includes(options.format)) {
    return { isValid: false, error: 'Неподдерживаемый формат экспорта' };
  }

  const validEntities = ['trainers', 'clients', 'sessions'];
  const invalidEntities = options.entities.filter(entity => !validEntities.includes(entity));
  if (invalidEntities.length > 0) {
    return { isValid: false, error: `Неподдерживаемые сущности: ${invalidEntities.join(', ')}` };
  }

  if (options.filters?.dateRange) {
    const { start, end } = options.filters.dateRange;
    if (new Date(start) >= new Date(end)) {
      return { isValid: false, error: 'Дата начала должна быть раньше даты окончания' };
    }
  }

  return { isValid: true };
}

// Функция для фильтрации данных по правам пользователя
export function filterDataByUserRole(
  data: { trainers?: Trainer[]; clients?: Client[]; sessions?: Session[] },
  userRole: string,
  userId: string
): { trainers?: Trainer[]; clients?: Client[]; sessions?: Session[] } {
  const filtered: { trainers?: Trainer[]; clients?: Client[]; sessions?: Session[] } = {};

  if (data.trainers) {
    if (userRole === 'trainer') {
      filtered.trainers = data.trainers.filter(t => t.id === userId);
    } else if (userRole === 'manager') {
      filtered.trainers = data.trainers.filter(t => t.role !== 'admin' && t.role !== 'super-admin');
    } else {
      filtered.trainers = data.trainers;
    }
  }

  if (data.clients) {
    if (userRole === 'trainer') {
      filtered.clients = data.clients.filter(c => c.trainerId === userId);
    } else {
      filtered.clients = data.clients;
    }
  }

  if (data.sessions) {
    if (userRole === 'trainer') {
      filtered.sessions = data.sessions.filter(s => s.trainerId === userId);
    } else if (userRole === 'client') {
      filtered.sessions = data.sessions.filter(s => s.clientId === userId);
    } else {
      filtered.sessions = data.sessions;
    }
  }

  return filtered;
}

// Функция для генерации имени файла
export function generateFileName(format: string, entities: string[]): string {
  const date = new Date().toISOString().split('T')[0];
  const entitiesStr = entities.join('_');
  return `fitness_${entitiesStr}_${date}.${format}`;
}

// Функция для подсчета записей
export function countRecords(data: any): { total: number; byEntity: { [key: string]: number } } {
  const byEntity: { [key: string]: number } = {};
  let total = 0;

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      byEntity[key] = value.length;
      total += value.length;
    }
  });

  return { total, byEntity };
}

// Функция для проверки срока действия экспорта
export function isExportExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

// Функция для форматирования размера файла
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
