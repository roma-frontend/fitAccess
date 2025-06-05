// app/register/page.tsx
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnhancedSmartForm } from "@/components/EnhancedSmartForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (formData: any) => {
    setIsLoading(true);

    try {
      console.log("📡 Отправляем запрос на регистрацию с валидированными данными...");
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Регистрация успешна! 🎉",
          description: "Ваш аккаунт создан с надежной защитой",
        });
        
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        
      } else {
        throw new Error(data.error || "Произошла ошибка при регистрации");
      }
    } catch (error) {
      console.error("❌ Ошибка регистрации:", error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <EnhancedSmartForm
          type="register"
          onSubmit={handleRegister}
          isLoading={isLoading}
          autoValidate={true}
          showValidationSummary={true}
        />

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Войти
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 block">
            ← Вернуться на главную
          </Link>
        </div>

        {/* Информация о защите данных */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-sm text-green-900 flex items-center">
              🛡️ Ваша безопасность - наш приоритет
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-green-800 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>Проверка реальности email адресов</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>Анализ надежности паролей в реальном времени</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>Защита от распространенных угроз</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>Шифрование данных при передаче</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>Соответствие современным стандартам</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-white/50 rounded-md">
              <p className="text-center font-medium">
                ✨ Интеллектуальная валидация защищает ваши данные
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Подсказки по созданию надежного пароля */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-900">💡 Советы по созданию надежного пароля</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-blue-800 space-y-2">
            <div className="space-y-1">
              <p>🔹 Используйте минимум 8 символов</p>
              <p>🔹 Комбинируйте буквы, цифры и символы</p>
              <p>🔹 Избегайте личной информации</p>
              <p>🔹 Не используйте распространенные пароли</p>
              <p>🔹 Создайте уникальный пароль для каждого сайта</p>
            </div>
            <div className="mt-2 p-2 bg-blue-100 rounded-md">
              <p className="text-center font-medium">
                🎯 Наша система поможет создать идеальный пароль!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
