// lib/simple-auth.ts
import { UserRole } from '@/lib/permissions';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Session {
  id: string;
  user: User;
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
}

// Моковые пользователи с правильной типизацией
const mockUsers: User[] = [
  {
    id: 'super_admin_1',
    email: 'romangulanyan@gmail.com',
    role: 'super-admin',
    name: 'Роман Гуланян'
  },
  {
    id: 'admin_1',
    email: 'admin@fitnessstudio.ru',
    role: 'admin',
    name: 'Елена Администратор'
  },
  {
    id: 'trainer_1',
    email: 'alex.petrov@fitnessstudio.ru',
    role: 'trainer',
    name: 'Александр Петров'
  },
  {
    id: 'trainer_2',
    email: 'maria.ivanova@fitnessstudio.ru',
    role: 'trainer',
    name: 'Мария Иванова'
  },
  {
    id: 'trainer_3',
    email: 'dmitry.sidorov@fitnessstudio.ru',
    role: 'trainer',
    name: 'Дмитрий Сидоров'
  },
  {
    id: 'manager_1',
    email: 'manager@fitnessstudio.ru',
    role: 'manager',
    name: 'Анна Менеджер'
  },
  {
    id: 'member_1',
    email: 'anna.smirnova@email.com',
    role: 'member',
    name: 'Анна Смирнова'
  },
  {
    id: 'client_1',
    email: 'igor.volkov@email.com',
    role: 'client',
    name: 'Игорь Волков'
  },
  {
    id: 'client_2',
    email: 'olga.kuznetsova@email.com',
    role: 'client',
    name: 'Ольга Кузнецова'
  },
  {
    id: 'client_3',
    email: 'maxim.fedorov@email.com',
    role: 'client',
    name: 'Максим Федоров'
  },
  {
    id: 'client_4',
    email: 'svetlana.novikova@email.com',
    role: 'client',
    name: 'Светлана Новикова'
  }
];

// Хранилище сессий в памяти
const sessions = new Map<string, Session>();

// Создание сессии
export const createSession = (user: User): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  const session: Session = {
    id: sessionId,
    user,
    createdAt: now,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    lastAccessed: now
  };

  sessions.set(sessionId, session);
  console.log(`✅ Session: создана сессия для ${user.email} (${user.role})`);
  
  return sessionId;
};

// Аутентификация пользователя
export const authenticate = (email: string, password: string): Session | null => {
  console.log(`🔐 Auth: попытка входа для ${email}`);
  
  // Специальная проверка для супер-админа
  if (email === 'romangulanyan@gmail.com' && password === 'Hovik-1970') {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      const sessionId = createSession(user);
      const session = sessions.get(sessionId);
      console.log(`✅ Auth: супер-админ авторизован`);
      return session || null;
    }
  }
  
  // Простая проверка пароля для остальных (в реальном приложении будет хеширование)
  if (password !== 'password123') {
    console.log('❌ Auth: неверный пароль');
    return null;
  }

  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    console.log('❌ Auth: пользователь не найден');
    return null;
  }

  // Создаем сессию
  const sessionId = createSession(user);
  const session = sessions.get(sessionId);
  
  return session || null;
};

// Получение сессии
export const getSession = (sessionId: string): Session | null => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Проверяем срок действия
  if (session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    console.log('⏰ Auth: сессия истекла');
    return null;
  }

  // Обновляем время последнего доступа
  session.lastAccessed = new Date();
  sessions.set(sessionId, session);

  return session;
};

// Выход из системы
export const logout = (sessionId: string): boolean => {
  const deleted = sessions.delete(sessionId);
  if (deleted) {
    console.log('👋 Auth: сессия завершена');
  }
  return deleted;
};

// Получение пользователя по ID
export const getUserById = (userId: string): User | null => {
  return mockUsers.find(u => u.id === userId) || null;
};

// Получение пользователя по email
export const getUserByEmail = (email: string): User | null => {
  return mockUsers.find(u => u.email === email) || null;
};

// Получение всех пользователей (только для админов)
export const getAllUsers = (): User[] => {
  return [...mockUsers]; // Возвращаем копию массива
};

// Получение пользователей по роли
export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(u => u.role === role);
};

// Создание нового пользователя
export const createUser = (userData: Omit<User, 'id'>): User => {
  // Проверяем, что email уникален
  if (emailExists(userData.email)) {
    throw new Error('Пользователь с таким email уже существует');
  }

  // Валидируем роль
  if (!isValidRole(userData.role)) {
    throw new Error('Недопустимая роль пользователя');
  }

  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  mockUsers.push(newUser);
  console.log(`➕ Auth: создан пользователь ${newUser.email} (${newUser.role})`);
  
  return newUser;
};

// Обновление пользователя
export const updateUser = (userId: string, updates: Partial<Omit<User, 'id'>>): User | null => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.log(`❌ Auth: пользователь ${userId} не найден для обновления`);
    return null;
  }

  // Проверяем уникальность email при обновлении
  if (updates.email && updates.email !== mockUsers[userIndex].email) {
    if (emailExists(updates.email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
  }

  // Валидируем роль при обновлении
  if (updates.role && !isValidRole(updates.role)) {
    throw new Error('Недопустимая роль пользователя');
  }

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
  console.log(`📝 Auth: обновлен пользователь ${userId}`);
  
  return mockUsers[userIndex];
};

// Удаление пользователя
export const deleteUser = (userId: string): boolean => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.log(`❌ Auth: пользователь ${userId} не найден для удаления`);
    return false;
  }

  const deletedUser = mockUsers.splice(userIndex, 1)[0];
  
  // Удаляем все сессии пользователя
  for (const [sessionId, session] of sessions.entries()) {
    if (session.user.id === userId) {
      sessions.delete(sessionId);
    }
  }
  
  console.log(`🗑️ Auth: удален пользователь ${deletedUser.email}`);
  return true;
};

// Проверка существования email
export const emailExists = (email: string): boolean => {
  return mockUsers.some(u => u.email === email);
};

// Валидация роли
export const isValidRole = (role: string): role is UserRole => {
  return ['super-admin', 'admin', 'manager', 'trainer', 'member', 'client'].includes(role);
};

// Смена пароля (в реальном приложении)
export const changePassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
  // В реальном приложении здесь будет проверка старого пароля и хеширование нового
  console.log(`🔑 Auth: смена пароля для пользователя ${userId}`);
  
  // Простая валидация пароля
  if (newPassword.length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов');
  }
  
  // В моковой версии просто возвращаем true
  return true;
};

// Сброс пароля
export const resetPassword = (email: string): string | null => {
  const user = getUserByEmail(email);
  if (!user) {
    console.log(`❌ Auth: пользователь с email ${email} не найден для сброса пароля`);
    return null;
  }

  // Генерируем временный пароль
  const tempPassword = Math.random().toString(36).substr(2, 10);
  
  console.log(`🔄 Auth: сгенерирован временный пароль для ${email}: ${tempPassword}`);
  
  // В реальном приложении здесь будет отправка email
  return tempPassword;
};

// Проверка активности сессии
export const isSessionActive = (sessionId: string): boolean => {
  const session = getSession(sessionId);
  return session !== null;
};

// Продление сессии
export const extendSession = (sessionId: string, hours: number = 24): boolean => {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  session.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  sessions.set(sessionId, session);
  
  console.log(`⏰ Auth: сессия ${sessionId} продлена на ${hours} часов`);
  return true;
};

// Получение всех активных сессий пользователя
export const getUserSessions = (userId: string): Session[] => {
  const userSessions: Session[] = [];
  
  for (const session of sessions.values()) {
    if (session.user.id === userId && session.expiresAt > new Date()) {
      userSessions.push(session);
    }
  }
  
  return userSessions;
};

// Завершение всех сессий пользователя
export const logoutAllUserSessions = (userId: string): number => {
  let deletedCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.user.id === userId) {
      sessions.delete(sessionId);
      deletedCount++;
    }
  }
  
  console.log(`👋 Auth: завершено ${deletedCount} сессий для пользователя ${userId}`);
  return deletedCount;
};

// Очистка истекших сессий
export const cleanupExpiredSessions = (): number => {
  let deletedCount = 0;
  const now = new Date();
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`🧹 Auth: очищено ${deletedCount} истекших сессий`);
  }
  
  return deletedCount;
};

// Получение статистики аутентификации
export const getAuthStats = () => {
  const now = new Date();
  const activeSessions = Array.from(sessions.values()).filter(s => s.expiresAt > now);
  
  return {
    totalUsers: mockUsers.length,
    usersByRole: {
      'super-admin': mockUsers.filter(u => u.role === 'super-admin').length,
      admin: mockUsers.filter(u => u.role === 'admin').length,
      manager: mockUsers.filter(u => u.role === 'manager').length,
      trainer: mockUsers.filter(u => u.role === 'trainer').length,
      member: mockUsers.filter(u => u.role === 'member').length,
      client: mockUsers.filter(u => u.role === 'client').length
    },
    activeSessions: activeSessions.length,
    totalSessions: sessions.size
  };
};

// Инициализация - очистка истекших сессий каждые 30 минут
if (typeof window === 'undefined') { // Только на сервере
  setInterval(() => {
    cleanupExpiredSessions();
  }, 30 * 60 * 1000); // 30 минут
}

// Экспорт для отладки (только в development)
export const debugAuth = process.env.NODE_ENV === 'development' ? {
  getAllSessions: () => Array.from(sessions.entries()),
  clearAllSessions: () => {
    sessions.clear();
    console.log('🧹 Debug: все сессии очищены');
  },
  addMockUser: (user: Omit<User, 'id'>) => createUser(user),
  getMockUsers: () => [...mockUsers],
  getSessionsCount: () => sessions.size,
  getActiveSessionsCount: () => {
    const now = new Date();
    return Array.from(sessions.values()).filter(s => s.expiresAt > now).length;
  }
} : undefined;
