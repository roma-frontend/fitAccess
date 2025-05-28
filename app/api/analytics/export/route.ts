// app/api/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';

// Типы для пользователя (адаптируйте под вашу структуру)
interface User {
  id: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
}

// Функция для получения аутентифицированного пользователя
async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  // Здесь должна быть ваша логика аутентификации
  // Например, проверка JWT токена из headers или cookies
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    // Здесь должна быть проверка токена и получение пользователя
    // Для примера возвращаем мок-пользователя
    return {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin'
    };
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return null;
  }
}

// Функция проверки прав
function hasPermission(user: User, resource: string, action: string): boolean {
  // Здесь должна быть ваша логика проверки прав
  // Для примера: админы могут все, тренеры могут читать свои данные
  if (user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'trainer' && resource === 'analytics' && action === 'read') {
    return true;
  }
  
  return false;
}

// GET /api/analytics/export - Экспорт аналитических данных
export async function GET(request: NextRequest) {
  try {
    console.log('📤 API: экспорт аналитических данных');

    // Проверка аутентификации и прав
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Проверка прав на чтение аналитики
    if (!hasPermission(user, 'analytics', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv'; // csv, json, xlsx
    const period = url.searchParams.get('period') || 'month';
    const trainerId = url.searchParams.get('trainerId');

    // Фильтрация данных по правам доступа
    let sessions = [...mockSessions];
    
    if (user.role === 'trainer') {
      sessions = sessions.filter(s => s.trainerId === user.id);
    } else if (trainerId) {
      sessions = sessions.filter(s => s.trainerId === trainerId);
    }

    // Определение временного периода
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= startDate;
    });

    // Подготовка данных для экспорта
    const exportData = periodSessions.map(session => {
      const trainer = mockTrainers.find(t => t.id === session.trainerId);
      const client = mockClients.find(c => c.id === session.clientId);
      
      return {
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        trainerName: trainer?.name || 'Неизвестно',
        clientName: client?.name || 'Неизвестно',
        type: session.type,
        status: session.status,
        notes: session.notes || '',
        revenue: session.status === 'completed' ? 2000 : 0
      };
    });

    // Статистика
    const completedSessions = periodSessions.filter(s => s.status === 'completed');
    const summary = {
      totalSessions: periodSessions.length,
      completedSessions: completedSessions.length,
      cancelledSessions: periodSessions.filter(s => s.status === 'cancelled').length,
      totalRevenue: completedSessions.length * 2000,
      uniqueClients: new Set(periodSessions.map(s => s.clientId)).size,
      period,
      exportDate: new Date().toISOString()
    };

    if (format === 'csv') {
      // CSV формат
      const csvHeaders = [
        'Дата',
        'Время начала',
        'Время окончания', 
        'Тренер',
        'Клиент',
        'Тип',
        'Статус',
        'Заметки',
        'Доход'
      ].join(',');

      const csvRows = exportData.map(row => [
        row.date,
        row.startTime,
        row.endTime,
        `"${row.trainerName}"`,
        `"${row.clientName}"`,
        row.type,
        row.status,
        `"${row.notes}"`,
        row.revenue
      ].join(','));

      const csvContent = [
        csvHeaders,
        ...csvRows,
        '',
        'Итоговая статистика:',
        `Всего сессий,${summary.totalSessions}`,
        `Завершенных сессий,${summary.completedSessions}`,
        `Отмененных сессий,${summary.cancelledSessions}`,
        `Общий доход,${summary.totalRevenue}`,
        `Уникальных клиентов,${summary.uniqueClients}`,
        `Период,${summary.period}`,
        `Дата экспорта,${summary.exportDate}`
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="analytics_${period}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // JSON формат
    const jsonData = {
      summary,
      sessions: exportData,
      exportInfo: {
        format,
        period,
        trainerId: user.role === 'trainer' ? user.id : trainerId,
        exportedBy: user.email,
        exportDate: new Date().toISOString()
      }
    };

    if (format === 'json') {
      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="analytics_${period}_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    // Для других форматов возвращаем JSON
    return NextResponse.json({
      success: true,
      data: jsonData,
      message: 'Данные подготовлены для экспорта'
    });

  } catch (error: any) {
    console.error('💥 API: ошибка экспорта аналитики:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка экспорта аналитических данных' },
      { status: 500 }
    );
  }
}
