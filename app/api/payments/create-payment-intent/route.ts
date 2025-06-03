// app/api/payments/create-payment-intent/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { items, totalAmount, pickupType, notes, userId } = await request.json();

    console.log('💳 Creating payment intent:', {
      totalAmount,
      itemsCount: items?.length,
      pickupType,
      userId,
      items: items?.map((item: any) => ({ 
        productId: item.productId, 
        name: item.productName || item.name 
      }))
    });

    // Валидация данных
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Товары не указаны' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Неверная сумма заказа' },
        { status: 400 }
      );
    }

    // Создаем Payment Intent в Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'rub',
      metadata: {
        userId: userId || 'anonymous',
        pickupType,
        itemsCount: items.length.toString(),
        notes: notes || '',
      },
      description: `Заказ магазина - ${items.length} товаров`,
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    // Подготавливаем items для Convex
    const convexItems = items.map((item: any) => {
      let productId = item.productId;
      
      // Если productId выглядит как Convex ID, используем его
      if (typeof productId === 'string' && productId.startsWith('k')) {
        // Это уже правильный Convex ID
      } else {
        // Если это не Convex ID, преобразуем в строку
        productId = String(productId);
      }
      
      return {
        productId,
        productName: item.productName || item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice || (item.price * item.quantity),
      };
    });

    console.log('📦 Prepared items for Convex:', convexItems);

    // Создаем заказ в Convex - ИСПРАВЛЕНО: убрали api.orders.create
    const orderId = await convex.mutation("orders:create", {
      userId,
      items: convexItems,
      totalAmount,
      pickupType,
      notes,
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
    });

    console.log('📦 Order created in Convex:', orderId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId,
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      },
      { status: 500 }
    );
  }
}
