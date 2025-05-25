// app/api/debug/check-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/universal-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 debug-bookings: проверяем бронирования пользователя');

    const auth = getAuthFromRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        error: 'Не авторизован',
        auth: auth
      });
    }

    const user = auth.user!;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      return NextResponse.json({
        error: 'CONVEX_URL не настроен'
      });
    }

    console.log('🔍 debug-bookings: ищем пользователя:', user.email);

    // Находим пользователя
    const userResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'users:getByEmail',
        args: { email: user.email }
      })
    });

    let foundUser = null;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      foundUser = userData.value;
    }

    if (!foundUser) {
      return NextResponse.json({
        error: 'Пользователь не найден',
        searchEmail: user.email
      });
    }

    console.log('👤 debug-bookings: пользователь найден:', foundUser._id);

    // Проверяем бронирования в таблице userBookings
    const userBookingsResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'bookings:getByUser',
        args: { userId: foundUser._id }
      })
    });

    let userBookings = [];
    let userBookingsError = null;

    if (userBookingsResponse.ok) {
      const userBookingsData = await userBookingsResponse.json();
      userBookings = userBookingsData.value || [];
    } else {
      userBookingsError = `HTTP ${userBookingsResponse.status}: ${await userBookingsResponse.text()}`;
    }

    // Проверяем бронирования в таблице bookings (на случай если они там)
    const regularBookingsResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'bookings:getByMember',
        args: { memberId: foundUser._id }
      })
    });

    let regularBookings = [];
    let regularBookingsError = null;

    if (regularBookingsResponse.ok) {
      const regularBookingsData = await regularBookingsResponse.json();
      regularBookings = regularBookingsData.value || [];
    } else {
      regularBookingsError = `HTTP ${regularBookingsResponse.status}: ${await regularBookingsResponse.text()}`;
    }

    // Получаем все записи из userBookings для проверки
    const allUserBookingsResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'userBookings:getAll', // Нужно создать эту функцию
        args: {}
      })
    });

    let allUserBookings = [];
    let allUserBookingsError = null;

    if (allUserBookingsResponse.ok) {
      const allUserBookingsData = await allUserBookingsResponse.json();
      allUserBookings = allUserBookingsData.value || [];
    } else {
      allUserBookingsError = `HTTP ${allUserBookingsResponse.status}: ${await allUserBookingsResponse.text()}`;
    }

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: foundUser._id,
          email: foundUser.email,
          name: foundUser.name
        },
        userBookings: {
          count: userBookings.length,
          data: userBookings,
          error: userBookingsError
        },
        regularBookings: {
          count: regularBookings.length,
          data: regularBookings,
          error: regularBookingsError
        },
        allUserBookings: {
          count: allUserBookings.length,
          data: allUserBookings.map((b: any) => ({
            id: b._id,
            userId: b.userId,
            trainerId: b.trainerId,
            status: b.status,
            createdAt: new Date(b.createdAt).toISOString()
          })),
          error: allUserBookingsError
        }
      }
    });

  } catch (error) {
    console.error('❌ debug-bookings: ошибка:', error);
    return NextResponse.json({
      error: 'Критическая ошибка',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
