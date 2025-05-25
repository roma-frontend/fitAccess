// app/api/orders/create/route.ts (убираем проверку товаров)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Создание заказа - начало');

    // Проверяем авторизацию через основную систему
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    
    const authData = await authResponse.json();
    console.log('🍪 Auth check result:', authData);
    
    if (!authData.authenticated) {
      console.log('❌ Пользователь не авторизован');
      return NextResponse.json({ 
        error: 'Не авторизован' 
      }, { status: 401 });
    }

    // Проверяем, что это участник
    if (authData.user.role !== 'member') {
      console.log('❌ Доступ запрещен для роли:', authData.user.role);
      return NextResponse.json({ 
        error: 'Заказы могут создавать только участники фитнес-центра' 
      }, { status: 403 });
    }

    const body = await request.json();
    console.log('📝 Данные заказа:', body);
    
    const {
      items,
      totalAmount,
      pickupType,
      paymentMethod,
      notes,
      status = 'pending',
      paymentIntentId,
      paymentId
    } = body;

    // Валидация данных
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Некорректная сумма заказа' },
        { status: 400 }
      );
    }

    // Генерируем ID заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    console.log('✅ Создаем заказ в Convex...');

    // Подготавливаем данные товаров для Convex
    const processedItems = items.map((item: any) => ({
      productId: item.productId ? String(item.productId) : undefined, // Преобразуем в строку
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
    }));

    console.log('📝 Обработанные товары:', processedItems);

    // Создаем заказ
    const orderId = await convex.mutation("orders:create", {
      memberId: authData.user.id,
      items: processedItems,
      totalAmount,
      status,
      pickupType,
      paymentMethod,
      notes: notes || undefined,
      orderTime: Date.now(),
      estimatedReadyTime: Date.now() + (15 * 60 * 1000), // +15 минут
      
      // Данные платежа
      paymentIntentId: paymentIntentId || undefined,
      paymentId: paymentId || undefined,
      paymentStatus: paymentMethod === 'card' ? 'pending' : 'completed',
    });

    console.log('✅ Заказ создан с ID:', orderId);

    // Создаем уведомления (опционально)
    try {
      // Уведомление для участника
      await convex.mutation("notifications:create", {
        recipientId: authData.user.id,
        recipientType: "member",
        title: "Заказ принят",
        message: `Ваш заказ №${orderNumber} на сумму ${totalAmount} ₽ принят в обработку`,
        type: "order",
        relatedId: orderId,
        createdAt: Date.now(),
        isRead: false,
      });

      console.log('✅ Уведомления созданы');
    } catch (error) {
      console.log('⚠️ Не удалось создать уведомления (возможно, нет API notifications):', error);
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: 'Заказ создан успешно'
    });

  } catch (error) {
    console.error('💥 Ошибка создания заказа:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка создания заказа',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
