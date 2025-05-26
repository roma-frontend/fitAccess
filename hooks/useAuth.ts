// hooks/useAuth.ts
"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/simple-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Создаем контекст с дефолтными значениями
const AuthContext = React.createContext<AuthContextType | null>(null);

// Провайдер контекста аутентификации
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверка текущей сессии при загрузке
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки сессии:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkSession();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

// Хук для использования контекста аутентификации
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}

// Хук для проверки роли
export function useRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isTrainer: user?.role === 'trainer',
    isClient: user?.role === 'client',
    isStaff: ['admin', 'manager', 'trainer'].includes(user?.role || ''),
    role: user?.role
  };
}

// Хук для проверки прав доступа
export function usePermissions() {
  const { user } = useAuth();
  
  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    try {
      const { hasPermission } = require('@/lib/permissions');
      return hasPermission(user.role, resource, action);
    } catch (error) {
      console.error('Ошибка проверки прав:', error);
      return false;
    }
  };

  const checkObjectAccess = (
    resource: string, 
    action: string, 
    objectOwnerId?: string
  ): boolean => {
    if (!user) return false;
    
    try {
      const { canAccessObject } = require('@/lib/permissions');
      return canAccessObject(user.role, user.id, objectOwnerId, resource, action);
    } catch (error) {
      console.error('Ошибка проверки доступа к объекту:', error);
      return false;
    }
  };

  return {
    checkPermission,
    checkObjectAccess,
    user
  };
}

// Хук для получения информации о пользователе
export function useUser() {
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userRole: user?.role
  };
}
