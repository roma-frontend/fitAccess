// app/api/system/export/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';

// GET /api/system/export/[id] - Получение информации об экспорте
export const GET = withPermissions(
  { resource: 'system', action: 'export' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID экспорта не указан' },
          { status: 400 }
        );
      }

      const { id: exportId } = context.params;
      const { user } = req;

      console.log(`📋 API: получение информации об экспорте ${exportId}`);

      // Проверка прав доступа
      if (user.role === 'trainer' && !exportId.includes(user.id)) {
        return NextResponse.json(
          { success: false, error: 'Нет прав на просмотр этого экспорта' },
          { status: 403 }
        );
      }

      // В реальном приложении здесь был бы поиск в БД
      // Имитация информации об экспорте
      const exportInfo = {
        id: exportId,
        format: exportId.includes('xlsx') ? 'xlsx' : 
                exportId.includes('csv') ? 'csv' : 'json',
        entities: ['trainers', 'clients', 'sessions'],
        totalRecords: 150,
        recordCounts: {
          trainers: user.role === 'trainer' ? 1 : 25,
          clients: user.role === 'trainer' ? 15 : 100,
          sessions: user.role === 'trainer' ? 45 : 200
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        downloadUrl: `/api/system/export/${exportId}/download`,
        fileSize: '2.5 MB',
        createdBy: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        filters: {
          status: 'active',
          dateRange: {
            start: '2024-01-01',
            end: '2024-12-31'
          }
        }
      };

      return NextResponse.json({
        success: true,
        data: exportInfo
      });

    } catch (error) {
      console.error('💥 API: ошибка получения информации об экспорте:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения информации об экспорте' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/system/export/[id] - Удаление конкретного экспорта
export const DELETE = withPermissions(
  { resource: 'system', action: 'export' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID экспорта не указан' },
          { status: 400 }
        );
      }

      const { id: exportId } = context.params;
      const { user } = req;

      console.log(`🗑️ API: удаление экспорта ${exportId}`);

      // Проверка прав доступа
      if (user.role === 'trainer' && !exportId.includes(user.id)) {
        return NextResponse.json(
          { success: false, error: 'Нет прав на удаление этого экспорта' },
          { status: 403 }
        );
      }

      // В реальном приложении здесь было бы удаление файла и записи из БД
      console.log(`✅ API: экспорт удален - ${exportId}`);

      return NextResponse.json({
        success: true,
        message: 'Экспорт успешно удален'
      });

    } catch (error) {
      console.error('💥 API: ошибка удаления экспорта:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления экспорта' },
        { status: 500 }
      );
    }
  }
);
