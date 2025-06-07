// app/profile/face-id/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { FaceIDSetup } from "@/components/profile/FaceIDSetup";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scan } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FaceIDPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/member-login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Scan className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Настройка Face ID
              </h1>
              <p className="text-lg text-gray-600">
                Быстрый и безопасный вход по лицу
              </p>
            </div>
          </div>
        </div>

        {/* Face ID Setup Component */}
        <FaceIDSetup />
        
        {/* Дополнительная информация */}
        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Как работает Face ID?
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Сканирование лица</p>
                <p>Система создает уникальный цифровой отпечаток вашего лица</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Безопасное хранение</p>
                <p>Данные шифруются и хранятся только на наших серверах</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Быстрый вход</p>
                <p>Входите в систему за 2 секунды без ввода пароля</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
