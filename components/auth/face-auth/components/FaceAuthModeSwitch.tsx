// components/auth/face-auth/components/FaceAuthModeSwitch.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lock, UserPlus, Scan } from "lucide-react";
import type { FaceAuthProps } from "../types";

export function FaceAuthModeSwitch({ mode, setMode, router, authStatus }: FaceAuthProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
      <CardContent className="p-4">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            
            {/* Вход по Face ID */}
            <button
              onClick={() => setMode('login')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Scan className="h-4 w-4" />
              <span>Вход по Face ID</span>
            </button>

            {/* Обычная регистрация */}
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Создать аккаунт</span>
            </button>

            {/* Обычный вход */}
            <button
              onClick={() => router.push('/member-login')}
              className="px-6 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <Lock className="h-4 w-4" />
              <span>Вход по паролю</span>
            </button>
          </div>
        </div>

        {/* Инструкция */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <strong>Новый пользователь?</strong> Сначала создайте аккаунт, затем настройте Face ID в профиле
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
