// app/api/auth/sessions/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { 
  getSession, 
  getAllSessions, 
  getSessionStats, 
  cleanupExpiredSessions,
  getUserSessions,
  type Session,
  type User
} from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Сессия недействительна' },
        { status: 401 }
      );
    }

    // Только администраторы могут видеть все сессии
    if (session.user.role === 'admin' || session.user.role === 'super_admin') {
      const stats = getSessionStats();
      const allSessions = Array.from(getAllSessions().entries()).map(([id, sess]: [string, Session]) => ({
        id,
        user: sess.user,
        createdAt: sess.createdAt,
        lastAccessed: sess.lastAccessed
      }));

      return NextResponse.json({
        success: true,
        stats,
        sessions: allSessions,
        currentSession: {
          id: sessionId,
          user: session.user,
          createdAt: session.createdAt,
          lastAccessed: session.lastAccessed
        }
      });
    }

    // Обычные пользователи видят только свои сессии
    const userSessions = getUserSessions(session.user.id);
    
    return NextResponse.json({
      success: true,
      userSessions: userSessions.map(({ sessionId: id, session: sess }) => ({
        id,
        createdAt: sess.createdAt,
        lastAccessed: sess.lastAccessed,
        isCurrent: id === sessionId
      })),
      currentSession: {
        id: sessionId,
        user: session.user,
        createdAt: session.createdAt,
        lastAccessed: session.lastAccessed
      }
    });

  } catch (error) {
    console.error('Ошибка при получении информации о сессиях:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении информации о сессиях' 
      },
      { status: 500 }
    );
  }
}

// Очистка истекших сессий (только для администраторов)
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const cleanedCount = cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      message: `Очищено ${cleanedCount} истекших сессий`,
      cleanedCount
    });

  } catch (error) {
    console.error('Ошибка при очистке сессий:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при очистке сессий' 
      },
      { status: 500 }
    );
  }
}

// Дополнительный эндпоинт для получения статистики сессий
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
              );
    }

    const { action } = await request.json();

    switch (action) {
      case 'getStats':
        const stats = getSessionStats();
        return NextResponse.json({
          success: true,
          stats
        });

      case 'getActiveSessions':
        const activeSessions = Array.from(getAllSessions().entries())
          .filter(([_, sess]: [string, Session]) => {
            const maxAge = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            return now - sess.createdAt <= maxAge;
          })
          .map(([id, sess]: [string, Session]) => ({
            id: id.substring(0, 20) + '...',
            user: {
              id: sess.user.id,
              email: sess.user.email,
              name: sess.user.name,
              role: sess.user.role
            },
            createdAt: sess.createdAt,
            lastAccessed: sess.lastAccessed,
            duration: Date.now() - sess.createdAt
          }));

        return NextResponse.json({
          success: true,
          activeSessions
        });

      case 'getUserActivity':
        const { userId } = await request.json();
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'ID пользователя не указан' },
            { status: 400 }
          );
        }

        const userSessions = getUserSessions(userId);
        return NextResponse.json({
          success: true,
          userSessions: userSessions.map(({ sessionId: id, session: sess }) => ({
            id: id.substring(0, 20) + '...',
            createdAt: sess.createdAt,
            lastAccessed: sess.lastAccessed,
            duration: Date.now() - sess.createdAt,
            isActive: Date.now() - sess.lastAccessed < 30 * 60 * 1000 // активен если доступ был менее 30 минут назад
          }))
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Ошибка при обработке POST запроса:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обработке запроса' 
      },
      { status: 500 }
    );
  }
}

