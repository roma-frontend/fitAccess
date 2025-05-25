import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await convex.query("users:getByEmail", { email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 Проверка пароля для:', email);
    console.log('🔐 Введенный пароль:', password);
    console.log('🗃️ Хеш в базе:', user.password?.substring(0, 20) + '...');
    
    const isValid = await bcrypt.compare(password, user.password);
    
    console.log('✅ Результат сравнения:', isValid);

    return NextResponse.json({
      success: true,
      email: user.email,
      passwordMatch: isValid,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    });
  } catch (error) {
    console.error('❌ Ошибка проверки пароля:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
