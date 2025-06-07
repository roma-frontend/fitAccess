// app/api/face-id/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API: Регистрируем Face ID...');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ API: Пользователь не авторизован');
      return NextResponse.json({
        success: false,
        error: 'Пользователь не авторизован'
      }, { status: 401 });
    }

    const body = await request.json();
    const { faceDescriptor, deviceInfo } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      console.log('❌ API: Некорректный дескриптор лица');
      return NextResponse.json({
        success: false,
        error: 'Дескриптор лица не предоставлен или некорректен'
      }, { status: 400 });
    }

    console.log('👤 API: Регистрируем Face ID для пользователя:', { 
      id: user.id, 
      email: user.email,
      descriptorLength: faceDescriptor.length 
    });

    // Здесь будет реальное сохранение в базе данных
    /* 
    const faceIdRecord = await db.faceId.upsert({
      where: { userId: user.id },
      update: {
        descriptor: JSON.stringify(faceDescriptor),
        deviceInfo: deviceInfo || {},
        updatedAt: new Date(),
        lastUsed: new Date(),
      },
      create: {
        userId: user.id,
        descriptor: JSON.stringify(faceDescriptor),
        deviceInfo: deviceInfo || {},
        deviceCount: 1,
        createdAt: new Date(),
        lastUsed: new Date(),
      },
    });
    
    console.log('💾 Face ID сохранен в базе данных:', faceIdRecord.id);
    */

    // Имитируем успешную регистрацию
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ API: Face ID успешно зарегистрирован для пользователя', user.id);

    return NextResponse.json({
      success: true,
      message: 'Face ID успешно зарегистрирован',
      userId: user.id,
      isEnabled: true,
      dateRegistered: new Date().toISOString(),
      deviceCount: 1,
    });

  } catch (error) {
    console.error('❌ API: Ошибка регистрации Face ID:', error);
    return NextResponse.json({
      success: false,
      error: 'Не удалось зарегистрировать Face ID'
    }, { status: 500 });
  }
}
