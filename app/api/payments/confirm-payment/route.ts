// app/api/payments/confirm-payment/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await request.json();

    console.log('✅ Confirming payment:', { paymentIntentId, orderId });

    // Получаем информацию о платеже из Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Платеж не был завершен');
    }

    // Используем внутренний API для обновления заказа
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/orders/update-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: paymentIntent.id,
        paidAt: Date.now(),
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Ошибка обновления заказа');
    }

    const { order } = await updateResponse.json();

    // ✅ Безопасное получение email с множественными fallback
    const customerEmail = paymentIntent.receipt_email || 
                         paymentIntent.metadata?.email ||
                         order.customerEmail ||
                         order.memberEmail ||
                         'customer@fitaccess.ru'; // Более подходящий fallback

    // ✅ Безопасное получение имени
    const customerName = paymentIntent.metadata?.customerName ||
                        order.customerName ||
                        order.memberName ||
                        'Покупатель';

    // ✅ Безопасное получение userId
    const userId = order.userId || order.memberId || 'anonymous';

    // Формируем чек с безопасными данными
    const receipt = {
      receiptId: `RCP-${Date.now()}`,
      orderId: order._id,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paidAt: new Date().toISOString(),
      customer: {
        email: customerEmail, // ✅ Гарантированно не null
        name: customerName,   // ✅ Гарантированно не null
        userId: userId,       // ✅ Гарантированно не null
      },
      items: order.items?.map((item: any) => ({
        name: item.productName || 'Товар',
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: item.totalPrice || 0,
      })) || [],
      pickupType: order.pickupType || 'pickup',
      notes: order.notes || '',
      company: {
        name: 'FitAccess',
        address: 'г. Москва, ул. Примерная, д. 1',
        inn: '1234567890',
        phone: '+7 (495) 123-45-67',
        email: 'info@fitaccess.ru',
      },
    };

    console.log('📧 Receipt generated:', receipt.receiptId);
    console.log('👤 Customer data:', receipt.customer); // ✅ Добавляем отладку

    return NextResponse.json({
      success: true,
      receipt,
      order,
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка подтверждения платежа'
      },
      { status: 500 }
    );
  }
}
