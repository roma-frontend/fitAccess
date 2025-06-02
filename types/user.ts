// types/user.ts (обновленная версия)
export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member' | 'client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: number;
  createdBy?: string;
  isActive: boolean;
  photoUrl?: string | null;
  lastLogin?: number | null;
  // Дополнительные поля для тренеров
  phone?: string;
  bio?: string;
  specializations?: string[];
  experience?: number;
  hourlyRate?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  photoUrl?: string;
  // Дополнительные поля для тренеров
  phone?: string;
  bio?: string;
  specializations?: string[];
  experience?: number;
  hourlyRate?: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  photoUrl?: string;
  password?: string;
  // Дополнительные поля для тренеров
  phone?: string;
  bio?: string;
  specializations?: string[];
  experience?: number;
  hourlyRate?: number;
}

export interface OperationResult {
  success: boolean;
  error?: string;
}
