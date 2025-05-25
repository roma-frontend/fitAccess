// app/api/payments/confirm-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 apiVersion: '2025-04-30.basil',
});

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await request.json();

    // Получаем информацию о платеже
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Обновляем статус заказа
      await client.mutation("orders:updateStatus", {
        orderId,
        status: 'confirmed',
        paymentStatus: 'paid',
        paidAt: Date.now(),
      });

      // Создаем чек
      const receipt = await generateReceipt(paymentIntent, orderId);

      return NextResponse.json({
        success: true,
        receipt,
        paymentStatus: 'succeeded',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Платеж не завершен',
        paymentStatus: paymentIntent.status,
      });
    }

  } catch (error) {
    console.error('Ошибка подтверждения платежа:', error);
    return NextResponse.json(
      { error: 'Ошибка подтверждения платежа' },
      { status: 500 }
    );
  }
}

async function generateReceipt(paymentIntent: Stripe.PaymentIntent, orderId: string) {
  // Получаем детали заказа
  const order = await client.query("orders:getById", { orderId });
  
  const receipt = {
    receiptId: `RCP-${Date.now()}`,
    orderId,
    paymentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    paidAt: new Date().toISOString(),
    customer: {
      email: paymentIntent.receipt_email,
      name: paymentIntent.metadata.userName,
    },
    items: order.items.map((item: any) => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.totalPrice,
    })),
    company: {
      name: 'FitAccess',
      address: 'г. Москва, ул. Спортивная, д. 1',
      inn: '1234567890',
      phone: '+7 (495) 123-45-67',
    },
  };

  return receipt;
}
