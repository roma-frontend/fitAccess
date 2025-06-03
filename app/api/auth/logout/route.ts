// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    console.log('🚪 Logout: начинаем выход, cookies:', {
      session_id: !!sessionId,
      session_id_debug: !!sessionIdDebug,
      auth_token: !!authToken
    });
    
    if (sessionId) {
      logout(sessionId);
    }
    if (sessionIdDebug) {
      logout(sessionIdDebug);
    }

    const response = NextResponse.json({ 
      success: true,
      timestamp: Date.now(),
      message: 'Выход выполнен успешно'
    });
    
    const cookiesToDelete = ['session_id', 'session_id_debug', 'auth_token'];
    
    cookiesToDelete.forEach(cookieName => {
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
      });
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
      });
    });
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('✅ Logout: выход выполнен успешно');
    return response;
  } catch (error) {
    console.error('💥 Logout error:', error);
    
    const response = NextResponse.json({ 
      success: false, 
      error: 'Ошибка выхода из системы',
      timestamp: Date.now()
    }, { status: 500 });
    
    const cookiesToDelete = ['session_id', 'session_id_debug', 'auth_token'];
    cookiesToDelete.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/'
      });
    });
    
    return response;
  }
}
