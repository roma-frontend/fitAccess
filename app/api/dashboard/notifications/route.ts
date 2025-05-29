// app/api/dashboard/notifications/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Типы уведомлений
interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
}

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

// Генерация уведомлений на основе данных
function generateNotifications(users: ConvexUser[]): DashboardNotification[] {
  const notifications: DashboardNotification[] = [];
  const now = new Date();
  
  // Проверяем новых пользователей
  const recentUsers = users.filter((user: ConvexUser) => {
    const joinDate = new Date(user.createdAt);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return joinDate >= dayAgo && ['client', 'member'].includes(user.role);
  });

  recentUsers.forEach((user: ConvexUser) => {
    notifications.push({
      id: `new-user-${user._id}`,
      type: 'success',
      title: 'Новый клиент',
      message: `Зарегистрирован новый клиент: ${user.name}`,
      timestamp: new Date(user.createdAt).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: `/admin/users/${user._id}`
    });
  });

  // Проверяем неактивных пользователей
  const inactiveUsers = users.filter((user: ConvexUser) => 
    ['client', 'member'].includes(user.role) && !user.isActive
  );

  if (inactiveUsers.length > 0) {
    notifications.push({
      id: 'inactive-users',
      type: 'warning',
      title: 'Неактивные пользователи',
      message: `${inactiveUsers.length} пользователей деактивированы`,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/admin/users?filter=inactive'
    });
  }

  // Проверяем пользователей без фото
  const usersWithoutPhoto = users.filter((user: ConvexUser) => 
    ['trainer', 'admin'].includes(user.role) && !user.photoUrl
  );

  if (usersWithoutPhoto.length > 0) {
    notifications.push({
      id: 'users-without-photo',
      type: 'info',
      title: 'Профили без фото',
      message: `${usersWithoutPhoto.length} сотрудников не загрузили фото профиля`,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'low',
      actionUrl: '/admin/users?filter=no-photo'
    });
  }

  // Проверяем давно не заходивших пользователей
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const inactiveClients = users.filter((user: ConvexUser) => 
    ['client', 'member'].includes(user.role) && 
    user.isActive &&
    user.lastLogin && 
    new Date(user.lastLogin) < weekAgo
  );

  if (inactiveClients.length > 5) {
    notifications.push({
      id: 'inactive-clients',
      type: 'warning',
      title: 'Клиенты давно не заходили',
      message: `${inactiveClients.length} клиентов не заходили более недели`,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/admin/analytics?view=inactive-clients'
    });
  }

  // Системные уведомления
  notifications.push(
    {
      id: 'system-backup',
      type: 'info',
      title: 'Резервное копирование',
      message: 'Ежедневное резервное копирование выполнено успешно',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low'
    },
    {
      id: 'equipment-maintenance',
      type: 'warning',
      title: 'Плановое обслуживание',
      message: 'Запланировано техническое обслуживание оборудования на завтра',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high'
    },
    {
      id: 'monthly-report',
      type: 'success',
      title: 'Месячный отчет готов',
      message: 'Отчет за текущий месяц сформирован и готов к просмотру',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/admin/reports/monthly'
    }
  );

  // Сортируем по времени (новые сначала)
  return notifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 GET /api/dashboard/notifications - получение уведомлений');
    
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

    console.log('✅ Авторизация пройдена, получаем уведомления...');

    // Получаем данные из Convex
    const users: ConvexUser[] = await convex.query("users:getAll");
    
    console.log('📋 Данные получены, генерируем уведомления...');

    // Генерируем уведомления на основе данных
    const notifications = generateNotifications(users);

    console.log('✅ Уведомления сформированы:', {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      highPriority: notifications.filter(n => n.priority === 'high').length
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byPriority: {
          high: notifications.filter(n => n.priority === 'high').length,
          medium: notifications.filter(n => n.priority === 'medium').length,
          low: notifications.filter(n => n.priority === 'low').length
        },
        byType: {
          info: notifications.filter(n => n.type === 'info').length,
          warning: notifications.filter(n => n.type === 'warning').length,
          error: notifications.filter(n => n.type === 'error').length,
          success: notifications.filter(n => n.type === 'success').length
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения уведомлений:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения уведомлений',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// POST для отметки уведомления как прочитанного
export async function POST(request: NextRequest) {
  try {
    console.log('✅ POST /api/dashboard/notifications - отметка как прочитанное');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    console.log('📝 Действие с уведомлением:', { notificationId, action });

    // В реальном приложении здесь была бы логика сохранения в БД
    // Пока просто возвращаем успех
    
    return NextResponse.json({
      success: true,
      message: `Уведомление ${notificationId} отмечено как ${action === 'read' ? 'прочитанное' : 'обработанное'}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Ошибка обработки уведомления:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка обработки уведомления' 
      },
      { status: 500 }
    );
  }
}

// DELETE для удаления уведомления
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/dashboard/notifications - удаление уведомления');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'ID уведомления не указан' }, { status: 400 });
    }

    console.log('🗑️ Удаление уведомления:', notificationId);

    // В реальном приложении здесь была бы логика удаления из БД
    
    return NextResponse.json({
      success: true,
      message: `Уведомление ${notificationId} удалено`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Ошибка удаления уведомления:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка удаления уведомления' 
      },
      { status: 500 }
    );
  }
}
