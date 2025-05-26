// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Нет сессии' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Сессия недействительна' });
    }

    return NextResponse.json({ 
      success: true, 
      user: session.user 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка проверки сессии' 
    }, { status: 500 });
  }
}
