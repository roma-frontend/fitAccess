// app/api/payments/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/simple-auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Создание Payment Intent - начало');
    
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
        error: 'Не авторизован. Войдите в систему для оформления заказа.' 
      }, { status: 401 });
    }

    // Проверяем, что это участник
    if (authData.user.role !== 'member') {
      console.log('❌ Доступ запрещен для роли:', authData.user.role);
      return NextResponse.json({ 
        error: 'Покупки доступны только участникам фитнес-центра.' 
      }, { status: 403 });
    }

    const { items, totalAmount, pickupType, notes } = await request.json();
    
    console.log('📝 Данные платежа:', {
      itemsCount: items?.length,
      totalAmount,
      pickupType,
      userEmail: authData.user.email
    });

    // Валидация данных
    if (!items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Корзина пуста' 
      }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ 
        error: 'Некорректная сумма заказа' 
      }, { status: 400 });
    }

    console.log('✅ Создаем Payment Intent в Stripe...');

    // Создаем Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe работает в копейках
      currency: 'rub',
      metadata: {
        userId: authData.user.id,
        userEmail: authData.user.email,
        userName: authData.user.name,
        pickupType,
        notes: notes || '',
        itemsCount: items.length.toString(),
      },
      description: `Заказ в FitAccess - ${items.length} товаров`,
      receipt_email: authData.user.email,
    });

    console.log('✅ Payment Intent создан:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('💥 Ошибка создания платежа:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Ошибка создания платежа'
    }, { status: 500 });
  }
}