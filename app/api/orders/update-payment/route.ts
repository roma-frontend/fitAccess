// app/api/orders/update-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, status, paymentStatus, paymentId, paidAt } = await request.json();

    console.log('🔄 Updating order payment status:', { paymentIntentId, status, paymentStatus });

    // Получаем заказ - ИСПРАВЛЕНО: используем строковый идентификатор
    const order = await convex.query("orders:getByPaymentIntentId", { 
      paymentIntentId 
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    // Обновляем заказ - ИСПРАВЛЕНО: используем строковый идентификатор
    await convex.mutation("orders:updateByPaymentIntentId", {
      paymentIntentId,
      status,
      paymentStatus,
      paymentId,
      paidAt,
    });

    console.log('✅ Order updated successfully');

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('❌ Error updating order:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка обновления заказа'
      },
      { status: 500 }
    );
  }
}
