// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';

// Типы для пользователя
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client' | 'manager';
}

// Интерфейсы для аналитики
interface TrainerStats {
  id: string;
  name: string;
  sessions: number;
  clients: number;
  revenue: number;
  rating: number;
}

interface DailyStats {
  date: string;
  sessions: number;
  revenue: number;
  clients: number;
}

interface AnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalSessions: number;
    totalRevenue: number;
    activeClients: number;
    cancelledSessions: number;
    completionRate: number;
  };
  growth: {
    sessions: number;
    revenue: number;
    clients: number;
  };
  dailyStats: DailyStats[];
  topTrainers: TrainerStats[];
  clientRetention: {
    returning: number;
    new: number;
  };
}

// Функция для получения аутентифицированного пользователя
async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    return {
      id: 'user-1',
      name: 'Администратор',
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
  if (user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'manager' && resource === 'analytics') {
    return true;
  }
  
  if (user.role === 'trainer' && resource === 'analytics' && action === 'read') {
    return true;
  }
  
  return false;
}

// Функция для проверки, может ли пользователь видеть данные всех тренеров
function canViewAllTrainers(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'manager';
}

// Функция для проверки, является ли пользователь тренером
function isTrainer(userRole: string): boolean {
  return userRole === 'trainer';
}

// GET /api/analytics - Получение аналитических данных
export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: получение аналитических данных');

    // Проверка аутентификации и прав
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }
    
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month'; // day, week, month, year
    const trainerId = url.searchParams.get('trainerId');

    // Используем mockSessions вместо mockEvents
    let sessions = [...mockSessions];
    let trainers = [...mockTrainers];
    let clients = [...mockClients];

    // Фильтрация данных по правам доступа
    if (isTrainer(user.role)) {
      // Тренеры видят только свою аналитику
      sessions = sessions.filter(s => s.trainerId === user.id);
      trainers = trainers.filter(t => t.id === user.id);
      clients = clients.filter(c => c.trainerId === user.id);
    } else if (trainerId && canViewAllTrainers(user.role)) {
      // Фильтрация по конкретному тренеру (для менеджеров/админов)
      sessions = sessions.filter(s => s.trainerId === trainerId);
      clients = clients.filter(c => c.trainerId === trainerId);
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

    // Фильтрация сессий по периоду
    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= startDate;
    });

    // Расчет метрик
    const completedSessions = periodSessions.filter(s => s.status === 'completed');
    const cancelledSessions = periodSessions.filter(s => s.status === 'cancelled');
    
    // Доходы (примерная цена за тренировку)
    const avgSessionPrice = 2000; // рублей за тренировку
    const totalRevenue = completedSessions.length * avgSessionPrice;
    
    // Предыдущий период для расчета роста
    const prevStartDate = new Date(startDate);
    switch (period) {
      case 'day':
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        break;
      case 'week':
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        break;
      case 'month':
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
        break;
      case 'year':
        prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
        break;
    }

    const prevPeriodSessions = sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= prevStartDate && sessionDate < startDate;
    });
    
    const prevCompletedSessions = prevPeriodSessions.filter(s => s.status === 'completed');
    const prevRevenue = prevCompletedSessions.length * avgSessionPrice;
    
    // Расчет роста
    const revenueGrowth = prevRevenue > 0 
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    const sessionsGrowth = prevCompletedSessions.length > 0
      ? Math.round(((completedSessions.length - prevCompletedSessions.length) / prevCompletedSessions.length) * 100)
      : 0;

    // Активные клиенты в периоде
    const activeClientIds = new Set(completedSessions.map(s => s.clientId));
    const activeClientsCount = activeClientIds.size;
    
    const prevActiveClientIds = new Set(prevCompletedSessions.map(s => s.clientId));
    const clientsGrowth = prevActiveClientIds.size > 0
      ? Math.round(((activeClientsCount - prevActiveClientIds.size) / prevActiveClientIds.size) * 100)
      : 0;

    // Статистика по дням для графиков
    const dailyStats: DailyStats[] = [];
    const days = period === 'year' ? 12 : period === 'month' ? 30 : 7;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      if (period === 'year') {
        date.setMonth(date.getMonth() + i);
      } else {
        date.setDate(date.getDate() + i);
      }
      
      const daySessions = periodSessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        if (period === 'year') {
          return sessionDate.getMonth() === date.getMonth() && 
                 sessionDate.getFullYear() === date.getFullYear();
        } else {
          return sessionDate.toDateString() === date.toDateString();
        }
      });

      const dayCompleted = daySessions.filter(s => s.status === 'completed');
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        sessions: dayCompleted.length,
        revenue: dayCompleted.length * avgSessionPrice,
        clients: new Set(dayCompleted.map(s => s.clientId)).size
      });
    }

    // Топ тренеры (если пользователь может видеть всех)
    let topTrainers: TrainerStats[] = [];
    if (canViewAllTrainers(user.role)) {
      const trainerStats: TrainerStats[] = trainers.map(trainer => {
        const trainerSessions = completedSessions.filter(s => s.trainerId === trainer.id);
        const trainerClients = new Set(trainerSessions.map(s => s.clientId)).size;
        
        return {
          id: trainer.id,
          name: trainer.name,
          sessions: trainerSessions.length,
          clients: trainerClients,
          revenue: trainerSessions.length * avgSessionPrice,
          rating: trainer.rating || 0
        };
      });

      topTrainers = trainerStats
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5);
    }

    const analytics: AnalyticsData = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      summary: {
        totalSessions: completedSessions.length,
        totalRevenue,
        activeClients: activeClientsCount,
        cancelledSessions: cancelledSessions.length,
        completionRate: periodSessions.length > 0 
          ? Math.round((completedSessions.length / periodSessions.length) * 100)
          : 0
      },
      growth: {
        sessions: sessionsGrowth,
        revenue: revenueGrowth,
        clients: clientsGrowth
      },
      dailyStats,
      topTrainers,
      clientRetention: {
        returning: Math.round(activeClientsCount * 0.7), // Примерная статистика
        new: Math.round(activeClientsCount * 0.3)
      }
    };

    console.log(`✅ API: аналитика сформирована для ${user.role} за период ${period}`);

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        period,
        trainerId: isTrainer(user.role) ? user.id : trainerId,
        userRole: user.role,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('💥 API: ошибка получения аналитики:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения аналитических данных' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Создание пользовательского отчета
export async function POST(request: NextRequest) {
  try {
    console.log('📊 API: создание пользовательского отчета');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      metrics = ['sessions', 'revenue', 'clients'],
      groupBy = 'day', // day, week, month
      filters = {}
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Не указаны даты начала и окончания периода' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'Дата начала должна быть раньше даты окончания' },
        { status: 400 }
      );
    }

    // Фильтрация данных
    let sessions = [...mockSessions];
    
    if (isTrainer(user.role)) {
      sessions = sessions.filter(s => s.trainerId === user.id);
    } else if (filters.trainerId && canViewAllTrainers(user.role)) {
      sessions = sessions.filter(s => s.trainerId === filters.trainerId);
    }

    if (filters.clientId) {
      sessions = sessions.filter(s => s.clientId === filters.clientId);
    }

    if (filters.status) {
      sessions = sessions.filter(s => s.status === filters.status);
    }

    if (filters.type) {
      sessions = sessions.filter(s => s.type === filters.type);
    }

    // Фильтрация по периоду
    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= start && sessionDate <= end;
    });

    // Группировка данных
    const groupedData: Record<string, any> = {};
    
    periodSessions.forEach(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      let groupKey: string;

      switch (groupBy) {
        case 'week':
          const weekStart = new Date(sessionDate);
          weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          groupKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
          break;
                default: // day
          groupKey = session.date;
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          date: groupKey,
          sessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          revenue: 0,
          clients: new Set()
        };
      }

      groupedData[groupKey].sessions++;
      if (session.status === 'completed') {
        groupedData[groupKey].completedSessions++;
        groupedData[groupKey].revenue += 2000; // Средняя цена
      }
      if (session.status === 'cancelled') {
        groupedData[groupKey].cancelledSessions++;
      }
      groupedData[groupKey].clients.add(session.clientId);
    });

    // Преобразование в массив и финализация
    const reportData = Object.values(groupedData)
      .map((item: any) => ({
        ...item,
        clients: item.clients.size,
        completionRate: item.sessions > 0 ? Math.round((item.completedSessions / item.sessions) * 100) : 0
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Итоговые метрики
    const totalSessions = periodSessions.length;
    const completedSessions = periodSessions.filter(s => s.status === 'completed').length;
    const totalRevenue = completedSessions * 2000;
    const uniqueClients = new Set(periodSessions.map(s => s.clientId)).size;

    const customReport = {
      period: {
        start: startDate,
        end: endDate,
        groupBy
      },
      filters,
      metrics,
      summary: {
        totalSessions,
        completedSessions,
        totalRevenue,
        uniqueClients,
        averageSessionsPerDay: Math.round(totalSessions / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))),
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      },
      data: reportData
    };

    console.log(`✅ API: пользовательский отчет создан для ${user.role}`);

    return NextResponse.json({
      success: true,
      data: customReport,
      message: 'Пользовательский отчет создан'
    });

  } catch (error: any) {
    console.error('💥 API: ошибка создания отчета:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания пользовательского отчета' },
      { status: 500 }
    );
  }
}

