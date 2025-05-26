// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockNotifications } from '../../route';

// PUT /api/notifications/[id]/read - Отметка уведомления как прочитанного
export const PUT = withPermissions(
  { resource: 'notifications', action: 'update' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID уведомления не указан' },
          { status: 400 }
        );
      }

      const { id } = context.params;
      const { user } = req;

      console.log(`📖 API: отметка уведомления как прочитанного ${id}`);

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

      // Проверка, не прочитано ли уже
      if (notification.read) {
        return NextResponse.json({
          success: true,
          data: notification,
          message: 'Уведомление уже отмечено как прочитанное'
        });
      }

      // Отметка как прочитанного
      mockNotifications[notificationIndex] = {
        ...notification,
        read: true,
        readAt: new Date().toISOString()
      };

      console.log(`✅ API: уведомление отмечено как прочитанное - ${notification.title}`);

      return NextResponse.json({
        success: true,
        data: mockNotifications[notificationIndex],
        message: 'Уведомление отмечено как прочитанное'
      });

    } catch (error: any) {
      console.error('💥 API: ошибка отметки уведомления:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка отметки уведомления как прочитанного' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/notifications/[id]/read - Отметка уведомления как непрочитанного
export const DELETE = withPermissions(
  { resource: 'notifications', action: 'update' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID уведомления не указан' },
          { status: 400 }
        );
      }

      const { id } = context.params;
      const { user } = req;

      console.log(`📖 API: отметка уведомления как непрочитанного ${id}`);

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

      // Отметка как непрочитанного
      mockNotifications[notificationIndex] = {
        ...notification,
        read: false,
        readAt: undefined
      };

      console.log(`✅ API: уведомление отмечено как непрочитанное - ${notification.title}`);

      return NextResponse.json({
        success: true,
        data: mockNotifications[notificationIndex],
        message: 'Уведомление отмечено как непрочитанное'
      });

    } catch (error: any) {
      console.error('💥ошибка отметки уведомления:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка отметки уведомления как непрочитанного' },
        { status: 500 }
      );
    }
  }
);
