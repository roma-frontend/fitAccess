// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';

// Интерфейс для уведомления
interface Notification {
  id: string;
  userId: string | 'all';
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Mock данные для уведомлений
let mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'all',
    type: 'info',
    title: 'Системное обновление',
    message: 'Система будет обновлена сегодня в 23:00',
    read: false,
    createdAt: '2024-01-20T10:00:00Z',
    priority: 'medium',
    category: 'system'
  },
  {
    id: 'notif_2',
    userId: 'trainer_1',
    type: 'success',
    title: 'Новый клиент',
    message: 'К вам записался новый клиент - Анна Иванова',
    read: false,
    createdAt: '2024-01-20T11:30:00Z',
    priority: 'high',
    category: 'client',
    actionUrl: '/clients/client_1'
  },
  {
    id: 'notif_3',
    userId: 'trainer_1',
    type: 'warning',
    title: 'Отмена тренировки',
    message: 'Клиент Петр Сидоров отменил тренировку на завтра',
    read: true,
    readAt: '2024-01-20T12:00:00Z',
    createdAt: '2024-01-20T09:15:00Z',
    priority: 'medium',
    category: 'session'
  },
  {
    id: 'notif_4',
    userId: 'client_1',
    type: 'info',
    title: 'Напоминание о тренировке',
    message: 'Ваша тренировка начнется через час',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 минут назад
    priority: 'high',
    category: 'reminder'
  },
  {
    id: 'notif_5',
    userId: 'admin_1',
    type: 'error',
    title: 'Ошибка системы',
    message: 'Обнаружена ошибка в модуле платежей',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
    priority: 'high',
    category: 'system'
  }
];

// GET /api/notifications - Получение уведомлений пользователя
export const GET = withPermissions(
  { resource: 'notifications', action: 'read' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('🔔 API: получение уведомлений');

      const { user } = req;
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
      const category = url.searchParams.get('category');
      const priority = url.searchParams.get('priority');
      const type = url.searchParams.get('type');

      // Фильтрация уведомлений для текущего пользователя
      let userNotifications = mockNotifications.filter((notification: Notification) => 
        notification.userId === user.id || notification.userId === 'all'
      );

      // Дополнительные фильтры
      if (unreadOnly) {
        userNotifications = userNotifications.filter((n: Notification) => !n.read);
      }

      if (category) {
        userNotifications = userNotifications.filter((n: Notification) => n.category === category);
      }

      if (priority) {
        userNotifications = userNotifications.filter((n: Notification) => n.priority === priority);
      }

      if (type) {
        userNotifications = userNotifications.filter((n: Notification) => n.type === type);
      }

      // Сортировка по дате создания (новые сначала)
      userNotifications.sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Пагинация
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

      // Статистика
      const stats = {
        total: userNotifications.length,
        unread: userNotifications.filter((n: Notification) => !n.read).length,
        byPriority: {
          high: userNotifications.filter((n: Notification) => n.priority === 'high').length,
          medium: userNotifications.filter((n: Notification) => n.priority === 'medium').length,
          low: userNotifications.filter((n: Notification) => n.priority === 'low').length
        },
        byType: {
          info: userNotifications.filter((n: Notification) => n.type === 'info').length,
          warning: userNotifications.filter((n: Notification) => n.type === 'warning').length,
          error: userNotifications.filter((n: Notification) => n.type === 'error').length,
          success: userNotifications.filter((n: Notification) => n.type === 'success').length
        }
      };

      return NextResponse.json({
        success: true,
        data: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: userNotifications.length,
          pages: Math.ceil(userNotifications.length / limit)
        },
        stats,
        filters: {
          unreadOnly,
          category,
          priority,
          type
        }
      });

    } catch (error: any) {
      console.error('💥 API: ошибка получения уведомлений:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения уведомлений' },
        { status: 500 }
      );
    }
  }
);

// POST /api/notifications - Создание нового уведомления
export const POST = withPermissions(
  { resource: 'notifications', action: 'create' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('➕ API: создание уведомления');

      const body = await req.json();
      const { user } = req;

      // Валидация обязательных полей
      if (!body.title || !body.message) {
        return NextResponse.json(
          { success: false, error: 'Отсутствуют обязательные поля (title, message)' },
          { status: 400 }
        );
      }

      // Валидация типа
      const validTypes = ['info', 'warning', 'error', 'success'];
      if (body.type && !validTypes.includes(body.type)) {
        return NextResponse.json(
          { success: false, error: 'Некорректный тип уведомления' },
          { status: 400 }
        );
      }

      // Валидация приоритета
      const validPriorities = ['low', 'medium', 'high'];
      if (body.priority && !validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { success: false, error: 'Некорректный приоритет' },
          { status: 400 }
        );
      }

      // Создание уведомления
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        userId: body.userId || user.id,
        type: body.type || 'info',
        title: body.title,
                message: body.message,
        read: false,
        createdAt: new Date().toISOString(),
        priority: body.priority || 'medium',
        category: body.category,
        actionUrl: body.actionUrl,
        metadata: body.metadata
      };

      mockNotifications.push(newNotification);

      console.log(`✅ API: уведомление создано - ${newNotification.title}`);

      return NextResponse.json({
        success: true,
        data: newNotification,
        message: 'Уведомление создано'
      });

    } catch (error: any) {
      console.error('💥 API: ошибка создания уведомления:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка создания уведомления' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/notifications - Массовая отметка уведомлений как прочитанных
export const PUT = withPermissions(
  { resource: 'notifications', action: 'update' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('📖 API: массовая отметка уведомлений как прочитанных');

      const body = await req.json();
      const { user } = req;
      const { notificationIds, markAllAsRead = false } = body;

      let updatedCount = 0;

      if (markAllAsRead) {
        // Отметить все уведомления пользователя как прочитанные
        mockNotifications.forEach((notification: Notification, index: number) => {
          if ((notification.userId === user.id || notification.userId === 'all') && !notification.read) {
            mockNotifications[index] = {
              ...notification,
              read: true,
              readAt: new Date().toISOString()
            };
            updatedCount++;
          }
        });
      } else if (notificationIds && Array.isArray(notificationIds)) {
        // Отметить указанные уведомления как прочитанные
        notificationIds.forEach((id: string) => {
          const notificationIndex = mockNotifications.findIndex((n: Notification) => n.id === id);
          if (notificationIndex !== -1) {
            const notification = mockNotifications[notificationIndex];
            if ((notification.userId === user.id || notification.userId === 'all') && !notification.read) {
              mockNotifications[notificationIndex] = {
                ...notification,
                read: true,
                readAt: new Date().toISOString()
              };
              updatedCount++;
            }
          }
        });
      }

      console.log(`✅ API: отмечено ${updatedCount} уведомлений как прочитанных`);

      return NextResponse.json({
        success: true,
        data: { updatedCount },
        message: `Отмечено ${updatedCount} уведомлений как прочитанных`
      });

    } catch (error: any) {
      console.error('💥 API: ошибка массовой отметки уведомлений:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка массовой отметки уведомлений' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/notifications - Удаление уведомлений
export const DELETE = withPermissions(
  { resource: 'notifications', action: 'delete' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('🗑️ API: удаление уведомлений');

      const body = await req.json();
      const { user } = req;
      const { notificationIds, deleteAllRead = false } = body;

      let deletedCount = 0;

      if (deleteAllRead) {
        // Удалить все прочитанные уведомления пользователя
        const initialLength = mockNotifications.length;
        mockNotifications = mockNotifications.filter((notification: Notification) => {
          const shouldDelete = (notification.userId === user.id || notification.userId === 'all') && notification.read;
          if (shouldDelete) deletedCount++;
          return !shouldDelete;
        });
      } else if (notificationIds && Array.isArray(notificationIds)) {
        // Удалить указанные уведомления
        const initialLength = mockNotifications.length;
        mockNotifications = mockNotifications.filter((notification: Notification) => {
          const shouldDelete = notificationIds.includes(notification.id) && 
                               (notification.userId === user.id || notification.userId === 'all');
          if (shouldDelete) deletedCount++;
          return !shouldDelete;
        });
      }

      console.log(`✅ API: удалено ${deletedCount} уведомлений`);

      return NextResponse.json({
        success: true,
        data: { deletedCount },
        message: `Удалено ${deletedCount} уведомлений`
      });

    } catch (error: any) {
      console.error('💥 API: ошибка удаления уведомлений:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления уведомлений' },
        { status: 500 }
      );
    }
  }
);

// Экспорт mock данных для использования в других файлах
export { mockNotifications };

