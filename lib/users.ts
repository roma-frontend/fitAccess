// lib/users.ts (исправленная версия без ошибок TypeScript)
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member';
  name: string;
  createdAt: number;
  createdBy?: string; // кто создал пользователя
  isActive: boolean;
}

// Типы для ролей
type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member';

const SUPER_ADMIN: User = {
  id: 'super-admin-roman-001',
  email: 'romangulanyan@gmail.com',
  password: 'Hovik-1970',
  role: 'super-admin',
  name: 'Roman Gulanyan',
  createdAt: Date.now(),
  isActive: true
};

// Хранилище пользователей в памяти
const users = new Map<string, User>();

function initializeSuperAdmin() {
  if (!users.has(SUPER_ADMIN.email)) {
    users.set(SUPER_ADMIN.email, SUPER_ADMIN);
    console.log('✅ Супер-админ инициализирован:', SUPER_ADMIN.email);
  } else {
    console.log('ℹ️ Супер-админ уже существует:', SUPER_ADMIN.email);
  }
}

// Вызываем инициализацию при загрузке модуля
initializeSuperAdmin();

export function createUser(userData: Omit<User, 'id' | 'createdAt'>, createdBy: string): User {
  const existingUser = users.get(userData.email);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const user: User = {
    ...userData,
    id: generateUserId(),
    createdAt: Date.now(),
    createdBy
  };

  users.set(user.email, user);
  console.log(`✅ Пользователь создан: ${user.email} (${user.role}) создал: ${createdBy}`);
  
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.get(email);
}

export function findUserById(id: string): User | undefined {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return undefined;
}

export function validatePassword(email: string, password: string): User | null {
  const user = users.get(email);
  if (!user || !user.isActive) {
    return null;
  }
  
  // В продакшене здесь должна быть проверка хешированного пароля
  if (user.password === password) {
    console.log(`✅ Авторизация успешна: ${user.email} (${user.role})`);
    return user;
  }
  
  console.log(`❌ Неверный пароль для: ${email}`);
  return null;
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function updateUser(id: string, updates: Partial<User>, updatedBy: string): User | null {
  const user = findUserById(id);
  if (!user) {
    return null;
  }

  // Нельзя изменить супер-админа
  if (user.role === 'super-admin' && user.email === SUPER_ADMIN.email) {
    throw new Error('Нельзя изменить супер-администратора');
  }

  const updatedUser = { ...user, ...updates };
  
  // Если изменился email, нужно обновить ключ в Map
  if (updates.email && updates.email !== user.email) {
    users.delete(user.email);
    users.set(updates.email, updatedUser);
  } else {
    users.set(user.email, updatedUser);
  }
  
  console.log(`✅ Пользователь обновлен: ${user.email} обновил: ${updatedBy}`);
  return updatedUser;
}

export function deleteUser(id: string, deletedBy: string): boolean {
  const user = findUserById(id);
  if (!user) {
    return false;
  }

  // Нельзя удалить супер-админа
  if (user.role === 'super-admin' && user.email === SUPER_ADMIN.email) {
    throw new Error('Нельзя удалить супер-администратора');
  }

  const deleted = users.delete(user.email);
  if (deleted) {
    console.log(`✅ Пользователь удален: ${user.email} удалил: ${deletedBy}`);
  }
  
  return deleted;
}

// Проверка прав доступа для создания ролей
export function canCreateRole(creatorRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy: Record<UserRole, UserRole[]> = {
    'super-admin': ['admin', 'manager', 'trainer', 'member'],
    'admin': ['manager', 'trainer', 'member'],
    'manager': ['trainer', 'member'],
    'trainer': ['member'],
    'member': []
  };

  return hierarchy[creatorRole]?.includes(targetRole) || false;
}

// Проверка прав доступа для управления пользователями
export function canManageUser(managerRole: UserRole, targetUserRole: UserRole): boolean {
  if (managerRole === 'super-admin') {
    return targetUserRole !== 'super-admin'; // Супер-админ может управлять всеми кроме других супер-админов
  }
  
  if (managerRole === 'admin') {
    return (['manager', 'trainer', 'member'] as UserRole[]).includes(targetUserRole);
  }
  
  if (managerRole === 'manager') {
    return (['trainer', 'member'] as UserRole[]).includes(targetUserRole);
  }
  
  return false;
}

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Функция для отладки - показать всех пользователей
export function debugUsers(): void {
  console.log('\n=== DEBUG USERS ===');
  console.log(`📊 Всего пользователей: ${users.size}`);
  
  users.forEach((user) => {
    console.log(`👤 ${user.email} (${user.role}) - ${user.name} - ${user.isActive ? 'Активен' : 'Неактивен'}`);
    if (user.createdBy) {
      console.log(`   Создан: ${user.createdBy} в ${new Date(user.createdAt).toLocaleString()}`);
    }
  });
  console.log('=== END DEBUG USERS ===\n');
}

// Дополнительные утилиты для работы с ролями
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'super-admin': 'Супер Администратор',
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'trainer': 'Тренер',
    'member': 'Участник'
  };
  
  return roleNames[role] || role;
}

export function getRoleHierarchyLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    'super-admin': 5,
    'admin': 4,
    'manager': 3,
    'trainer': 2,
    'member': 1
  };
  
  return levels[role] || 0;
}

export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  return getRoleHierarchyLevel(userRole) >= getRoleHierarchyLevel(targetRole);
}

// Функция для получения статистики пользователей
export function getUserStats(): Record<UserRole, number> {
  const stats: Record<UserRole, number> = {
    'super-admin': 0,
    'admin': 0,
    'manager': 0,
    'trainer': 0,
    'member': 0
  };
  
  users.forEach((user) => {
    stats[user.role]++;
  });
  
  return stats;
}

// Функция для получения пользователей по роли
export function getUsersByRole(role: UserRole): User[] {
  return Array.from(users.values()).filter(user => user.role === role);
}

// Функция для проверки существования супер-админа
export function hasSuperAdmin(): boolean {
  return users.has(SUPER_ADMIN.email);
}
