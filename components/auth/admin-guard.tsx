"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAdminAccess = async () => {
      try {
        console.log("🔍 Проверяем права администратора...");

        const response = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include", // Важно для передачи cookies
        });

        console.log("📡 Ответ от /api/auth/check:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("📋 Данные от API:", data);

        if (data.authenticated && data.user && data.user.role === "admin") {
          console.log("✅ Пользователь - администратор");
          setIsAdmin(true);
          setUserInfo(data.user);
        } else {
          console.log("❌ Пользователь НЕ администратор:", {
            authenticated: data.authenticated,
            userRole: data.user?.role,
            user: data.user,
          });
          setIsAdmin(false);
          setUserInfo(data.user || null);
          setError(
            `Недостаточно прав. Ваша роль: ${data.user?.role || "не определена"}`
          );
        }
      } catch (error) {
        console.error("❌ Ошибка проверки прав:", error);
        setIsAdmin(false);
        setError(
          `Ошибка проверки: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [mounted]);

  if (!mounted) {
    return null;
  }

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
            <CardTitle className="text-2xl text-red-600">
              🚫 Доступ запрещен
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-gray-600">
              <p className="mb-2">
                У вас нет прав администратора для доступа к этой странице.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {userInfo ? (
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm">
                    <strong>Текущий пользователь:</strong> {userInfo.name}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {userInfo.email}
                  </p>
                  <p className="text-sm">
                    <strong>Роль:</strong>{" "}
                    <span className="font-bold text-red-600">
                      {userInfo.role || "user"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Требуется:</strong>{" "}
                    <span className="font-bold text-green-600">admin</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Вы не авторизованы в системе.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = "/admin-login")}
                className="w-full"
              >
                🔐 Войти как администратор
              </Button>

              <Button
                onClick={() => (window.location.href = "/admin-login")}
                variant="outline"
                className="w-full"
              >
                👑 Админ-панель входа
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="w-full"
              >
                🏠 Вернуться на главную
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <p>
                Для получения прав администратора обратитесь к системному
                администратору.
              </p>
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
            <span className="font-medium">👑 Администратор:</span>{" "}
            {userInfo?.name} ({userInfo?.email})
            <span className="ml-2 bg-green-200 px-2 py-1 rounded text-xs">
              Роль: {userInfo?.role}
            </span>
          </div>
          <Button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", {
                  method: "POST",
                });

                document.cookie =
                  "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie =
                  "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                window.location.href = "/";
              } catch (error) {
                console.error("Ошибка выхода:", error);
                document.cookie =
                  "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie =
                  "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
              }
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Выйти
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
