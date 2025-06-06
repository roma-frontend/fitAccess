// components/providers/OptimizedProviders.tsx
"use client";

import { memo, useMemo, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, useRole } from '@/hooks/useAuth';
import FitnessLoader from '@/components/ui/FitnessLoader';

// Импорты провайдеров
import { DashboardProvider } from "@/contexts/DashboardContext";
import { UnifiedDataProvider } from "@/contexts/UnifiedDataContext";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { ManagerProvider } from "@/contexts/ManagerContext";
import { TrainerProvider } from "@/contexts/TrainerContext";

interface OptimizedProvidersProps {
  children: React.ReactNode;
}

// Мемоизированные компоненты провайдеров
const BaseProviders = memo(({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>
    <UnifiedDataProvider>
      <ScheduleProvider>
        {children}
      </ScheduleProvider>
    </UnifiedDataProvider>
  </DashboardProvider>
));

const AdminProviders = memo(({ children }: { children: React.ReactNode }) => (
  <AdminProvider>
    <SuperAdminProvider>
      <ManagerProvider>
        {children}
      </ManagerProvider>
    </SuperAdminProvider>
  </AdminProvider>
));

const TrainerProviders = memo(({ children }: { children: React.ReactNode }) => (
  <TrainerProvider>
    {children}
  </TrainerProvider>
));

export const OptimizedProviders = memo(({ children }: OptimizedProvidersProps) => {
  const pathname = usePathname();
  const { authStatus, loading } = useAuth();
  const { isAdmin, isSuperAdmin, isTrainer } = useRole();
  
  // Состояние для контроля минимального времени показа лоадера
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  // Минимальное время показа лоадера (1.5 секунды)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Управляем показом лоадера
  useEffect(() => {
    if (!loading && !isInitialLoading) {
      setShowLoader(false);
    }
  }, [loading, isInitialLoading]);

  // Определяем нужные провайдеры на основе маршрута и роли
  const providersConfig = useMemo(() => {
    // Если загружается аутентификация, минимальные провайдеры
    if (showLoader) {
      return { needsBase: false, needsAdmin: false, needsTrainer: false };
    }

    // Публичные страницы - без дополнительных провайдеров
    if (!authStatus?.authenticated || pathname === '/') {
      return { needsBase: false, needsAdmin: false, needsTrainer: false };
    }

    // Страницы дашборда
    const isDashboardRoute = pathname?.startsWith('/dashboard');
    const isAdminRoute = pathname?.startsWith('/admin');
    const isTrainerRoute = pathname?.startsWith('/trainer');

    const needsBase = isDashboardRoute || isAdminRoute || isTrainerRoute;
    const needsAdmin = isAdminRoute && (isAdmin || isSuperAdmin);
    const needsTrainer = isTrainerRoute && isTrainer;

    return { needsBase, needsAdmin, needsTrainer };
  }, [pathname, authStatus, showLoader, isAdmin, isSuperAdmin, isTrainer]);

  // Показываем лоадер
  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Статичный фон */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-green-500/10 rounded-full" />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-purple-500/10 rounded-full" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-500/10 rounded-full" />
          
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-green-400/20 to-transparent rounded-full" />
        </div>

        {/* Основной лоадер */}
        <div className="relative z-10">
          <FitnessLoader 
            size="xl" 
            variant="dumbbell"
            text="FitFlow Pro"
            showProgress={true}
            motivationalTexts={[
              "Подготавливаем вашу фитнес-экосистему...",
              "Загружаем персональные программы...",
              "Синхронизируем данные тренировок...",
              "Настраиваем аналитику прогресса...",
              "Подключаем умные уведомления...",
              "Почти готово! Финальная настройка..."
            ]}
            className="drop-shadow-2xl"
          />
        </div>
      </div>
    );
  }

  // Рендерим только нужные провайдеры
  let content = children;

  if (providersConfig.needsTrainer) {
    content = <TrainerProviders>{content}</TrainerProviders>;
  }

  if (providersConfig.needsAdmin) {
    content = <AdminProviders>{content}</AdminProviders>;
  }

  if (providersConfig.needsBase) {
    content = <BaseProviders>{content}</BaseProviders>;
  }

  return <>{content}</>;
});

OptimizedProviders.displayName = 'OptimizedProviders';
BaseProviders.displayName = 'BaseProviders';
AdminProviders.displayName = 'AdminProviders';
TrainerProviders.displayName = 'TrainerProviders';
