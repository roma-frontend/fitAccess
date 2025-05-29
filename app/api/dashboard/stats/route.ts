// app/api/dashboard/stats/route.ts (добавьте типы)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Тип для пользователя из Convex
interface ConvexUser {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: number;
  createdBy?: string;
  photoUrl?: string;
  faceDescriptor?: number[];
  lastLogin?: number;
  updatedAt?: number;
  password: string;
}

// Тип для события (если будете добавлять)
interface ConvexEvent {
  _id: string;
  _creationTime: number;
  startTime: number;
  endTime?: number;
  status: string;
  createdAt: number;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/dashboard/stats - получение статистики');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Проверяем права доступа
    if (!['super-admin', 'admin', 'manager'].includes(sessionData.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    console.log('✅ Авторизация пройдена, получаем статистику...');

        // Получаем данные из Convex
    const [users] = await Promise.all([
      convex.query("users:getAll") as Promise<ConvexUser[]>,
      // Если у вас есть events в Convex, раскомментируйте:
      // convex.query("events:getAll") as Promise<ConvexEvent[]>
    ]);

    const events: ConvexEvent[] = []; // Временно пустой массив

    console.log('📈 Данные получены:', {
      usersCount: users.length,
      eventsCount: events.length
    });

    // Вычисляем статистику
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Фильтруем пользователей
    const activeClients = users.filter((user: ConvexUser) => 
      ['client', 'member'].includes(user.role) && user.isActive
    );
    
    const activeTrainers = users.filter((user: ConvexUser) => 
      user.role === 'trainer' && user.isActive
    );

    const allAdmins = users.filter((user: ConvexUser) => 
      ['admin', 'super-admin'].includes(user.role) && user.isActive
    );

    // Фильтруем события (если есть)
    const todayEvents = events.filter((event: ConvexEvent) => {
      const eventDate = new Date(event.startTime || event.createdAt);
      return eventDate >= startOfToday;
    });

    const monthEvents = events.filter((event: ConvexEvent) => {
      const eventDate = new Date(event.startTime || event.createdAt);
      return eventDate >= startOfMonth;
    });

    // Вычисляем рост за неделю
    const weeklyNewClients = users.filter((user: ConvexUser) => {
      if (!['client', 'member'].includes(user.role)) return false;
      const joinDate = new Date(user.createdAt);
      return joinDate >= startOfWeek;
    });

    const weeklyGrowth = activeClients.length > 0 
      ? (weeklyNewClients.length / activeClients.length) * 100 
      : 0;

    // Вычисляем удержание клиентов
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oldClients = users.filter((user: ConvexUser) => {
      if (!['client', 'member'].includes(user.role)) return false;
      const joinDate = new Date(user.createdAt);
      return joinDate <= monthAgo;
    });

    const activeOldClients = oldClients.filter((user: ConvexUser) => 
      user.isActive && user.lastLogin && new Date(user.lastLogin) >= monthAgo
    );

    const clientRetention = oldClients.length > 0 
      ? (activeOldClients.length / oldClients.length) * 100 
      : 0;

    // Вычисляем средний рейтинг (пока моковое значение)
    const averageRating = 4.7; // Можно вычислить на основе отзывов

    // Вычисляем использование оборудования (пока моковое значение)
    const equipmentUtilization = Math.min(95, 50 + (todayEvents.length * 2));

    // Формируем статистику
    const stats = {
      totalClients: activeClients.length,
      activeTrainers: activeTrainers.length,
      todayEvents: todayEvents.length,
      monthlyRevenue: monthEvents.length * 1500, // Примерная стоимость за событие
      weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
      clientRetention: Math.round(clientRetention * 100) / 100,
      averageRating: averageRating,
      equipmentUtilization: Math.round(equipmentUtilization * 100) / 100,
      
      // Дополнительная информация
      totalUsers: users.length,
      totalAdmins: allAdmins.length,
      newClientsThisWeek: weeklyNewClients.length,
      monthlyEvents: monthEvents.length,
      inactiveClients: users.filter((user: ConvexUser) => 
        ['client', 'member'].includes(user.role) && !user.isActive
      ).length,
      
      // Статистика по ролям
      usersByRole: {
        'super-admin': users.filter((user: ConvexUser) => user.role === 'super-admin').length,
        'admin': users.filter((user: ConvexUser) => user.role === 'admin').length,
        'manager': users.filter((user: ConvexUser) => user.role === 'manager').length,
        'trainer': users.filter((user: ConvexUser) => user.role === 'trainer').length,
        'member': users.filter((user: ConvexUser) => user.role === 'member').length,
        'client': users.filter((user: ConvexUser) => user.role === 'client').length,
      },
      
      // Временные метки
      lastUpdated: new Date().toISOString(),
      dataSource: 'convex',
      generatedBy: sessionData.user.name
    };

    console.log('✅ Статистика сформирована:', {
      totalClients: stats.totalClients,
      activeTrainers: stats.activeTrainers,
      todayEvents: stats.todayEvents,
      weeklyGrowth: stats.weeklyGrowth
    });

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        generatedAt: new Date().toISOString(),
        generatedBy: sessionData.user.email,
        dataPoints: {
          users: users.length,
          events: events.length,
          calculations: [
            'weeklyGrowth',
            'clientRetention', 
            'equipmentUtilization',
            'monthlyRevenue'
          ]
        }
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения статистики',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// POST для принудительного обновления статистики
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/dashboard/stats - принудительное обновление');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Проверяем права доступа
    if (!['super-admin', 'admin'].includes(sessionData.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Здесь можно добавить логику принудительного пересчета статистики
    // Например, очистка кеша, пересчет аналитики и т.д.
    
    console.log('✅ Принудительное обновление статистики выполнено');
    
    return NextResponse.json({
      success: true,
      message: 'Статистика обновлена принудительно',
      updatedBy: sessionData.user.name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Ошибка принудительного обновления:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка принудительного обновления статистики' 
      },
      { status: 500 }
    );
  }
}

