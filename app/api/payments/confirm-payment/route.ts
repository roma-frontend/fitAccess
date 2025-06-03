// app/api/payments/confirm-payment/route.ts (альтернативная версия)
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

    // Формируем чек
    const receipt = {
      receiptId: `RCP-${Date.now()}`,
      orderId: order._id,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paidAt: new Date().toISOString(),
      customer: {
        email: paymentIntent.receipt_email || 'customer@example.com',
        name: 'Покупатель',
        userId: order.userId,
      },
      items: order.items?.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.totalPrice,
      })) || [],
      pickupType: order.pickupType,
      notes: order.notes,
      company: {
        name: 'FitAccess',
        address: 'г. Москва, ул. Примерная, д. 1',
        inn: '1234567890',
        phone: '+7 (495) 123-45-67',
        email: 'info@fitaccess.ru',
      },
    };

    console.log('📧 Receipt generated:', receipt.receiptId);

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
