// app/api/test-auth/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 test-auth: начинаем тест');
    
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('🍪 test-auth: session_id:', sessionId);
    
    // Получаем все cookies правильным способом
    const allCookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
      allCookies[cookie.name] = cookie.value;
    });
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'session_id отсутствует',
        cookies: allCookies
      });
    }

    const session = getSession(sessionId);
    console.log('👤 test-auth: сессия:', session);
    
    return NextResponse.json({
      success: true,
      sessionId,
      session,
      cookies: allCookies
    });

  } catch (error) {
    console.error('❌ test-auth: ошибка:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
    });
  }
}
