// app/api/auth/login/route.ts (обновленная версия для БД)
import { NextRequest, NextResponse } from 'next/server';
import { validatePassword } from '@/lib/users-db'; // Используем БД версию
import { createSession } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email и пароль обязательны'
      }, { status: 400 });
    }

    console.log(`🔐 Попытка входа: ${email}`);

    // Проверяем пользователя в базе данных
    const user = await validatePassword(email, password);
    
    if (!user) {
      console.log(`❌ Неверные данные для входа: ${email}`);
      return NextResponse.json({
        success: false,
        error: 'Неверный email или пароль'
      }, { status: 401 });
    }

    if (!user.isActive) {
      console.log(`❌ Пользователь неактивен: ${email}`);
      return NextResponse.json({
        success: false,
        error: 'Аккаунт деактивирован'
      }, { status: 401 });
    }

    // Создаем сессию
    const sessionId = createSession({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    console.log(`✅ Успешный вход: ${user.email} (${user.role})`);

    // Определяем URL для перенаправления
    let dashboardUrl = '/';
    switch (user.role) {
      case 'super-admin':
      case 'admin':
        dashboardUrl = '/admin';
        break;
      case 'manager':
        dashboardUrl = '/manager-dashboard';
        break;
      case 'trainer':
        dashboardUrl = '/trainer-dashboard';
        break;
      case 'member':
        dashboardUrl = '/member-dashboard';
        break;
    }

    const response = NextResponse.json({
      success: true,
      message: 'Авторизация успешна',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      dashboardUrl
    });

    // Устанавливаем cookies
    response.cookies.set('session_id', sessionId, {
            httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    });

    response.cookies.set('session_id_debug', sessionId, {
      maxAge: 7 * 24 * 60 * 60 // 7 дней для отладки
    });

    return response;

  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

