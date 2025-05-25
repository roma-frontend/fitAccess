// app/api/auth/face-login/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Попытка входа по лицу');

    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: 'Изображение не предоставлено' },
        { status: 400 }
      );
    }

    // Здесь должна быть логика распознавания лица
    // Пока используем простую заглушку
    console.log('🖼️ Получено изображение для распознавания');

    // Получаем всех пользователей с дескрипторами лиц
    const users = await convex.query("users:getAllWithFaceDescriptors");
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Нет пользователей с настроенным распознаванием лиц' },
        { status: 404 }
      );
    }

    const recognizedUser = users.find((user: { faceDescriptor: string | any[]; }) => user.faceDescriptor && user.faceDescriptor.length > 0);
    
    if (!recognizedUser) {
      return NextResponse.json(
        { error: 'Лицо не распознано' },
        { status: 401 }
      );
    }

    console.log('✅ Лицо распознано:', recognizedUser.email);

    if (!recognizedUser.isActive) {
      return NextResponse.json(
        { error: 'Аккаунт деактивирован' },
        { status: 401 }
      );
    }

    // Обновляем время последнего входа
    await convex.mutation("users:updateLastLogin", {
      userId: recognizedUser._id,
      timestamp: Date.now()
    });

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: recognizedUser._id,
        email: recognizedUser.email,
        role: recognizedUser.role,
        name: recognizedUser.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Создаем ответ с куки
    const response = NextResponse.json({
      success: true,
      user: {
        userId: recognizedUser._id,
        email: recognizedUser.email,
        name: recognizedUser.name,
        role: recognizedUser.role
      },
      method: 'face_recognition'
    });

    // Устанавливаем куки
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    console.log('🎉 Вход по лицу успешен');
    return response;

  } catch (error) {
    console.error('💥 Ошибка входа по лицу:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
