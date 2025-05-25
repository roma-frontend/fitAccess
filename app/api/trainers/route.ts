// app/api/trainers/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const trainers = await convex.query("trainers:getAll");
    
    return NextResponse.json({
      success: true,
      trainers: trainers || []
    });

  } catch (error) {
    console.error('Ошибка получения тренеров:', error);
    return NextResponse.json(
      { error: 'Ошибка получения тренеров' },
      { status: 500 }
    );
  }
}
