// components/ProtectedRoute.tsx (обновленная версия)
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import AccessNotification from './AccessNotification';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  showAccessNotification?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/',
  showAccessNotification = true
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      const data = await response.json();

      if (!data.authenticated) {
        setError('Требуется авторизация');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 2000);
        return;
      }

      setUser(data.user);

      if (allowedRoles.length > 0 && !allowedRoles.includes(data.user?.role)) {
        setError(`Доступ запрещен. Требуется роль: ${allowedRoles.join(', ')}`);
        setTimeout(() => {
          window.location.href = data.dashboardUrl || redirectTo;
        }, 3000);
        return;
      }

      setAuthorized(true);
    } catch (error) {
      setError('Ошибка проверки авторизации');
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Проверяем доступ...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ ограничен</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Показываем уведомление о доступе если нужно */}
      {showAccessNotification && user && (
        <AccessNotification 
          userRole={user.role} 
          currentPage={window.location.pathname.split('/')[1]} 
        />
      )}
    </>
  );
}
