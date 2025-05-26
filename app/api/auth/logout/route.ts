// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (sessionId) {
      logout(sessionId);
    }

    const response = NextResponse.json({ success: true });
    
    // Удаляем cookie
    response.cookies.delete('session_id');
    
    return response;
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка выхода из системы' 
    }, { status: 500 });
  }
}
