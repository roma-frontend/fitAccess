import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log("Попытка регистрации:", { name, email });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    const existingUsers = await convex.query("users:getAll");
    const existingUser = existingUsers.find((user: any) => user.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await convex.mutation("users:create", {
      name,
      email,
      password: hashedPassword,
      photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`,
      faceDescriptor: [], // Пустой массив, пока не добавлено лицо
    });

    console.log("Пользователь зарегистрирован:", { userId, name, email });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      userId
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
