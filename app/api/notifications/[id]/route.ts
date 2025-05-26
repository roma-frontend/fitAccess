// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockNotifications } from '../route';

// Интерфейс для параметров маршрута
interface RouteContext {
  params: {
    id: string;
  };
}

// GET /api/notifications/[id] - Получение конкретного уведомления
export const GET = withPermissions(
  { resource: 'notifications', action: 'read' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      // Проверка наличия контекста и параметров
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID уведомления не указан' },
          { status: 400 }
        );
      }

      const { id } = context.params;
      const { user } = req;

      console.log(`🔔 API: получение уведомления ${id}`);

      const notification = mockNotifications.find((n: any) => n.id === id);
      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Уведомление не найдено' },
          { status: 404 }
        );
      }

      // Проверка прав доступа
      if (notification.userId !== user.id && notification.userId !== 'all') {
        return NextResponse.json(
          { success: false, error: 'Нет доступа к данному уведомлению' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: notification
      });

    } catch (error: any) {
      console.error('💥 API: ошибка получения уведомления:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения уведомления' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/notifications/[id] - Обновление уведомления
export const PATCH = withPermissions(
  { resource: 'notifications', action: 'update' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      // Проверка наличия контекста и параметров
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID уведомления не указан' },
          { status: 400 }
        );
      }

      const { id } = context.params;
      const { user } = req;
      const body = await req.json();

      console.log(`📝 API: обновление уведомления ${id}`);

      const notificationIndex = mockNotifications.findIndex((n: any) => n.id === id);
      if (notificationIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Уведомление не найдено' },
          { status: 404 }
        );
      }

      const notification = mockNotifications[notificationIndex];

      // Проверка прав доступа
      if (notification.userId !== user.id && notification.userId !== 'all') {
        return NextResponse.json(
          { success: false, error: 'Нет доступа к данному уведомлению' },
          { status: 403 }
        );
      }

      // Обновление уведомления - ИСПРАВЛЕНО: используем правильные поля
      const updatedNotification = {
        ...notification,
        ...body,
        id: notification.id, // ID не должен изменяться
        userId: notification.userId, // userId не должен изменяться
        createdAt: notification.createdAt // createdAt не должен изменяться
      };

      mockNotifications[notificationIndex] = updatedNotification;

      console.log(`✅ API: уведомление обновлено - ${updatedNotification.title}`);

      return NextResponse.json({
        success: true,
        data: updatedNotification,
        message: 'Уведомление обновлено'
      });

    } catch (error: any) {
      console.error('💥 API: ошибка обновления уведомления:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления уведомления' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/notifications/[id] - Удаление конкретного уведомления
export const DELETE = withPermissions(
  { resource: 'notifications', action: 'delete' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      // Проверка наличия контекста и параметров
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID уведомления не указан' },
          { status: 400 }
        );
      }

      const { id } = context.params;
      const { user } = req;

      console.log(`🗑️ API: удаление уведомления ${id}`);

      const notificationIndex = mockNotifications.findIndex((n: any) => n.id === id);
      if (notificationIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Уведомление не найдено' },
          { status: 404 }
        );
      }

      const notification = mockNotifications[notificationIndex];

      // Проверка прав доступа
      if (notification.userId !== user.id && notification.userId !== 'all') {
        return NextResponse.json(
          { success: false, error: 'Нет доступа к данному уведомлению' },
          { status: 403 }
        );
      }

      // Удаление уведомления
      const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0];

      console.log(`✅ API: уведомление удалено - ${deletedNotification.title}`);

      return NextResponse.json({
        success: true,
        data: deletedNotification,
        message: 'Уведомление удалено'
      });

    } catch (error: any) {
      console.error('💥 API: ошибка удаления уведомления:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления уведомления' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/notifications/[id]/read - Пометка уведомления как прочитанного
export const PUT = withPermissions(
  { resource: 'notifications', action: 'update' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      // Проверка наличия контекста и параметров
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID уведомления не указан' },
          { status: 400 }
        );
      }

      const { id } = context.params;
      const { user } = req;

      console.log(`👁️ API: пометка уведомления как прочитанного ${id}`);

      const notificationIndex = mockNotifications.findIndex((n: any) => n.id === id);
      if (notificationIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Уведомление не найдено' },
          { status: 404 }
        );
      }

      const notification = mockNotifications[notificationIndex];

      // Проверка прав доступа
      if (notification.userId !== user.id && notification.userId !== 'all') {
        return NextResponse.json(
          { success: false, error: 'Нет доступа к данному уведомлению' },
          { status: 403 }
        );
      }

      // Пометка как прочитанное - ИСПРАВЛЕНО: используем правильное поле
      mockNotifications[notificationIndex] = {
        ...notification,
        read: true, // ИСПРАВЛЕНО: используем 'read' вместо 'isRead'
        readAt: new Date().toISOString()
      };

      console.log(`✅ API: уведомление помечено как прочитанное - ${notification.title}`);

      return NextResponse.json({
        success: true,
        data: mockNotifications[notificationIndex],
        message: 'Уведомление помечено как прочитанное'
      });

    } catch (error: any) {
      console.error('💥 API: ошибка пометки уведомления как прочитанного:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка пометки уведомления как прочитанного' },
        { status: 500 }
      );
    }
  }
);

// Вспомогательные функции для работы с уведомлениями

// Функция для валидации данных уведомления - ИСПРАВЛЕНО
export function validateNotificationData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Проверка обязательных полей при создании
  if (data.title !== undefined && (!data.title || typeof data.title !== 'string')) {
    errors.push('Заголовок должен быть непустой строкой');
  }

  if (data.message !== undefined && (!data.message || typeof data.message !== 'string')) {
    errors.push('Сообщение должно быть непустой строкой');
  }

  // Проверка типа уведомления
  const validTypes = ['info', 'success', 'warning', 'error'];
  if (data.type !== undefined && !validTypes.includes(data.type)) {
    errors.push(`Тип должен быть одним из: ${validTypes.join(', ')}`);
  }

  // Проверка приоритета
  const validPriorities = ['low', 'medium', 'high'];
  if (data.priority !== undefined && !validPriorities.includes(data.priority)) {
    errors.push(`Приоритет должен быть одним из: ${validPriorities.join(', ')}`);
  }

  // Проверка булевых значений - ИСПРАВЛЕНО: используем 'read'
  if (data.read !== undefined && typeof data.read !== 'boolean') {
    errors.push('read должно быть булевым значением');
  }

  // Проверка даты
  if (data.readAt !== undefined) {
    const readAt = new Date(data.readAt);
    if (isNaN(readAt.getTime())) {
      errors.push('readAt должно быть валидной датой');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Функция для фильтрации уведомлений по критериям - ИСПРАВЛЕНО
export function filterNotifications(
  notifications: any[],
  filters: {
    userId?: string;
    type?: string;
    priority?: string;
    read?: boolean; // ИСПРАВЛЕНО: используем 'read'
    dateFrom?: string;
    dateTo?: string;
  }
): any[] {
  return notifications.filter(notification => {
    // Фильтр по пользователю
    if (filters.userId && notification.userId !== filters.userId && notification.userId !== 'all') {
      return false;
    }

    // Фильтр по типу
    if (filters.type && notification.type !== filters.type) {
      return false;
    }

    // Фильтр по приоритету
    if (filters.priority && notification.priority !== filters.priority) {
      return false;
    }

    // Фильтр по статусу прочтения - ИСПРАВЛЕНО
    if (filters.read !== undefined && notification.read !== filters.read) {
      return false;
    }

    // Фильтр по дате создания (от)
    if (filters.dateFrom) {
      const notificationDate = new Date(notification.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (notificationDate < fromDate) {
        return false;
      }
    }

    // Фильтр по дате создания (до)
    if (filters.dateTo) {
      const notificationDate = new Date(notification.createdAt);
      const toDate = new Date(filters.dateTo);
      if (notificationDate > toDate) {
        return false;
      }
    }

    return true;
  });
}

// Функция для сортировки уведомлений - ИСПРАВЛЕНО
export function sortNotifications(
  notifications: any[],
  sortBy: 'createdAt' | 'priority' | 'type' | 'read' = 'createdAt', // ИСПРАВЛЕНО
  sortOrder: 'asc' | 'desc' = 'desc'
): any[] {
  return [...notifications].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'read': // ИСПРАВЛЕНО
        aValue = a.read ? 1 : 0;
        bValue = b.read ? 1 : 0;
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

// Функция для группировки уведомлений
export function groupNotifications(
  notifications: any[],
  groupBy: 'type' | 'priority' | 'date' | 'read'
): Record<string, any[]> {
  const groups: Record<string, any[]> = {};

  notifications.forEach(notification => {
    let groupKey: string;

    switch (groupBy) {
      case 'type':
        groupKey = notification.type;
        break;
      case 'priority':
        groupKey = notification.priority;
        break;
      case 'date':
        groupKey = new Date(notification.createdAt).toISOString().split('T')[0];
        break;
      case 'read': // ИСПРАВЛЕНО
        groupKey = notification.read ? 'read' : 'unread';
        break;
      default:
        groupKey = 'other';
    }

    if (!groups[groupKey]) {
            groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
}

// Функция для получения статистики уведомлений - ИСПРАВЛЕНО
export function getNotificationStats(notifications: any[]): {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recent: number; // за последние 24 часа
} {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length, // ИСПРАВЛЕНО
    read: notifications.filter(n => n.read).length, // ИСПРАВЛЕНО
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    recent: notifications.filter(n => new Date(n.createdAt) >= yesterday).length
  };

  // Статистика по типам
  notifications.forEach(notification => {
    stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
  });

  return stats;
}

// Функция для создания уведомления - ИСПРАВЛЕНО
export function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high';
  metadata?: any;
}): any {
  const notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    priority: data.priority || 'medium',
    read: false, // ИСПРАВЛЕНО
    metadata: data.metadata || {},
    createdAt: new Date().toISOString(),
    readAt: null
  };

  return notification;
}

// Функция для массовых операций с уведомлениями - ИСПРАВЛЕНО
export function bulkUpdateNotifications(
  notifications: any[],
  notificationIds: string[],
  updates: {
    read?: boolean; // ИСПРАВЛЕНО
    priority?: string;
  }
): {
  updated: any[];
  notFound: string[];
} {
  const updated: any[] = [];
  const notFound: string[] = [];

  notificationIds.forEach(id => {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = {
        ...notifications[index],
        ...updates,
        ...(updates.read === true && !notifications[index].readAt ? { readAt: new Date().toISOString() } : {})
      };
      updated.push(notifications[index]);
    } else {
      notFound.push(id);
    }
  });

  return { updated, notFound };
}

// Функция для поиска уведомлений
export function searchNotifications(
  notifications: any[],
  query: string,
  searchFields: ('title' | 'message' | 'type')[] = ['title', 'message']
): any[] {
  if (!query.trim()) {
    return notifications;
  }

  const searchTerm = query.toLowerCase().trim();

  return notifications.filter(notification => {
    return searchFields.some(field => {
      const fieldValue = notification[field];
      return fieldValue && fieldValue.toLowerCase().includes(searchTerm);
    });
  });
}

// Функция для экспорта уведомлений - ИСПРАВЛЕНО
export function exportNotifications(
  notifications: any[],
  format: 'json' | 'csv' = 'json'
): string {
  if (format === 'csv') {
    const headers = [
      'ID', 'User ID', 'Title', 'Message', 'Type', 'Priority', 
      'Read', 'Created At', 'Read At' // ИСПРАВЛЕНО
    ];
    
    const csvRows = [
      headers.join(','),
      ...notifications.map(notification => [
        notification.id,
        notification.userId,
        `"${notification.title.replace(/"/g, '""')}"`,
        `"${notification.message.replace(/"/g, '""')}"`,
        notification.type,
        notification.priority,
        notification.read, // ИСПРАВЛЕНО
        notification.createdAt,
        notification.readAt || ''
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  return JSON.stringify(notifications, null, 2);
}

// Функция для создания шаблонов уведомлений - ИСПРАВЛЕНО
export function createNotificationTemplate(
  type: 'session_reminder' | 'session_cancelled' | 'payment_due' | 'welcome' | 'achievement',
  variables: Record<string, any>
): {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
} {
  const templates = {
    session_reminder: {
      title: 'Напоминание о тренировке',
      message: `Напоминаем о тренировке ${variables.date} в ${variables.time} с тренером ${variables.trainerName}`,
      type: 'info' as const,
      priority: 'medium' as const
    },
    session_cancelled: {
      title: 'Тренировка отменена',
      message: `Тренировка ${variables.date} в ${variables.time} была отменена. ${variables.reason || 'Причина не указана'}`,
      type: 'warning' as const,
      priority: 'high' as const
    },
    payment_due: {
      title: 'Напоминание об оплате',
      message: `Необходимо оплатить абонемент до ${variables.dueDate}. Сумма: ${variables.amount} ₽`,
      type: 'warning' as const,
      priority: 'high' as const
    },
    welcome: {
      title: 'Добро пожаловать!',
      message: `Добро пожаловать в наш фитнес-клуб, ${variables.clientName}! Ваш тренер: ${variables.trainerName}`,
      type: 'success' as const,
      priority: 'medium' as const
    },
    achievement: {
      title: 'Поздравляем с достижением!',
      message: `Поздравляем! Вы достигли цели: ${variables.achievement}. Продолжайте в том же духе!`,
      type: 'success' as const,
      priority: 'low' as const
    }
  };

  return templates[type] || {
    title: 'Уведомление',
    message: 'Общее уведомление',
    type: 'info' as const,
    priority: 'medium' as const
  };
}

// Функция для планирования уведомлений
export function scheduleNotification(
  notification: any,
  scheduleTime: Date
): {
  scheduled: boolean;
  scheduledFor: string;
  delay: number;
} {
  const now = new Date();
  const delay = scheduleTime.getTime() - now.getTime();

  if (delay <= 0) {
    return {
      scheduled: false,
      scheduledFor: scheduleTime.toISOString(),
      delay: 0
    };
  }

  // В реальном приложении здесь будет интеграция с системой очередей (Redis, Bull, etc.)
  console.log(`📅 Уведомление запланировано на ${scheduleTime.toISOString()}`);

  return {
    scheduled: true,
    scheduledFor: scheduleTime.toISOString(),
    delay
  };
}

// Функция для автоматического создания уведомлений на основе событий
export function createEventNotification(
  eventType: 'session_created' | 'session_updated' | 'session_cancelled' | 'client_registered' | 'payment_received',
  eventData: any,
  recipientId: string
): any | null {
  const now = new Date();

  switch (eventType) {
    case 'session_created':
      return createNotification({
        userId: recipientId,
        title: 'Новая тренировка запланирована',
        message: `Запланирована тренировка на ${eventData.date} в ${eventData.startTime}`,
        type: 'info',
        priority: 'medium',
        metadata: {
          sessionId: eventData.id,
          eventType: 'session_created'
        }
      });

    case 'session_updated':
      return createNotification({
        userId: recipientId,
        title: 'Тренировка изменена',
        message: `Изменения в тренировке ${eventData.date} в ${eventData.startTime}`,
        type: 'warning',
        priority: 'medium',
        metadata: {
          sessionId: eventData.id,
          eventType: 'session_updated'
        }
      });

    case 'session_cancelled':
      return createNotification({
        userId: recipientId,
        title: 'Тренировка отменена',
        message: `Тренировка ${eventData.date} в ${eventData.startTime} отменена`,
        type: 'error',
        priority: 'high',
        metadata: {
          sessionId: eventData.id,
          eventType: 'session_cancelled'
        }
      });

    case 'client_registered':
      return createNotification({
        userId: recipientId,
        title: 'Новый клиент зарегистрирован',
        message: `Клиент ${eventData.name} успешно зарегистрирован`,
        type: 'success',
        priority: 'low',
        metadata: {
          clientId: eventData.id,
          eventType: 'client_registered'
        }
      });

    case 'payment_received':
      return createNotification({
        userId: recipientId,
        title: 'Платеж получен',
        message: `Получен платеж на сумму ${eventData.amount} ₽`,
        type: 'success',
        priority: 'low',
        metadata: {
          paymentId: eventData.id,
          amount: eventData.amount,
          eventType: 'payment_received'
        }
      });

    default:
      return null;
  }
}

// Функция для проверки и отправки напоминаний
export function checkAndCreateReminders(): any[] {
  const reminders: any[] = [];
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Здесь будет логика проверки предстоящих событий
  // Например, проверка сессий на завтра для создания напоминаний

  console.log(`🔔 Проверка напоминаний: создано ${reminders.length} уведомлений`);
  
  return reminders;
}

// Функция для очистки старых уведомлений
export function cleanupOldNotifications(
  notifications: any[],
  daysToKeep: number = 30
): {
  removed: any[];
  remaining: any[];
} {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const removed: any[] = [];
  const remaining: any[] = [];

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.createdAt);
    if (notificationDate < cutoffDate && notification.read) {
      removed.push(notification);
    } else {
      remaining.push(notification);
    }
  });

  return { removed, remaining };
}

