// app/api/auth/staff-login/route.ts (обновите существующий файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Ищем пользователя в таблице users
    const user = await convex.query("users:getByEmail", { email });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Аккаунт деактивирован' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Проверяем роль (только персонал)
    const allowedRoles = ['super_admin', 'admin', 'manager', 'trainer', 'staff'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }

    // Обновляем время последнего входа
    await convex.mutation("users:updateLastLogin", {
      userId: user._id,
      timestamp: Date.now()
    });

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Создаем ответ с куки
    const response = NextResponse.json({
      success: true,
      user: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Устанавливаем куки
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 часа
    });

    return response;

  } catch (error) {
    console.error('Ошибка входа персонала:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
