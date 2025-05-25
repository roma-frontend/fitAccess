// lib/simple-auth.ts (исправленная версия с дополнительными функциями)
interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface Session {
  user: User;
  createdAt: number;
  lastAccessed: number;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageSessionDuration: number;
  sessionsByRole: Record<string, number>;
  recentActivity: Array<{
    sessionId: string;
    user: User;
    lastAccessed: number;
  }>;
}

interface UserSessionInfo {
  sessionId: string;
  session: Session;
}

// Простое хранилище сессий в памяти
const sessions = new Map<string, Session>();

export function createSession(user: User): string {
  const sessionId = generateSessionId();
  const session: Session = {
    user,
    createdAt: Date.now(),
    lastAccessed: Date.now()
  };
  
  sessions.set(sessionId, session);
  console.log(`✅ Сессия создана: ${sessionId} для пользователя ${user.email}`);
  console.log(`📊 Всего активных сессий: ${sessions.size}`);
  console.log(`📋 Список сессий:`, Array.from(sessions.keys()).map(id => id.substring(0, 20) + '...'));
  
  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  console.log(`🔍 Поиск сессии: ${sessionId.substring(0, 20)}...`);
  console.log(`📊 Всего сессий в хранилище: ${sessions.size}`);
  console.log(`📋 Доступные сессии:`, Array.from(sessions.keys()).map(id => id.substring(0, 20) + '...'));
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    console.log(`❌ Сессия не найдена: ${sessionId.substring(0, 20)}...`);
    return null;
  }
  
  // Проверяем срок действия сессии (7 дней)
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
  const now = Date.now();
  
  if (now - session.createdAt > maxAge) {
    console.log(`⏰ Сессия истекла: ${sessionId.substring(0, 20)}...`);
    sessions.delete(sessionId);
    return null;
  }
  
  // Обновляем время последнего доступа
  session.lastAccessed = now;
  sessions.set(sessionId, session);
  
  console.log(`✅ Сессия найдена и обновлена: ${sessionId.substring(0, 20)}... для пользователя ${session.user.email}`);
  return session;
}

export function deleteSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);
  console.log(`🗑️ Сессия ${deleted ? 'удалена' : 'не найдена для удаления'}: ${sessionId.substring(0, 20)}...`);
  console.log(`📊 Всего активных сессий: ${sessions.size}`);
  return deleted;
}

// Исправленная функция - возвращает Map вместо массива
export function getAllSessions(): Map<string, Session> {
  return new Map(sessions);
}

// Новая функция для получения всех сессий как массива
export function getAllSessionsArray(): Session[] {
  return Array.from(sessions.values());
}

// Новая функция для получения статистики сессий
export function getSessionStats(): SessionStats {
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
  
  let activeSessions = 0;
  let expiredSessions = 0;
  let totalDuration = 0;
  const sessionsByRole: Record<string, number> = {};
  const recentActivity: Array<{
    sessionId: string;
    user: User;
    lastAccessed: number;
  }> = [];

  // Анализируем все сессии
  for (const [sessionId, session] of sessions.entries()) {
    const isExpired = now - session.createdAt > maxAge;
    
    if (isExpired) {
      expiredSessions++;
    } else {
      activeSessions++;
      totalDuration += now - session.createdAt;
      
      // Подсчет по ролям
      const role = session.user.role;
      sessionsByRole[role] = (sessionsByRole[role] || 0) + 1;
      
      // Недавняя активность (последние 24 часа)
      if (now - session.lastAccessed < 24 * 60 * 60 * 1000) {
        recentActivity.push({
          sessionId: sessionId.substring(0, 20) + '...',
          user: session.user,
          lastAccessed: session.lastAccessed
        });
      }
    }
  }

  // Сортируем по времени последней активности
  recentActivity.sort((a, b) => b.lastAccessed - a.lastAccessed);

  return {
    totalSessions: sessions.size,
    activeSessions,
    expiredSessions,
    averageSessionDuration: activeSessions > 0 ? totalDuration / activeSessions : 0,
    sessionsByRole,
    recentActivity: recentActivity.slice(0, 10) // Последние 10 активностей
  };
}

// Новая функция для получения сессий конкретного пользователя
export function getUserSessions(userId: string): UserSessionInfo[] {
  const userSessions: UserSessionInfo[] = [];
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.user.id === userId) {
      userSessions.push({
        sessionId,
        session
      });
    }
  }
  
  // Сортируем по времени создания (новые сначала)
  userSessions.sort((a, b) => b.session.createdAt - a.session.createdAt);
  
  return userSessions;
}

export function clearAllSessions(): void {
  const count = sessions.size;
  sessions.clear();
  console.log(`🧹 Очищены все сессии: ${count} сессий удалено`);
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + 
         Date.now().toString(36) + 
         Math.random().toString(36).substring(2);
}

// Функция для очистки истекших сессий (можно вызывать периодически)
export function cleanupExpiredSessions(): number {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
  const now = Date.now();
  let cleaned = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > maxAge) {
      sessions.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Очищено истекших сессий: ${cleaned}`);
  }
  
  return cleaned;
}

// Функция для отладки - показать все сессии
export function debugSessions(): void {
  console.log(`\n=== DEBUG SESSIONS ===`);
  console.log(`📊 Всего сессий: ${sessions.size}`);
  
  if (sessions.size === 0) {
    console.log(`❌ Нет активных сессий`);
  } else {
    sessions.forEach((session, sessionId) => {
      console.log(`🔑 ${sessionId.substring(0, 20)}... -> ${session.user.email} (${session.user.role})`);
      console.log(`   Создана: ${new Date(session.createdAt).toLocaleString()}`);
      console.log(`   Последний доступ: ${new Date(session.lastAccessed).toLocaleString()}`);
    });
  }
  console.log(`=== END DEBUG SESSIONS ===\n`);
}

// Дополнительные утилиты для управления сессиями

// Получить активные сессии (не истекшие)
export function getActiveSessions(): Map<string, Session> {
  const activeSessions = new Map<string, Session>();
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt <= maxAge) {
      activeSessions.set(sessionId, session);
    }
  }
  
  return activeSessions;
}

// Получить сессии по роли
export function getSessionsByRole(role: string): Map<string, Session> {
  const roleSessions = new Map<string, Session>();
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.user.role === role) {
      roleSessions.set(sessionId, session);
    }
  }
  
  return roleSessions;
}

// Проверить, есть ли активная сессия у пользователя
export function hasActiveSession(userId: string): boolean {
  for (const session of sessions.values()) {
    if (session.user.id === userId) {
      return true;
    }
  }
  return false;
}

// Завершить все сессии пользователя
export function terminateUserSessions(userId: string): number {
  let terminated = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.user.id === userId) {
      sessions.delete(sessionId);
      terminated++;
    }
  }
  
  console.log(`🚪 Завершено ${terminated} сессий для пользователя ${userId}`);
  return terminated;
}

// Экспорт типов для использования в других файлах
export type { User, Session, SessionStats, UserSessionInfo };
