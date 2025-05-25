// app/api/orders/route.ts (для получения заказов пользователя)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    
    const authData = await authResponse.json();
    
    if (!authData.authenticated) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем заказы пользователя
    const orders = await convex.query("orders:getByMember", { 
      memberId: authData.user.id 
    });

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    return NextResponse.json(
      { error: 'Ошибка получения заказов' },
      { status: 500 }
    );
  }
}
