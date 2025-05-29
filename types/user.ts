// types/user.ts (обновленная версия)
export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  photoUrl?: string;
  createdAt: number;
  lastLogin?: number;
  updatedAt?: number;
  createdBy?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  recent?: User[];
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  photoUrl?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  photoUrl?: string;
  password?: string;
}

export interface OperationResult {
  success: boolean;
  error?: string;
}
