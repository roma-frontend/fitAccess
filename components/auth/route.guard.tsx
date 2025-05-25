// components/auth/route-guard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
          
          // Проверяем роль, если требуется
          if (requiredRole && data.user.role !== requiredRole) {
            console.log(`Недостаточно прав. Требуется: ${requiredRole}, у пользователя: ${data.user.role}`);
            router.push('/unauthorized');
            return;
          }
        } else {
          console.log("Пользователь не аутентифицирован, перенаправляем на главную");
          router.push('/');
          return;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Ошибка проверки аутентификации:", errorMessage);
        router.push('/');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
          <p className="text-gray-600 mb-4">Пожалуйста, войдите в систему</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
