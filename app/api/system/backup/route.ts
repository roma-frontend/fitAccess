// app/api/system/backup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockEvents } from '@/lib/mock-data';

// POST /api/system/backup - Создание резервной копии
export const POST = withPermissions(
  { resource: 'system', action: 'backup' },
  async (req) => {
    try {
      console.log('💾 API: создание резервной копии');

      const { user } = req;
      const body = await req.json();
      const { includeDeleted = false, compress = true } = body;

      // Подготовка данных для резервной копии
      let trainers = [...mockTrainers];
      let clients = [...mockClients];
      let events = [...mockEvents];

      if (!includeDeleted) {
        trainers = trainers.filter(t => t.status !== 'deleted');
        clients = clients.filter(c => c.status !== 'deleted');
        events = events.filter(e => e.status !== 'cancelled');
      }

      const backupData = {
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          includeDeleted,
          compressed: compress,
          totalRecords: trainers.length + clients.length + events.length
        },
        data: {
          trainers,
          clients,
          events
        }
      };

      // Имитация создания файла резервной копии
      const backupId = `backup_${Date.now()}`;
      const backupSize = JSON.stringify(backupData).length;

      // В реальном приложении здесь будет сохранение в файловую систему или облако
      console.log(`✅ API: резервная копия создана - ${backupId} (${backupSize} байт)`);

      return NextResponse.json({
        success: true,
        data: {
          backupId,
          size: backupSize,
          records: backupData.metadata.totalRecords,
          createdAt: backupData.metadata.createdAt,
          downloadUrl: `/api/system/backup/${backupId}/download`
        },
        message: 'Резервная копия успешно создана'
      });

    } catch (error) {
      console.error('💥 API: ошибка создания резервной копии:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка создания резервной копии' },
        { status: 500 }
      );
    }
  }
);

// GET /api/system/backup - Получение списка резервных копий
export const GET = withPermissions(
  { resource: 'system', action: 'backup' },
  async (req) => {
    try {
      console.log('📋 API: получение списка резервных копий');

      // Имитация списка резервных копий
      const backups = [
        {
          id: 'backup_1703123456789',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin_1',
          size: 125000,
          records: 150,
          status: 'completed'
        },
        {
          id: 'backup_1703037056789',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin_1',
          size: 118000,
          records: 145,
          status: 'completed'
        },
        {
          id: 'backup_1702950656789',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin_1',
          size: 112000,
          records: 140,
          status: 'completed'
        }
      ];

      return NextResponse.json({
        success: true,
        data: backups,
        total: backups.length
      });

    } catch (error) {
      console.error('💥 API: ошибка получения списка резервных копий:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения списка резервных копий' },
        { status: 500 }
      );
    }
  }
);
