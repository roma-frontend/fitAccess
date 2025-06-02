import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Начало процесса регистрации");
    
    // Проверяем подключение к Convex
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.error("❌ NEXT_PUBLIC_CONVEX_URL не установлен");
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    console.log("📝 Данные для регистрации:", { 
      name: name ? "✓" : "✗", 
      email: email ? "✓" : "✗", 
      password: password ? "✓" : "✗",
      emailValue: email // для отладки
    });

    // Валидация входных данных
    if (!name || !email || !password) {
      console.log("❌ Не все поля заполнены");
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log("❌ Пароль слишком короткий");
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем существующих пользователей
    console.log("🔍 Проверяем существующих пользователей...");
    let existingUsers;
    try {
      existingUsers = await convex.query("users:getAll");
      console.log("✅ Получили список пользователей:", existingUsers?.length || 0);
    } catch (convexError) {
      console.error("❌ Ошибка при получении пользователей из Convex:", convexError);
      return NextResponse.json(
        { error: 'Ошибка подключения к базе данных' },
        { status: 500 }
      );
    }

    const existingUser = existingUsers?.find((user: any) => user.email === email);

    if (existingUser) {
      console.log("❌ Пользователь уже существует:", email);
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    console.log("🔐 Хешируем пароль...");
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("✅ Пароль захеширован");
    } catch (hashError) {
      console.error("❌ Ошибка хеширования пароля:", hashError);
      return NextResponse.json(
        { error: 'Ошибка обработки пароля' },
        { status: 500 }
      );
    }

    // Создаем пользователя
    console.log("👤 Создаем пользователя в Convex...");
    let userId;
    try {
      userId = await convex.mutation("users:create", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0ea5e9&color=fff`,
        faceDescriptor: [], // Пустой массив, пока не добавлено лицо
        role: 'member', // Добавляем роль по умолчанию
        createdAt: Date.now(),
        isActive: true
      });
      console.log("✅ Пользователь создан с ID:", userId);
    } catch (createError) {
      console.error("❌ Ошибка создания пользователя в Convex:", createError);
      
      // Более детальная обработка ошибок Convex
      if (createError instanceof Error) {
        console.error("Детали ошибки:", createError.message);
        console.error("Stack trace:", createError.stack);
      }
      
      return NextResponse.json(
        { error: 'Ошибка создания пользователя в базе данных' },
        { status: 500 }
      );
    }

    console.log("🎉 Регистрация успешна:", { userId, name: name.trim(), email: email.trim() });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      userId,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'member'
      }
    });

  } catch (error) {
    console.error('💥 Критическая ошибка регистрации:', error);
    
    // Логируем детали ошибки
    if (error instanceof Error) {
      console.error("Сообщение ошибки:", error.message);
      console.error("Stack trace:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка сервера при регистрации',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}
