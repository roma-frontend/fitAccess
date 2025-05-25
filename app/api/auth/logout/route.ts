// app/api/auth/logout/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('API logout: начинаем выход из системы');

    // Получаем session_id из cookies
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const finalSessionId = sessionId || sessionIdDebug;

    console.log('API logout: session_id найден:', !!finalSessionId);

    // Удаляем сессию из хранилища если она есть
    if (finalSessionId) {
      try {
        deleteSession(finalSessionId);
        console.log('API logout: сессия удалена из хранилища');
      } catch (error) {
        console.log('API logout: ошибка удаления сессии:', error);
        // Не критично, продолжаем
      }
    }

    // Создаем ответ
    const response = NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно'
    });

    // Удаляем все auth cookies
    response.cookies.delete('session_id');
    response.cookies.delete('session_id_debug');
    response.cookies.delete('auth_token');

    console.log('API logout: cookies удалены');
    console.log('API logout: выход выполнен успешно');

    return response;

  } catch (error) {
    console.error('API logout: ошибка выхода:', error);
    
    // Даже при ошибке удаляем cookies
    const response = NextResponse.json({
      success: false,
      error: 'Ошибка выхода из системы'
    }, { status: 500 });

    response.cookies.delete('session_id');
    response.cookies.delete('session_id_debug');
    response.cookies.delete('auth_token');

    return response;
  }
}
