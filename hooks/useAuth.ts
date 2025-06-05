// hooks/useAuth.ts (исправленная версия)
"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/simple-auth';
import { useRouter, usePathname } from 'next/navigation';

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
  token: string | null;
  loading: boolean;
  authStatus: AuthStatus | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthStatus: (status: AuthStatus | null) => void;
}

// Функция для получения URL дашборда по роли
const getDashboardUrl = (role: string): string => {
  const dashboardUrls: Record<string, string> = {
    'admin': '/admin',
    'super-admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'client': '/member-dashboard',
    'member': '/member-dashboard',
    'staff': '/staff-dashboard'
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Синхронизируем authStatus с user
  useEffect(() => {
    const newAuthStatus = userToAuthStatus(user);
    setAuthStatus(newAuthStatus);
    console.log('🔄 AuthProvider: authStatus обновлен:', newAuthStatus);
  }, [user]);

  // Проверка текущей сессии при загрузке
  useEffect(() => {
    console.log('🚀 AuthProvider: инициализация, проверяем сессию...');
    checkSession();
  }, []);

  // Проверяем авторизацию при изменении маршрута (особенно при переходе на главную)
  useEffect(() => {
    if (pathname === '/') {
      console.log('🏠 AuthProvider: переход на главную, проверяем авторизацию...');
      checkSession();
    }
  }, [pathname]);

  const checkSession = async (): Promise<void> => {
    try {
      console.log('🔍 AuthProvider: проверяем сессию через /api/auth/check...');
      
      // ИСПРАВЛЕНО: используем правильный endpoint
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      console.log('🔍 AuthProvider: статус ответа:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AuthProvider: данные от API:', data);
        
        if (data.authenticated && data.user) {
          console.log('✅ AuthProvider: пользователь авторизован:', data.user);
          setUser({
            id: data.user.id,
            role: data.user.role,
            email: data.user.email,
            name: data.user.name
          });
          
          // Сохраняем токен если есть
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('auth_token', data.token);
          }
        } else {
          console.log('❌ AuthProvider: пользователь не авторизован');
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_token');
        }
      } else {
        console.log('❌ AuthProvider: ошибка ответа от API:', response.status);
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('❌ AuthProvider: ошибка проверки сессии:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
      console.log('🏁 AuthProvider: проверка сессии завершена');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 AuthProvider: попытка входа для:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔐 AuthProvider: результат входа:', data);

      if (data.success && data.user) {
        console.log('✅ AuthProvider: вход успешен:', data.user);
        setUser(data.user);
        
        // Сохраняем токен если он есть
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('auth_token', data.token);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ AuthProvider: ошибка входа:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 AuthProvider: выполняем выход...');
      
      // Сначала очищаем состояние
      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });
      
      // Очищаем токен из localStorage
      localStorage.removeItem('auth_token');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
  
      if (response.ok) {
        console.log('✅ AuthProvider: выход успешен');
        // Очищаем локальное хранилище
        localStorage.clear();
        sessionStorage.clear();
        
        // Принудительно перенаправляем на главную
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ AuthProvider: ошибка выхода:', error);
      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    console.log('🔄 AuthProvider: принудительное обновление пользователя...');
    await checkSession();
  };

  // Функция для ручного обновления authStatus (для совместимости)
  const updateAuthStatus = (status: AuthStatus | null): void => {
    console.log('🔄 AuthProvider: ручное обновление authStatus:', status);
    setAuthStatus(status);
  };

  const value: AuthContextType = {
    user,
    token,
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

// Хук для API запросов с автоматической авторизацией
export function useApiRequest() {
  const { token } = useAuth();

  const apiRequest = async (
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(endpoint, {
      ...options,
      headers,
    });
  };

  const get = async (endpoint: string): Promise<any> => {
    const response = await apiRequest(endpoint);
    return response.json();
  };

  const post = async (endpoint: string, data: any): Promise<any> => {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const put = async (endpoint: string, data: any): Promise<any> => {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const del = async (endpoint: string): Promise<any> => {
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    });
    return response.json();
  };

  return {
    apiRequest,
    get,
    post,
    put,
    delete: del,
    token
  };
}
