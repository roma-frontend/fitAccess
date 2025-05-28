// app/admin/layout.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useAuth'; // Используем usePermissions из useAuth
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { useRoleTexts, getContextualHints } from '@/lib/roleTexts';
import { SuperAdminProvider } from '@/contexts/SuperAdminContext';
import { PersonalizedNotifications } from '@/components/admin/PersonalizedNotifications';
import { PersonalizedStats } from '@/components/admin/PersonalizedStats';
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  Shield,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Menu,
  X,
  Bell,
  Search,
  RefreshCw,
  MessageCircle,
  ShoppingBasket
} from "lucide-react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth(); // Используем user вместо userRole
  const userRole = user?.role; // Получаем роль из user
  const permissions = usePermissions(); // Используем хук из useAuth
  const roleTexts = useRoleTexts(userRole);
  
  const {
    events,
    loading: scheduleLoading,
    error: scheduleError,
    isOnline,
    retryCount,
    lastSync,
    syncAllData
  } = useUnifiedData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [showMobileStats, setShowMobileStats] = useState(false);

  // Получаем контекстные подсказки
  const hints = getContextualHints(userRole);

  // Навигационные элементы с проверкой прав доступа
  const navigationItems = useMemo(() => {
    const items = [
      {
        href: '/admin',
        label: roleTexts.dashboardTitle,
        icon: LayoutDashboard,
        permission: null
      },
      {
        href: '/admin/users',
        label: roleTexts.usersTitle,
        icon: Users,
        permission: { resource: 'users', action: 'read' }
      },
      {
        href: '/admin/analytics',
        label: roleTexts.reportsTitle,
        icon: BarChart3,
        permission: { resource: 'analytics', action: 'read' }
      },
      {
        href: '/admin/products',
        label: roleTexts.productsTitle,
        icon: ShoppingBasket,
        permission: { resource: 'products', action: 'read' }
      },
      {
        href: '/admin/schedule',
        label: roleTexts.scheduleTitle,
        icon: Calendar,
        permission: { resource: 'schedule', action: 'read' }
      },     
      {
        href: '/admin/messages',
        label: roleTexts.messagesTitle,
        icon: MessageCircle,
        permission: { resource: 'messages', action: 'read' }
      },
      {
        href: '/admin/settings',
        label: roleTexts.settingsTitle,
        icon: Settings,
        permission: { resource: 'settings', action: 'read' }
      },
    ];

    return items.filter(item => {
      if (!item.permission) return true;
      return permissions.checkPermission(item.permission.resource, item.permission.action);
    });
  }, [permissions, roleTexts]);

  // Статистика для сайдбара
  const sidebarStats = useMemo(() => {
    const today = new Date();
    const todayEvents = events.filter(event => {
      try {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    });

    const thisWeekEvents = events.filter(event => {
      try {
        const eventDate = new Date(event.startTime);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventDate >= weekStart && eventDate <= weekEnd;
      } catch {
        return false;
      }
    });

    const completionRate = events.length > 0 
      ? (events.filter(e => e.status === 'completed').length / events.length) * 100 
      : 0;

    return {
      todayEvents,
      thisWeekEvents,
      completionRate
    };
  }, [events]);

  // Определяем статус системы
  const systemStatus = useMemo(() => {
    if (scheduleError) {
      return {
        text: roleTexts.warningMessages?.offlineMode || 'Работа в автономном режиме',
        color: 'text-red-600',
        bgColor: 'from-red-50 to-red-100',
        icon: AlertTriangle
      };
    }
    
    if (isOnline) {
      return {
        text: userRole === 'super-admin' ? 'Все системы работают' : 'Система работает',
        color: 'text-green-600',
        bgColor: 'from-green-50 to-green-100',
        icon: CheckCircle
      };
    }
    
    return {
      text: 'Проверка соединения...',
      color: 'text-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100',
      icon: RefreshCw
    };
  }, [scheduleError, isOnline, userRole, roleTexts]);

  const StatusIcon = systemStatus.icon;

  // Если пользователь не авторизован
  if (!user || !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Мобильная шапка */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">
              {roleTexts.dashboardTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <PersonalizedNotifications />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileStats(!showMobileStats)}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Мобильная статистика */}
        {showMobileStats && (
          <div className="mt-4 border-t pt-4">
            <PersonalizedStats />
          </div>
        )}
      </div>

      <div className="flex">
        {/* Мобильное меню */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Навигация</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <nav className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Десктопный сайдбар */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white/90 backdrop-blur-sm border-r shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">FitAccess</h2>
                <p className="text-sm text-gray-600">{roleTexts.dashboardTitle}</p>
              </div>
            </div>

            {/* Информация о пользователе */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Пользователь'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {roleTexts.roleDisplayName}
                  </p>
                </div>
                <PersonalizedNotifications />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Навигация */}
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Живая статистика */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border mx-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {roleTexts.statsTitle || 'Статистика'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Всего событий:</span>
                  <div className="text-right">
                    <span className="font-medium text-blue-600">{events.length}</span>
                    <div className="text-xs text-blue-600">в системе</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{roleTexts.sessionsLabel || 'Сессии'}:</span>
                  <div className="text-right">
                    <span className="font-medium text-green-600">{sidebarStats.todayEvents.length}</span>
                    <div className="text-xs text-green-600">сегодня</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">На неделе:</span>
                  <div className="text-right">
                    <span className="font-medium text-purple-600">{sidebarStats.thisWeekEvents.length}</span>
                    <div className="text-xs text-purple-600">событий</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Завершено:</span>
                  <div className="text-right">
                    <span className="font-medium text-orange-600">{sidebarStats.completionRate.toFixed(1)}%</span>
                    <div className="text-xs text-orange-600">успешность</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Статус системы */}
            <div className={`mt-4 mx-4 p-3 rounded-lg bg-gradient-to-r ${systemStatus.bgColor} border`}>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${systemStatus.color} ${
                  systemStatus.icon === RefreshCw && scheduleLoading ? 'animate-spin' : ''
                                }`} />
                <span className={`text-sm font-medium ${systemStatus.color}`}>
                  {systemStatus.text}
                </span>
              </div>
              
              {lastSync && (
                <div className="text-xs text-gray-600 mt-1">
                  Обновлено: {lastSync.toLocaleTimeString()}
                </div>
              )}
              
              {retryCount > 0 && !isOnline && (
                <div className="text-xs text-orange-600 mt-1">
                  Попытка {retryCount}/5...
                </div>
              )}
              
              {scheduleError && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncAllData}
                    className="text-xs h-7"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Повторить
                  </Button>
                </div>
              )}
            </div>

            {/* Контекстные подсказки */}
            {showHints && hints.length > 0 && (
              <div className="mt-4 mx-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Подсказки
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHints(false)}
                    className="h-5 w-5 p-0 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {hints.slice(0, 3).map((hint, index) => (
                    <div key={index} className="text-xs text-yellow-700 flex items-start gap-1">
                      <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Персонализированные быстрые действия для сайдбара */}
            <div className="mt-4 mx-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Быстрые действия
              </h4>
              <div className="space-y-2">
                {userRole === 'super-admin' && (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Users className="h-3 w-3 mr-2" />
                      Управление пользователями
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Shield className="h-3 w-3 mr-2" />
                      Настройки безопасности
                    </Button>
                  </>
                )}
                
                {userRole === 'admin' && (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Финансовые отчеты
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Users className="h-3 w-3 mr-2" />
                      Добавить тренера
                    </Button>
                  </>
                )}
                
                {userRole === 'manager' && (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Calendar className="h-3 w-3 mr-2" />
                      Управление расписанием
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Users className="h-3 w-3 mr-2" />
                      Команда тренеров
                    </Button>
                  </>
                )}
                
                {userRole === 'trainer' && (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Users className="h-3 w-3 mr-2" />
                      Мои клиенты
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Calendar className="h-3 w-3 mr-2" />
                      Создать тренировку
                    </Button>
                  </>
                )}
                
                {(userRole === 'member' || userRole === 'client') && (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <Calendar className="h-3 w-3 mr-2" />
                      Записаться на занятие
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Мой прогресс
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Футер сайдбара */}
          <div className="p-4 border-t bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={syncAllData}
                  disabled={scheduleLoading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${scheduleLoading ? 'animate-spin' : ''}`} />
                </Button>
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Десктопная шапка */}
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-30">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {roleTexts.dashboardTitle}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {roleTexts.dashboardSubtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Поиск */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Поиск ${userRole === 'trainer' ? 'клиентов...' : 
                                    userRole === 'client' ? 'тренеров...' : 
                                    'пользователей...'}`}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                    </div>
                    
                    {/* Уведомления */}
                    <PersonalizedNotifications />
                    
                    {/* Обновление */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncAllData}
                      disabled={scheduleLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${scheduleLoading ? 'animate-spin' : ''}`} />
                      Обновить
                    </Button>

                    {/* Информация о пользователе в шапке */}
                    <div className="flex items-center gap-3 pl-4 border-l">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.name || 'Пользователь'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {roleTexts.roleDisplayName}
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Контент страницы */}
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Глобальные уведомления */}
      {lastSync && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {roleTexts.successMessages?.dataUpdated || 'Данные обновлены'}
            </div>
          </div>
        </div>
      )}

      {/* Индикатор загрузки */}
      {scheduleLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg text-sm border border-blue-200">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Синхронизация данных...
            </div>
          </div>
        </div>
      )}

      {/* Индикатор ошибки */}
      {scheduleError && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg text-sm border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ошибка загрузки данных
            </div>
          </div>
        </div>
      )}

      {/* Персонализированные всплывающие подсказки */}
      {userRole === 'trainer' && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-xs">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Совет тренера</div>
                <div className="text-blue-700">
                  Не забудьте обновить программы тренировок для ваших клиентов
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Кастомные стили для анимаций */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Кастомный скроллбар для сайдбара */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SuperAdminProvider>
  );
}

