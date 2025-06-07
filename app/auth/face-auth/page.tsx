// app/auth/face-auth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { FaceAuthDesktop } from "@/components/auth/face-auth/FaceAuthDesktop";
import { FaceAuthMobile } from "@/components/auth/face-auth/FaceAuthMobile";
import type { FaceDetectionData } from "@/components/auth/face-scanner/video-scanner";
import { toast } from "@/hooks/use-toast";

type ViewMode = 'desktop' | 'mobile';
type AuthMode = 'login' | 'register';

export default function FaceAuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceData, setFaceData] = useState<FaceDetectionData | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  
  const { authStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<AuthMode>('login');

  // Определяем режим работы и вид
  useEffect(() => {
    const mobileMode = searchParams.get('mobile') === 'true';
    if (mobileMode) setViewMode('mobile');
    
    setMode(authStatus?.authenticated ? 'register' : 'login');
  }, [authStatus, searchParams]);

  const handleFaceDetected = (faceDetectionData: FaceDetectionData) => {
    setFaceData(faceDetectionData);
    setScanCount(prev => prev + 1);
    setLastScanTime(new Date());
  };

  const switchMode = (newMode: ViewMode) => {
    const newUrl = newMode === 'mobile' 
      ? `${window.location.pathname}?mobile=true&session=${sessionId}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setViewMode(newMode);
  };

  const sharedProps = {
    mode,
    setMode,
    faceData,
    sessionId,
    scanCount,
    lastScanTime,
    isRegistering,
    setIsRegistering,
    authStatus,
    router,
    onFaceDetected: handleFaceDetected,
    onSwitchMode: switchMode
  };

  const handleFaceLogin = async (faceDetectionData: FaceDetectionData) => {
  if (!faceDetectionData.descriptor) {
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Не удалось получить дескриптор лица",
    });
    return;
  }

  toast({
    title: "🔍 Поиск пользователя",
    description: "Ищем совпадения в базе данных...",
  });
  
  // Имитация поиска в базе данных
  setTimeout(() => {
    // Здесь будет реальный поиск по дескриптору лица
    const userFound = false; // Заменить на реальную логику
    
    if (userFound) {
      toast({
        title: "✅ Добро пожаловать!",
        description: "Вход выполнен успешно",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "👤 Пользователь не найден",
        description: "Face ID не зарегистрирован. Войдите по паролю и настройте Face ID в профиле.",
        action: (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => router.push('/member-login')}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
            >
              Войти по паролю
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded"
            >
              Регистрация
            </button>
          </div>
        ),
      });
    }
  }, 2000);
};

  return viewMode === 'mobile' 
    ? <FaceAuthMobile {...sharedProps} />
    : <FaceAuthDesktop {...sharedProps} />;
}
