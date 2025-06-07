// app/api/face-id/disable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ API: Отключаем Face ID...');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ API: Пользователь не авторизован');
      return NextResponse.json({
        success: false,
        error: 'Пользователь не авторизован'
      }, { status: 401 });
    }

    console.log('👤 API: Отключаем Face ID для пользователя:', { id: user.id, email: user.email });

    // Здесь будет реальное удаление из базы данных
    /* 
    const deletedRecords = await db.faceId.deleteMany({
      where: { userId: user.id }
    });
    
    console.log(`🗑️ Удалено записей Face ID: ${deletedRecords.count}`);
    */

    // Имитируем успешное удаление
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('✅ API: Face ID успешно отключен для пользователя', user.id);

    return NextResponse.json({
      success: true,
      message: 'Face ID успешно отключен',
      userId: user.id
    });

  } catch (error) {
    console.error('❌ API: Ошибка отключения Face ID:', error);
    return NextResponse.json({
      success: false,
      error: 'Не удалось отключить Face ID'
    }, { status: 500 });
  }
}
