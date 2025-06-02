"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/simple-auth';

// Обновленный интерфейс для совместимости с главной страницей
export interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
  dashboardUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authStatus: AuthStatus | null; // Добавляем для совместимости
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthStatus: (status: AuthStatus | null) => void; // Добавляем для совместимости
}

// Функция для получения URL дашборда по роли
const getDashboardUrl = (role: string): string => {
  const dashboardUrls: Record<string, string> = {
    'admin': '/admin',
    'super-admin': '/admin',
    'manager': '/manager',
    'trainer': '/trainer',
    'client': '/member',
    'member': '/member',
    'staff': '/staff'
  };
  
  return dashboardUrls[role] || '/dashboard';
};

// Функция для преобразования User в AuthStatus
const userToAuthStatus = (user: User | null): AuthStatus | null => {
  if (!user) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    dashboardUrl: getDashboardUrl(user.role)
  };
};

// Создаем контекст с дефолтными значениями
const AuthContext = React.createContext<AuthContextType | null>(null);

// Провайдер контекста аутентификации
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  // Синхронизируем authStatus с user
  useEffect(() => {
    const newAuthStatus = userToAuthStatus(user);
    setAuthStatus(newAuthStatus);
  }, [user]);

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
      setLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(null);
        setAuthStatus({ authenticated: false });
        
        // Очищаем локальное хранилище
        localStorage.clear();
        sessionStorage.clear();
        
        // Очищаем куки
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Перенаправляем на главную
        window.location.replace('/');
      } else {
        console.error("Ошибка выхода:", data.error);
      }
    } catch (error) {
      console.error('Ошибка выхода:', error);
      setUser(null);
      setAuthStatus({ authenticated: false });
      window.location.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkSession();
  };

  // Функция для ручного обновления authStatus (для совместимости)
  const updateAuthStatus = (status: AuthStatus | null): void => {
    setAuthStatus(status);
  };

  const value: AuthContextType = {
    user,
    loading,
    authStatus,
    login,
    logout,
    refreshUser,
    setAuthStatus: updateAuthStatus
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

// Основной хук для использования контекста аутентификации
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}

// Упрощенный хук для главной страницы (для обратной совместимости)
export function useAuthStatus() {
  const { authStatus, loading, logout: contextLogout } = useAuth();
  
  return {
    authStatus,
    isLoading: loading,
    logout: contextLogout
  };
}

// Хук для проверки роли
export function useRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
    isSuperAdmin: user?.role === 'super-admin',
    isManager: user?.role === 'manager' || user?.role === 'admin' || user?.role === 'super-admin',
    isTrainer: user?.role === 'trainer',
    isClient: user?.role === 'client' || user?.role === 'member',
    isMember: user?.role === 'member' || user?.role === 'client',
    isStaff: ['admin', 'super-admin', 'manager', 'trainer', 'staff'].includes(user?.role || ''),
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

// Хук для навигации (интегрируем с существующей системой)
export function useNavigation() {
  const { authStatus } = useAuth();
  
  const handleDashboardRedirect = () => {
    if (authStatus?.dashboardUrl) {
      window.location.href = authStatus.dashboardUrl;
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return {
    handleDashboardRedirect,
    navigateTo,
    authStatus
  };
}
