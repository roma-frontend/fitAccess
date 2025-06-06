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

// Страницы где показывать лоадер
const PAGES_WITH_LOADER = [
    '/',
    '/about',
    '/admin',
    '/dashboard',
    '/trainer',
    '/manager',
    '/staff-dashboard',
];

// Страницы где НЕ показывать лоадер (исключения)
const PAGES_WITHOUT_LOADER = [
    '/member-dashboard',
    '/trainer-dashboard',
    '/manager/trainers',
    '/manager/analytics',
    '/manager/bookings',
    '/admin/users',
    '/admin/settings',
    '/admin/reports',
    '/admin/analytics',
    '/admin/members',
    '/admin/trainers',
    '/admin/schedules',
    '/shop'
];

// Защищенные маршруты (где всегда нужны провайдеры)
const PROTECTED_ROUTES = [
    '/admin',
    '/dashboard',
    '/trainer',
    '/manager',
    '/member-dashboard',
    '/staff-dashboard',
];

// Функция проверки лоадера
const shouldShowLoader = (pathname: string): boolean => {
    const isExcluded = PAGES_WITHOUT_LOADER.some(page =>
        pathname?.startsWith(page)
    );

    if (isExcluded) return false;

    return PAGES_WITH_LOADER.some(page => pathname?.startsWith(page));
};

// Функция проверки защищенного маршрута
const isProtectedRoute = (pathname: string): boolean => {
    return PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
};

// Мемоизированные компоненты провайдеров
const BaseProviders = memo(({ children }: { children: React.ReactNode }) => {
    console.log('📊 BaseProviders: Инициализация с UnifiedDataProvider');
    return (
        <DashboardProvider>
            <UnifiedDataProvider>
                <ScheduleProvider>
                    {children}
                </ScheduleProvider>
            </UnifiedDataProvider>
        </DashboardProvider>
    );
});

const AdminProviders = memo(({ children }: { children: React.ReactNode }) => {
    console.log('👑 AdminProviders: Инициализация');
    return (
        <AdminProvider>
            <SuperAdminProvider>
                <ManagerProvider>
                    {children}
                </ManagerProvider>
            </SuperAdminProvider>
        </AdminProvider>
    );
});

const TrainerProviders = memo(({ children }: { children: React.ReactNode }) => {
    console.log('🏋️ TrainerProviders: Инициализация');
    return (
        <TrainerProvider>
            {children}
        </TrainerProvider>
    );
});

export const OptimizedProviders = memo(({ children }: OptimizedProvidersProps) => {
    const pathname = usePathname();
    const { authStatus, loading } = useAuth();
    const { isAdmin, isSuperAdmin, isTrainer } = useRole();

    // 🔍 ДОБАВЛЯЕМ ОСНОВНОЕ ЛОГИРОВАНИЕ
    console.log('🔍 OptimizedProviders Debug:', {
        pathname,
        authStatus: authStatus?.authenticated,
        userRole: authStatus?.user?.role,
        loading,
        isAdmin,
        isSuperAdmin,
        isTrainer,
        isProtected: isProtectedRoute(pathname || '')
    });

    // Состояние для контроля лоадера
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(false);

    // Проверяем, нужен ли лоадер
    const needsLoader = useMemo(() => {
        const result = shouldShowLoader(pathname || '');
        console.log('🔄 needsLoader:', result, 'для пути:', pathname);
        return result;
    }, [pathname]);

    // Логика лоадера - минимальное время показа
    useEffect(() => {
        if (needsLoader) {
            console.log('⏱️ Запускаем таймер лоадера на 1500ms');
            const timer = setTimeout(() => {
                console.log('⏱️ Таймер лоадера завершен');
                setIsInitialLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            console.log('⏱️ Лоадер не нужен, сразу завершаем');
            setIsInitialLoading(false);
        }
    }, [needsLoader]);

    // Управляем показом лоадера
    useEffect(() => {
        if (needsLoader) {
            const shouldShow = loading || isInitialLoading;
            console.log('🔄 Обновляем showLoader:', shouldShow, { loading, isInitialLoading });
            setShowLoader(shouldShow);
        } else {
            console.log('🔄 Лоадер не нужен, устанавливаем false');
            setShowLoader(false);
        }
    }, [loading, isInitialLoading, needsLoader]);

    // Определяем нужные провайдеры
    const providersConfig = useMemo(() => {
        console.log('🎯 Определяем конфигурацию провайдеров...');

        // Если показываем лоадер, минимальные провайдеры
        if (showLoader) {
            console.log('🔄 Показываем лоадер, минимальные провайдеры');
            return { needsBase: false, needsAdmin: false, needsTrainer: false };
        }

        // 🚨 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Для защищенных маршрутов всегда загружаем провайдеры
        if (isProtectedRoute(pathname || '')) {
            console.log('🔒 Защищенный маршрут, загружаем провайдеры');

            const isDashboardRoute = pathname?.startsWith('/dashboard');
            const isAdminRoute = pathname?.startsWith('/admin');
            const isTrainerRoute = pathname?.startsWith('/trainer');
            const isManagerRoute = pathname?.startsWith('/manager');
            const isMemberRoute = pathname?.startsWith('/member-dashboard');
            const isStaffRoute = pathname?.startsWith('/staff-dashboard');

            console.log('🛣️ Анализ защищенных маршрутов:', {
                isDashboardRoute,
                isAdminRoute,
                isTrainerRoute,
                isManagerRoute,
                isMemberRoute,
                isStaffRoute,
                loading,
                authStatus: authStatus?.authenticated
            });

            // Базовые провайдеры для всех защищенных маршрутов
            const needsBase = true;

            // Админские провайдеры для админских маршрутов (независимо от роли пока загружается)
            const needsAdmin = isAdminRoute;

            // Тренерские провайдеры для тренерских маршрутов
            const needsTrainer = isTrainerRoute;

            return { needsBase, needsAdmin, needsTrainer };
        }

        // Публичные страницы - без провайдеров
        console.log('🌐 Публичная страница, провайдеры не нужны');
        return { needsBase: false, needsAdmin: false, needsTrainer: false };

    }, [pathname, authStatus, showLoader, isAdmin, isSuperAdmin, isTrainer, loading]);

    // Показываем лоадер
    if (showLoader) {
        console.log('🎬 Рендерим лоадер');
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
                            "Подготавливаем админ-панель...",
                            "Загружаем данные системы...",
                            "Настраиваем права доступа...",
                            "Синхронизируем информацию...",
                            "Подключаем модули управления...",
                            "Почти готово! Финальная настройка..."
                        ]}
                        className="drop-shadow-2xl"
                    />

                    {/* Дополнительная информация */}
                    <div className="mt-12 text-center space-y-4">
                        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <span>Система управления</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-500" />
                                <span>Аналитика данных</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse animation-delay-1000" />
                                <span>Безопасность</span>
                            </div>
                        </div>

                        {/* Версия и статус */}
                        <div className="text-xs text-gray-400 space-y-1">
                            <p>FitFlow Pro v2.0 • Панель администрирования</p>
                            <p className="animate-pulse">🔒 Защищенное соединение • ⚡ Высокая производительность</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    console.log('🎭 Рендерим провайдеры с конфигурацией:', providersConfig);

    // Рендерим провайдеры в правильном порядке
    let content = children;

    // Сначала тренерские провайдеры (если нужны)
    if (providersConfig.needsTrainer) {
        console.log('🏋️ Добавляем TrainerProviders');
        content = <TrainerProviders>{content}</TrainerProviders>;
    }

    // Затем админские провайдеры (если нужны)
    if (providersConfig.needsAdmin) {
        console.log('👑 Добавляем AdminProviders');
        content = <AdminProviders>{content}</AdminProviders>;
    }

    // В конце базовые провайдеры (если нужны)
    if (providersConfig.needsBase) {
        console.log('📊 Добавляем BaseProviders (включая UnifiedDataProvider)');
        content = <BaseProviders>{content}</BaseProviders>;
    }

    console.log('🏁 Финальный рендер с провайдерами');
    return <>{content}</>;
});

OptimizedProviders.displayName = 'OptimizedProviders';
BaseProviders.displayName = 'BaseProviders';
AdminProviders.displayName = 'AdminProviders';
TrainerProviders.displayName = 'TrainerProviders';
