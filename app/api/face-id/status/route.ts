// app/api/face-id/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Проверяем статус Face ID...');
    
    // Получаем текущего пользователя через вашу функцию
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ API: Пользователь не авторизован');
      return NextResponse.json({
        success: false,
        error: 'Пользователь не авторизован'
      }, { status: 401 });
    }

    console.log('👤 API: Пользователь найден:', { id: user.id, email: user.email, role: user.role });

    // Здесь будет реальная проверка в базе данных
    // Пока что имитируем данные на основе ID пользователя
    const mockData = {
      isEnabled: user.id.length % 2 === 0, // Простая имитация на основе ID
      lastUsed: user.id.length % 2 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      dateRegistered: user.id.length % 2 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      deviceCount: user.id.length % 2 === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
    };

    /* 
    // Реальная реализация с базой данных:
    const faceIdRecord = await db.faceId.findUnique({
      where: { userId: user.id }
    });

    const faceIdData = {
      isEnabled: !!faceIdRecord,
      lastUsed: faceIdRecord?.lastUsed?.toISOString(),
      dateRegistered: faceIdRecord?.createdAt?.toISOString(),
      deviceCount: faceIdRecord?.deviceCount || 0,
    };
    */

    console.log('✅ API: Face ID данные для пользователя', user.id, ':', mockData);

    return NextResponse.json({
      success: true,
      userId: user.id,
      ...mockData
    });

  } catch (error) {
    console.error('❌ API: Ошибка проверки Face ID:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}
