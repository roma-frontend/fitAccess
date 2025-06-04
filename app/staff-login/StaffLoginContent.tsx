// app/staff-login/StaffLoginContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { SmartForm } from "@/components/SmartForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { ValidatedInput } from "@/components/ValidatedInput";

export default function StaffLoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (
          data.authenticated &&
          ["admin", "super-admin", "manager", "trainer"].includes(
            data.user?.role
          )
        ) {
          const dashboardUrl = getDashboardForRole(data.user.role);
          router.replace(dashboardUrl);
        }
      } catch (error) {
        console.log("Проверка авторизации не удалась:", error);
      }
    };

    checkAuth();
  }, [router]);

  const getDashboardForRole = (role: string): string => {
    switch (role) {
      case "admin":
      case "super-admin":
        return "/admin";
      case "manager":
        return "/manager-dashboard";
      case "trainer":
        return "/trainer-dashboard";
      default:
        return "/staff-dashboard";
    }
  };

  const handleStaffLogin = async (formData: any) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Добро пожаловать!",
          description: `Вы вошли как ${getRoleDisplayName(data.user.role)}`,
        });

        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
          window.location.href = returnUrl;
          return;
        }

        const destination =
          data.dashboardUrl ||
          redirectPath ||
          getDashboardForRole(data.user.role);

        setTimeout(() => {
          window.location.href = destination;
        }, 500);
      } else {
        throw new Error(data.error || `Ошибка ${response.status}`);
      }
    } catch (error) {
      console.error("💥 Ошибка:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось выполнить операцию";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите email адрес",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          userType: "staff",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetSent(true);
        toast({
          title: "Письмо отправлено! 📧",
          description: "Проверьте вашу почту для восстановления пароля",
        });
      } else {
        throw new Error(data.error || "Ошибка отправки письма");
      }
    } catch (error) {
      console.error("Ошибка восстановления пароля:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось отправить письмо",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "super-admin":
        return "Супер Администратор";
      case "manager":
        return "Менеджер";
      case "trainer":
        return "Тренер";
      default:
        return "Персонал";
    }
  };

  const handleSuperAdminQuickLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-login",
          email: "romangulanyan@gmail.com",
          password: "Hovik-1970",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Быстрый вход выполнен!",
          description: "Вы вошли как супер-администратор",
        });

        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
          window.location.href = returnUrl;
        } else {
          window.location.href = "/admin";
        }
      } else {
        throw new Error("Ошибка быстрого входа: " + result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка быстрого входа",
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
      console.error("Quick login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Компонент восстановления пароля
  const ForgotPasswordForm = () => (
    <Card className="shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {resetSent ? "Письмо отправлено" : "Восстановление пароля"}
        </CardTitle>
        <p className="text-gray-600">
          {resetSent
            ? "Проверьте вашу почту и следуйте инструкциям"
            : "Введите email для восстановления пароля"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {resetSent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <Mail className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">
                Письмо с инструкциями отправлено на {resetEmail}
              </p>
              <p className="text-green-600 text-sm mt-2">
                Проверьте папку "Спам", если письмо не пришло в течение 5 минут
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  setResetSent(false);
                  setResetEmail("");
                }}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Отправить повторно
              </Button>

              <Button
                onClick={() => setShowForgotPassword(false)}
                variant="ghost"
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к входу
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email адрес персонала *
              </label>
              <ValidatedInput
                type="email"
                name="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your.email@company.com"
                required
                className="h-11 w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Используйте корпоративный email адрес
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !resetEmail.trim()}
              className="w-full h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправляем...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Отправить инструкции
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              variant="ghost"
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ForgotPasswordForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <SmartForm
          type="staff-login"
          onSubmit={handleStaffLogin}
          isLoading={isLoading}
        />

        {/* Ссылка на восстановление пароля */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Забыли пароль?
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500 text-sm transition-colors"
          >
            Восстановить пароль через отдельную страницу
          </Link>
        </div>

        <div className="text-center space-y-3">
          <p className="text-xs text-gray-500">Другие варианты входа</p>
          <div className="space-y-2">
            <Link href="/member-login" className="block">
              <Button
                variant="outline"
                className="w-full h-10"
                disabled={isLoading}
              >
                👤 Вход для участников
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button
                variant="ghost"
                className="w-full h-8 text-xs"
                disabled={isLoading}
              >
                ← На главную страницу
              </Button>
            </Link>
          </div>
        </div>

        {/* Информация о безопасности персонала */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-sm text-red-900">
              🛡️ Безопасность персонала
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-red-800 space-y-2">
            <p>🔐 Повышенные требования к паролям</p>
            <p>📧 Обязательная проверка email адресов</p>
            <p>🔍 Логирование всех действий</p>
            <p>⚠️ Автоматическая блокировка при подозрительной активности</p>
            <p>🔄 Безопасное восстановление пароля</p>
          </CardContent>
        </Card>

        {/* Быстрый вход для разработки */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm text-yellow-900">
                🧪 Быстрый вход (разработка)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleSuperAdminQuickLogin}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Входим...
                  </>
                ) : (
                  "👑 Быстрый вход супер-админа"
                )}
              </Button>
              <p className="text-xs text-yellow-700 text-center">
                Только для тестирования в режиме разработки
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
