// components/auth/admin-guard-content.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminGuardContentProps {
  children: React.ReactNode;
}

export default function AdminGuardContent({ children }: AdminGuardContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated && data.user.role === 'admin') {
          setIsAdmin(true);
          setUserInfo(data.user);
        } else {
          setIsAdmin(false);
          setUserInfo(data.user || null);
        }
      } catch (error) {
        console.error("Ошибка проверки прав:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Проверка прав доступа...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">🚫 Доступ запрещен</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-gray-600">
              <p className="mb-2">У вас нет прав администратора.</p>
              {userInfo && (
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Пользователь:</strong> {userInfo.name}</p>
                  <p><strong>Роль:</strong> {userInfo.role || 'user'}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                🔐 Войти как администратор
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                🏠 На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-green-50 border border-green-200 p-3 mb-4 rounded">
        <div className="flex items-center justify-between">
          <div className="text-sm text-green-800">
            <span className="font-medium">👑 Администратор:</span> {userInfo?.name}
          </div>
          <Button
            onClick={() => {
              document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/';
            }}
            variant="outline"
            size="sm"
          >
            Выйти
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
}
