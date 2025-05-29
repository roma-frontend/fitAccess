// app/api/auth/me/route.ts (версия с улучшенной отладкой)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  console.log('🔍 GET /api/auth/me - НАЧАЛО проверки авторизации');
  
  try {
    // Проверяем ВСЕ куки
    const allCookies = request.cookies.getAll();
    console.log('🍪 Все куки в запросе:', allCookies);
    
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('🔑 Session ID:', sessionId ? `найден: ${sessionId.substring(0, 20)}...` : 'отсутствует');
    
    if (!sessionId) {
      console.log('❌ Session ID отсутствует - возвращаем 401');
      return NextResponse.json({ 
        success: false, 
        error: 'Сессия отсутствует' 
      }, { status: 401 });
    }

    console.log('🔧 Вызываем getSession...');
    
    // Получаем данные сессии с дополнительной отладкой
    let sessionData;
    try {
      sessionData = getSession(sessionId);
      console.log('📋 Результат getSession:', sessionData ? 'найдена' : 'не найдена');
    } catch (sessionError) {
      console.error('❌ Ошибка в getSession:', sessionError);
      return NextResponse.json({ 
        success: false, 
        error: 'Ошибка получения сессии' 
      }, { status: 500 });
    }
    
    if (!sessionData) {
      console.log('❌ Сессия не найдена или истекла - возвращаем 401');
      return NextResponse.json({ 
        success: false, 
        error: 'Сессия не найдена' 
      }, { status: 401 });
    }

    console.log('📊 Данные сессии получены:', {
      sessionId: sessionData.id?.substring(0, 20) + '...',
      userId: sessionData.user?.id,
      userName: sessionData.user?.name,
      userRole: sessionData.user?.role,
      createdAt: sessionData.createdAt,
      expiresAt: sessionData.expiresAt
    });

    // Проверяем структуру данных сессии
    if (!sessionData.user) {
      console.error('❌ В сессии отсутствуют данные пользователя');
      return NextResponse.json({ 
        success: false, 
        error: 'Некорректная структура сессии' 
      }, { status: 500 });
    }

    console.log('✅ Сессия валидна для:', sessionData.user.name);
    
    const responseData = {
      success: true,
      user: {
        id: sessionData.user.id,
        name: sessionData.user.name,
        email: sessionData.user.email,
        role: sessionData.user.role
      }
    };

    console.log('📤 Отправляем ответ:', responseData);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ошибка в /api/auth/me:', error);
    console.error('❌ Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');
    
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера при проверке сессии',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
