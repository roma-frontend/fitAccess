// app/mobile-scanner/[sessionId]/mobile-scanner-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from 'next/dynamic';

interface FaceDescriptor {
  id: string;
  name: string;
  faceDescriptor: number[];
}

interface MobileScannerClientProps {
  sessionId: string;
}

// Dynamically import face-api to avoid SSR issues
const FaceAPIComponent = dynamic(
  () => import('./face-api-component'),
  { 
    ssr: false,
    loading: () => (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="font-medium text-blue-900">
              Загрузка библиотеки распознавания лиц...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
);

export function MobileScannerClient({ sessionId }: MobileScannerClientProps) {
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const faceDescriptors = useQuery(api.users.getAllFaceDescriptors) || [];

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ["mobile", "android", "iphone", "ipad", "tablet"];
      return mobileKeywords.some((keyword) => userAgent.includes(keyword));
    };

    setIsMobile(checkMobile());
    setCurrentUrl(window.location.href);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на сессию скопирована в буфер обмена",
      });
    } catch (error) {
      console.error("Ошибка копирования:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              📱 Мобильный сканер лица
            </CardTitle>
            <CardDescription>Сессия: {sessionId}</CardDescription>
          </CardHeader>
        </Card>

        <FaceAPIComponent 
          sessionId={sessionId}
          faceDescriptors={faceDescriptors}
          isMobile={isMobile}
        />

        {/* Alternative options */}
        <div className="space-y-4 mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Альтернативы</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => (window.location.href = "/login")}
              variant="outline"
              className="w-full"
            >
              🔐 Войти по паролю
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full"
            >
              🏠 Вернуться на главную
            </Button>
          </div>
        </div>

        {/* Information cards */}
        <div className="mt-6 space-y-4">
          {faceDescriptors.length === 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <p className="font-medium text-orange-900">
                  Нет зарегистрированных лиц
                </p>
                <p className="text-sm text-orange-800 mt-1">
                  Обратитесь к администратору для регистрации вашего лица в системе.
                </p>
              </CardContent>
            </Card>
          )}

          {faceDescriptors.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="font-medium text-green-900">
                  Система готова к работе
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Найдено {faceDescriptors.length} зарегистрированных лиц в базе данных.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Mobile scanning tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">
                📱 Советы для мобильного сканирования:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Держите телефон вертикально</li>
                <li>• Убедитесь, что лицо хорошо освещено</li>
                <li>• Держите устройство на расстоянии 30-50 см от лица</li>
                <li>• Смотрите прямо в камеру</li>
                <li>• Избегайте резких движений</li>
                {isMobile && (
                  <li>• Используйте кнопку переключения камеры при необходимости</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Session info */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">
                📲 Поделиться ссылкой:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-purple-800">
                  Скопируйте ссылку для быстрого доступа к этой сессии:
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={currentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-l bg-white"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="rounded-l-none border-l-0 border-purple-200"
                  >
                    📋
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
