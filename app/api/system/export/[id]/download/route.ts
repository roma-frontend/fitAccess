// app/api/system/export/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions } from '@/lib/mock-data';

// GET /api/system/export/[id]/download - Скачивание экспорта
export const GET = withPermissions(
  { resource: 'system', action: 'export' },
  async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID экспорта не указан' },
          { status: 400 }
        );
      }

      const { id: exportId } = context.params;
      const { user } = req;

      console.log(`📥 API: скачивание экспорта ${exportId}`);

      // Проверка прав доступа
      if (user.role === 'trainer' && !exportId.includes(user.id)) {
        return NextResponse.json(
          { success: false, error: 'Нет прав на скачивание этого экспорта' },
          { status: 403 }
        );
      }

      // В реальном приложении здесь был бы поиск экспорта в БД
      // Имитация получения данных экспорта
      const format = exportId.includes('xlsx') ? 'xlsx' : 
                    exportId.includes('csv') ? 'csv' : 'json';

      let exportData: any = {};
      let mimeType = 'application/json';
      let fileName = `fitness_export_${new Date().toISOString().split('T')[0]}.json`;

      // Подготовка данных в зависимости от формата
      switch (format) {
        case 'json':
          exportData = {
            metadata: {
              exportedAt: new Date().toISOString(),
              exportedBy: user.id,
              format: 'json',
              version: '1.0'
            },
            trainers: user.role === 'trainer' 
              ? mockTrainers.filter(t => t.id === user.id)
              : mockTrainers,
            clients: user.role === 'trainer'
              ? mockClients.filter(c => c.trainerId === user.id)
              : mockClients,
            sessions: user.role === 'trainer'
              ? mockSessions.filter(s => s.trainerId === user.id)
              : mockSessions
          };
          mimeType = 'application/json';
          fileName = `fitness_export_${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'csv':
          // Для CSV возвращаем простую структуру (в реальном приложении генерировался бы CSV)
          const csvData = generateCSVData(user);
          return new NextResponse(csvData, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="fitness_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
          });

        case 'xlsx':
          // Для XLSX возвращаем имитацию Excel файла
          const xlsxData = generateXLSXData(user);
          return new NextResponse(xlsxData, {
            status: 200,
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="fitness_export_${new Date().toISOString().split('T')[0]}.xlsx"`
            }
          });

        default:
          return NextResponse.json(
            { success: false, error: 'Неподдерживаемый формат экспорта' },
            { status: 400 }
          );
      }

      console.log(`✅ API: экспорт отправлен - ${exportId} (${format})`);

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });

    } catch (error) {
      console.error('💥 API: ошибка скачивания экспорта:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка скачивания экспорта' },
        { status: 500 }
      );
    }
  }
);

// Вспомогательная функция для генерации CSV
function generateCSVData(user: any): string {
  const headers = ['Type', 'ID', 'Name', 'Email', 'Status', 'Created At'];
  let csvContent = headers.join(',') + '\n';

  // Добавляем тренеров
  const trainers = user.role === 'trainer' 
    ? mockTrainers.filter(t => t.id === user.id)
    : mockTrainers;
  
  trainers.forEach(trainer => {
    const row = [
      'Trainer',
      trainer.id,
      `"${trainer.name}"`,
      trainer.email,
      trainer.status,
      trainer.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  // Добавляем клиентов
  const clients = user.role === 'trainer'
    ? mockClients.filter(c => c.trainerId === user.id)
    : mockClients;
  
  clients.forEach(client => {
    const row = [
      'Client',
      client.id,
      `"${client.name}"`,
      client.email,
      client.status,
      client.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  // Добавляем сессии
  const sessions = user.role === 'trainer'
    ? mockSessions.filter(s => s.trainerId === user.id)
    : mockSessions;
  
  sessions.forEach(session => {
    const trainer = mockTrainers.find(t => t.id === session.trainerId);
    const client = mockClients.find(c => c.id === session.clientId);
    
    const row = [
      'Session',
      session.id,
      `"${trainer?.name || 'Unknown'} - ${client?.name || 'Unknown'}"`,
      `${session.date} $${session.startTime}-$${session.endTime}`,
      session.status,
      session.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

// Вспомогательная функция для генерации XLSX (имитация)
function generateXLSXData(user: any): Buffer {
  // В реальном приложении здесь использовалась бы библиотека типа xlsx или exceljs
  // Возвращаем имитацию Excel файла
  const mockXlsxContent = `
Fitness Management System Export
Generated: ${new Date().toISOString()}
User: ${user.id}
Role: ${user.role}

TRAINERS:
${user.role === 'trainer' 
  ? mockTrainers.filter(t => t.id === user.id).map(t => `${t.id},${t.name},${t.email},${t.status}`).join('\n')
  : mockTrainers.map(t => `${t.id},${t.name},${t.email},${t.status}`).join('\n')
}

CLIENTS:
${user.role === 'trainer'
  ? mockClients.filter(c => c.trainerId === user.id).map(c => `${c.id},${c.name},${c.email},${c.status}`).join('\n')
  : mockClients.map(c => `${c.id},${c.name},${c.email},${c.status}`).join('\n')
}

SESSIONS:
${user.role === 'trainer'
  ? mockSessions.filter(s => s.trainerId === user.id).map(s => `${s.id},${s.date},${s.startTime},${s.endTime},${s.status}`).join('\n')
  : mockSessions.map(s => `${s.id},${s.date},${s.startTime},${s.endTime},${s.status}`).join('\n')
}

This would be a real Excel file in production.
  `;
  
  return Buffer.from(mockXlsxContent, 'utf-8');
}

// Дополнительная функция для генерации детального CSV экспорта
function generateDetailedCSVData(user: any): string {
  let csvContent = '';

  // Секция тренеров
  csvContent += 'TRAINERS\n';
  csvContent += 'ID,Name,Email,Phone,Role,Status,Specialization,Experience,Rating,Active Clients,Total Sessions,Hourly Rate,Created At\n';
  
  const trainers = user.role === 'trainer' 
    ? mockTrainers.filter(t => t.id === user.id)
    : mockTrainers;
  
  trainers.forEach(trainer => {
    const row = [
      trainer.id,
      `"${trainer.name}"`,
      trainer.email,
      `"${trainer.phone}"`,
      trainer.role,
      trainer.status,
      `"${trainer.specialization.join('; ')}"`,
      trainer.experience,
      trainer.rating,
      trainer.activeClients,
      trainer.totalSessions,
      trainer.hourlyRate,
      trainer.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\nCLIENTS\n';
  csvContent += 'ID,Name,Email,Phone,Status,Trainer ID,Membership Type,Join Date,Total Sessions,Birth Date,Goals,Created At\n';
  
  const clients = user.role === 'trainer'
    ? mockClients.filter(c => c.trainerId === user.id)
    : mockClients;
  
  clients.forEach(client => {
    const row = [
      client.id,
      `"${client.name}"`,
      client.email,
      `"${client.phone || ''}"`,
      client.status,
      client.trainerId || '',
      client.membershipType,
      client.joinDate,
      client.totalSessions,
      client.birthDate || '',
      `"${client.goals?.join('; ') || ''}"`,
      client.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\nSESSIONS\n';
  csvContent += 'ID,Trainer ID,Client ID,Date,Start Time,End Time,Type,Status,Notes,Created At\n';
  
  const sessions = user.role === 'trainer'
    ? mockSessions.filter(s => s.trainerId === user.id)
    : mockSessions;
  
  sessions.forEach(session => {
    const row = [
      session.id,
      session.trainerId,
      session.clientId,
      session.date,
      session.startTime,
      session.endTime,
      session.type,
      session.status,
      `"${session.notes || ''}"`,
      session.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

// Функция для генерации JSON экспорта с дополнительной статистикой
function generateEnhancedJSONData(user: any): any {
  const trainers = user.role === 'trainer' 
    ? mockTrainers.filter(t => t.id === user.id)
    : mockTrainers;
  
  const clients = user.role === 'trainer'
    ? mockClients.filter(c => c.trainerId === user.id)
    : mockClients;
  
  const sessions = user.role === 'trainer'
    ? mockSessions.filter(s => s.trainerId === user.id)
    : mockSessions;

  // Генерация статистики
  const stats = {
    totalTrainers: trainers.length,
    totalClients: clients.length,
    totalSessions: sessions.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
    cancelledSessions: sessions.filter(s => s.status === 'cancelled').length,
    averageRating: trainers.length > 0 
      ? trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.length 
      : 0,
    totalRevenue: sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, session) => {
        const trainer = trainers.find(t => t.id === session.trainerId);
        return sum + (trainer?.hourlyRate || 0);
      }, 0)
  };

  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
      exportedByRole: user.role,
      format: 'json',
      version: '1.1',
      totalRecords: trainers.length + clients.length + sessions.length
    },
    statistics: stats,
    data: {
      trainers,
      clients,
      sessions
    },
    relationships: {
      trainerClientMapping: clients.reduce((acc: any, client) => {
        if (client.trainerId) {
          if (!acc[client.trainerId]) {
            acc[client.trainerId] = [];
          }
          acc[client.trainerId].push(client.id);
        }
        return acc;
      }, {}),
      clientSessionMapping: sessions.reduce((acc: any, session) => {
        if (!acc[session.clientId]) {
          acc[session.clientId] = [];
        }
        acc[session.clientId].push(session.id);
        return acc;
      }, {})
    }
  };
}
