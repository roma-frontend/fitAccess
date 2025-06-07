// app/profile/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { FaceIDSetup } from "@/components/profile/FaceIDSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Необходима авторизация
          </h1>
          <p className="text-gray-600 mb-6">
            Войдите в систему для доступа к профилю
          </p>
          <Button onClick={() => router.push("/member-login")}>
            Войти в систему
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Профиль пользователя
              </h1>
              <p className="text-lg text-gray-600">
                Управление настройками и безопасностью
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Имя
                  </label>
                  <p className="text-lg font-medium text-                  gray-900">
                    {user.name || "Не указано"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-md font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Роль
                  </label>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {user.role}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ID пользователя
                  </label>
                  <p className="text-sm text-gray-500 font-mono truncate">{user.id}</p>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Settings className="h-4 w-4" />
                  Редактировать профиль
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Face ID настройки */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Настройки безопасности
              </h2>
              <p className="text-gray-600">
                Настройте Face ID для быстрого и безопасного входа в систему
              </p>
            </div>

            <FaceIDSetup />
          </div>
        </div>
      </div>
    </div>
  );
}
