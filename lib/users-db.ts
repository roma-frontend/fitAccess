// lib/users-db.ts (обновленная типизация)
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Интерфейс для пользователя в Convex (с _id)
export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member';
  name: string;
  createdAt: number;
  createdBy?: string;
  isActive: boolean;
  lastLogin?: number;
  photoUrl?: string;
  faceDescriptor?: number[];
  faceRecognitionEnabled?: boolean;
  faceDescriptorUpdatedAt?: number;
}

// Интерфейс для создания пользователя (без _id)
export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  createdBy?: string;
  photoUrl?: string;
  faceDescriptor?: number[];
}

export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member';

// Функция для проверки валидности роли
export function isValidRole(role: string): role is UserRole {
  return ['super-admin', 'admin', 'manager', 'trainer', 'member'].includes(role);
}

// Инициализация супер-админа в базе данных
export async function initializeSuperAdmin(): Promise<void> {
  try {
    console.log('🔍 Проверяем существование супер-админа в БД...');
    
    // Проверяем, есть ли супер-админ в базе
    const existingSuperAdmin: User | null = await client.query("users:getByEmail", { 
      email: "romangulanyan@gmail.com" 
    });
    
    if (existingSuperAdmin) {
      console.log('✅ Супер-админ уже существует в БД:', existingSuperAdmin.email);
      return;
    }
    
    console.log('🔧 Создаем супер-админа в БД...');
    
    // Создаем супер-админа
    const superAdminId = await client.mutation("users:create", {
      email: "romangulanyan@gmail.com",
      password: "Hovik-1970", // В продакшене должен быть хеширован!
      name: "Roman Gulanyan",
      role: "super-admin",
      isActive: true,
      createdAt: Date.now(),
    });
    
    console.log('✅ Супер-админ создан в БД с ID:', superAdminId);
  } catch (error) {
    console.error('❌ Ошибка инициализации супер-админа:', error);
  }
}

// Валидация пароля
export async function validatePassword(email: string, password: string): Promise<User | null> {
  try {
    console.log(`🔐 Проверяем пользователя в БД: ${email}`);
    
    const user: User | null = await client.query("users:getByEmail", { email });
    
    if (!user) {
      console.log(`❌ Пользователь не найден в БД: ${email}`);
      return null;
    }
    
    if (!user.isActive) {
      console.log(`❌ Пользователь неактивен: ${email}`);
      return null;
    }
    
    console.log(`🔍 Сравниваем пароли для: ${email}`);
    console.log(`🔍 Длина пароля в БД: ${user.password.length}`);
    
    let isPasswordValid = false;
    
    // Если пароль короткий (не хеширован) - прямое сравнение
    if (user.password.length < 50) {
      console.log(`🔍 Используем прямое сравнение (нехешированный пароль)`);
      isPasswordValid = user.password === password;
    } else {
      // Если пароль длинный (хеширован) - используем bcrypt
      console.log(`🔍 Используем bcrypt сравнение (хешированный пароль)`);
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    if (isPasswordValid) {
      console.log(`✅ Авторизация успешна: ${user.email} (${user.role})`);
      
      // Обновляем время последнего входа
      await client.mutation("users:updateLastLogin", {
        userId: user._id,
        timestamp: Date.now()
      });
      
      return user;
    }
    
    console.log(`❌ Неверный пароль для: ${email}`);
    return null;
  } catch (error) {
    console.error('❌ Ошибка валидации пароля:', error);
    return null;
  }
}

// Создание пользователя
export async function createUser(userData: CreateUserData, createdBy: string): Promise<User> {
  try {
    console.log(`🔧 Создаем пользователя в БД: ${userData.email}`);
    console.log('📝 Данные пользователя:', {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.isActive
    });
    
    // Проверяем, что пользователь не существует
    console.log('🔍 Проверяем существование пользователя...');
    const existingUser: User | null = await client.query("users:getByEmail", { email: userData.email });
    if (existingUser) {
      console.log('❌ Пользователь уже существует:', userData.email);
      throw new Error('Пользователь с таким email уже существует');
    }
    
    // Проверяем валидность роли
    if (!isValidRole(userData.role)) {
      console.log('❌ Недопустимая роль:', userData.role);
      throw new Error(`Недопустимая роль: ${userData.role}`);
    }
    
    console.log('✅ Проверки пройдены, вызываем Convex mutation...');
    
    // Подготавливаем данные для Convex
    const convexData = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      isActive: userData.isActive,
      createdAt: Date.now(),
      createdBy: createdBy,
      photoUrl: userData.photoUrl,
      faceDescriptor: userData.faceDescriptor || [],
    };
    
    console.log('📤 Отправляем данные в Convex:', convexData);
    
    // Создаем пользователя
    const userId: string = await client.mutation("users:create", convexData);
    
    console.log('✅ Convex mutation выполнена, ID:', userId);
    
    // Получаем созданного пользователя
    console.log('🔍 Получаем созданного пользователя...');
    const newUser: User | null = await client.query("users:getById", { id: userId });
    
    if (!newUser) {
      console.log('❌ Не удалось получить созданного пользователя');
      throw new Error('Ошибка получения созданного пользователя');
    }
    
    console.log(`✅ Пользователь создан в БД: ${newUser.email} (${newUser.role})`);
    return newUser;
  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
    
    // Более детальное логирование
    if (error instanceof Error) {
      console.error('📋 Сообщение:', error.message);
      console.error('📋 Stack:', error.stack);
    }
    
    throw error;
  }
}

// Получение всех пользователей
export async function getAllUsers(): Promise<User[]> {
  try {
    const users: User[] = await client.query("users:getAll");
    return users;
  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error);
    return [];
  }
}

// Поиск пользователя по email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const user: User | null = await client.query("users:getByEmail", { email });
    return user;
  } catch (error) {
    console.error('❌ Ошибка поиска пользователя по email:', error);
    return null;
  }
}

// Поиск пользователя по ID
export async function findUserById(id: string): Promise<User | null> {
  try {
    const user: User | null = await client.query("users:getById", { id });
    return user;
  } catch (error) {
    console.error('❌ Ошибка поиска пользователя по ID:', error);
    return null;
  }
}

// Обновление пользователя
export async function updateUser(id: string, updates: Partial<User>, updatedBy: string): Promise<User | null> {
  try {
    console.log(`🔧 Обновляем пользователя в БД: ${id}`);
    
    const user = await findUserById(id);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Нельзя изменить супер-админа
    if (user.role === 'super-admin' && user.email === 'romangulanyan@gmail.com') {
      throw new Error('Нельзя изменить супер-администратора');
    }
    
    // Обновляем поля по отдельности (Convex не поддерживает массовое обновление)
    if (updates.role) {
      await client.mutation("users:updateRole", { userId: id, role: updates.role });
    }
    
    if (updates.hasOwnProperty('isActive')) {
      await client.mutation("users:toggleStatus", { userId: id, isActive: updates.isActive! });
    }
    
    if (updates.password) {
      await client.mutation("users:updatePassword", { userId: id, password: updates.password });
    }
    
    // Получаем обновленного пользователя
    const updatedUser = await findUserById(id);
    
    console.log(`✅ Пользователь обновлен в БД: ${user.email}`);
    return updatedUser;
  } catch (error) {
    console.error('❌ Ошибка обновления пользователя:', error);
    throw error;
  }
}

// Удаление пользователя
export async function deleteUser(id: string, deletedBy: string): Promise<boolean> {
  try {
    console.log(`🔧 Удаляем пользователя из БД: ${id}`);
    
    const user = await findUserById(id);
    if (!user) {
      return false;
    }
    
    // Нельзя удалить супер-админа
    if (user.role === 'super-admin' && user.email === 'romangulanyan@gmail.com') {
      throw new Error('Нельзя удалить супер-администратора');
    }
    
    await client.mutation("users:deleteUser", { id });
    
    console.log(`✅ Пользователь удален из БД: ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка удаления пользователя:', error);
    throw error;
  }
}

// Проверка прав доступа для создания ролей
export function canCreateRole(creatorRole: string, targetRole: string): boolean {
  if (!isValidRole(creatorRole) || !isValidRole(targetRole)) {
    return false;
  }

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
export function canManageUser(managerRole: string, targetUserRole: string): boolean {
  if (!isValidRole(managerRole) || !isValidRole(targetUserRole)) {
    return false;
  }

  if (managerRole === 'super-admin') {
    return targetUserRole !== 'super-admin';
  }
  
  if (managerRole === 'admin') {
    return (['manager', 'trainer', 'member'] as UserRole[]).includes(targetUserRole);
  }
  
  if (managerRole === 'manager') {
    return (['trainer', 'member'] as UserRole[]).includes(targetUserRole);
  }
  
  return false;
}

// Получение отображаемого имени роли
export function getRoleDisplayName(role: string): string {
  if (!isValidRole(role)) {
    return role;
  }

  const roleNames: Record<UserRole, string> = {
    'super-admin': 'Супер Администратор',
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'trainer': 'Тренер',
    'member': 'Участник'
  };
  
  return roleNames[role] || role;
}

// Проверка существования супер-админа
export async function hasSuperAdmin(): Promise<boolean> {
  try {
    const superAdmin: User | null = await client.query("users:getByEmail", { 
      email: "romangulanyan@gmail.com" 
    });
    return !!superAdmin;
  } catch (error) {
    console.error('❌ Ошибка проверки супер-админа:', error);
    return false;
  }
}

// Получение статистики пользователей
export async function getUserStats(): Promise<Record<UserRole, number>> {
  try {
    const users = await getAllUsers();
    const stats: Record<UserRole, number> = {
      'super-admin': 0,
      'admin': 0,
      'manager': 0,
      'trainer': 0,
      'member': 0
    };
    
    users.forEach((user: User) => {
      if (isValidRole(user.role)) {
        stats[user.role]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return {
      'super-admin': 0,
      'admin': 0,
      'manager': 0,
      'trainer': 0,
      'member': 0
    };
  }
}

// Получение доступных ролей для создания
export function getAvailableRolesForCreation(creatorRole: string): { value: UserRole; label: string }[] {
  if (!isValidRole(creatorRole)) {
    return [];
  }

  const hierarchy: Record<UserRole, UserRole[]> = {
    'super-admin': ['admin', 'manager', 'trainer', 'member'],
    'admin': ['manager', 'trainer', 'member'],
    'manager': ['trainer', 'member'],
    'trainer': ['member'],
    'member': []
  };

  const availableRoles = hierarchy[creatorRole] || [];
  
  return availableRoles.map(role => ({
    value: role,
    label: getRoleDisplayName(role)
  }));
}
