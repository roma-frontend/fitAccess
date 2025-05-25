// app/api/auth/check/route.ts (исправленная версия с поддержкой JWT и сессий)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import jwt from 'jsonwebtoken';

const getDashboardForRole = (role: string): string => {
  switch (role) {
    case 'member':
      return '/member-dashboard';
    case 'admin':
    case 'super-admin':
      return '/admin';
    case 'manager':
      return '/manager-dashboard';
    case 'trainer':
      return '/trainer-dashboard';
    default:
      return '/staff-dashboard';
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log('API auth/check: начинаем проверку (сессии + JWT)');
    console.log('API auth/check: все cookies:', request.cookies.getAll());
    
    // Сначала проверяем сессии (новая система)
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const finalSessionId = sessionId || sessionIdDebug;
    
    console.log('API auth/check: session_id найден:', !!sessionId);
    console.log('API auth/check: session_id_debug найден:', !!sessionIdDebug);
    console.log('API auth/check: используем session_id:', finalSessionId?.substring(0, 20));

    // Проверяем сессию если есть
    if (finalSessionId) {
      const session = getSession(finalSessionId);
      console.log('API auth/check: сессия найдена:', !!session);

      if (session) {
        console.log('API auth/check: сессия валидна, пользователь:', session.user);
        const dashboardUrl = getDashboardForRole(session.user.role);

        return NextResponse.json({
          authenticated: true,
          user: {
            id: session.user.id,
            role: session.user.role,
            email: session.user.email,
            name: session.user.name
          },
          dashboardUrl: dashboardUrl,
          debug: `Session valid for ID: ${finalSessionId.substring(0, 20)}...`,
          system: 'simple-sessions',
          sessionCreated: session.createdAt,
          lastAccessed: session.lastAccessed,
          usedCookie: sessionId ? 'session_id' : 'session_id_debug'
        });
      }
    }

    // Если сессии нет, проверяем JWT токен (старая система)
    const authToken = request.cookies.get('auth_token')?.value;
    console.log('API auth/check: auth_token найден:', !!authToken);
    
    if (authToken) {
      try {
        if (!process.env.JWT_SECRET) {
          console.error('API auth/check: JWT_SECRET не установлен');
          return NextResponse.json({ 
            authenticated: false,
            user: null,
            debug: 'JWT_SECRET not configured',
            system: 'jwt-fallback'
          });
        }

        console.log('API auth/check: проверяем JWT токен...');
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET) as any;
        console.log('API auth/check: JWT токен валиден, пользователь:', decoded);

        const dashboardUrl = getDashboardForRole(decoded.role);

        return NextResponse.json({
          authenticated: true,
          user: {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email,
            name: decoded.name
          },
          dashboardUrl: dashboardUrl,
          debug: `JWT token valid, expires: ${new Date(decoded.exp * 1000).toISOString()}`,
          system: 'jwt-fallback',
          tokenIssued: new Date(decoded.iat * 1000).toISOString(),
          tokenExpires: new Date(decoded.exp * 1000).toISOString()
        });

      } catch (jwtError) {
        console.error('API auth/check: ошибка проверки JWT:', jwtError);
        
        // JWT токен недействителен, удаляем его
        const response = NextResponse.json({ 
          authenticated: false,
          user: null,
          debug: `JWT verification failed: ${jwtError instanceof Error ? jwtError.message : 'Unknown error'}`,
          system: 'jwt-fallback'
        });
        
        response.cookies.delete('auth_token');
        return response;
      }
    }

    // Ни сессии, ни JWT токена нет
    console.log('API auth/check: ни сессии, ни JWT токена не найдено');
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      debug: 'No valid session_id or auth_token found',
      system: 'none',
      cookiesFound: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });

  } catch (error) {
    console.error('API auth/check: ошибка проверки авторизации:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      debug: `Authorization check failed: ${errorMessage}`,
      system: 'error'
    });
  }
}
