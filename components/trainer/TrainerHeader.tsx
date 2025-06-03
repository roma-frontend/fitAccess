// components/trainer/TrainerHeader.tsx (полная версия)
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';
import { Bell, Settings, LogOut, User, Menu, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TrainerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { user, logout, token } = useAuth();
  const { messageStats, workoutStats, isLoading, error, loadingStep, refetch } = useTrainerDataQuery();

  const handleLogout = async () => {
    await logout();
  };

  const unreadCount = messageStats?.unreadMessages || 0;
  const todayWorkouts = workoutStats?.todayWorkouts || 0;

  // Если загрузка длится больше 10 секунд, показываем отладку
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowDebug(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setShowDebug(false);
    }
  }, [isLoading]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип и название */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href={"/"} className="text-xl font-bold text-gray-900">
                  FitnessPro
                </Link>
              </div>
              <div className="hidden md:block ml-6">
                <span className="text-sm text-gray-500">Панель тренера</span>
              </div>
            </div>

            {/* Центральная информация */}
            <div className="hidden md:flex items-center space-x-6">
              {!isLoading ? (
                <>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Тренировок сегодня:</span>
                    <Badge variant="secondary" className="ml-2">
                      {todayWorkouts}
                    </Badge>
                  </div>
                  {unreadCount > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Непрочитанных:</span>
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center text-sm text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                  <span>{loadingStep || 'Загрузка...'}</span>
                  {showDebug && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                      className="ml-2"
                    >
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Правая часть */}
            <div className="flex items-center space-x-4">
              {/* Кнопка отладки (если есть проблемы) */}
              {(error || showDebug) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  className="text-orange-600 border-orange-600"
                >
                  Перезагрузить
                </Button>
              )}

              {/* Уведомления */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isLoading ? (
                    <DropdownMenuItem>
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span className="text-sm text-gray-500">{loadingStep || 'Загрузка...'}</span>
                      </div>
                    </DropdownMenuItem>
                  ) : error ? (
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-red-600">Ошибка загрузки</p>
                        <p className="text-xs text-red-500">{error}</p>
                      </div>
                    </DropdownMenuItem>
                  ) : unreadCount > 0 ? (
                    <>
                      <DropdownMenuItem>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">Новые сообщения</p>
                          <p className="text-xs text-gray-500">
                            У вас {unreadCount} непрочитанных сообщений
                          </p>
                        </div>
                      </DropdownMenuItem>
                      {todayWorkouts > 0 && (
                        <DropdownMenuItem>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">Тренировки сегодня</p>
                            <p className="text-xs text-gray-500">
                              Запланировано {todayWorkouts} тренировок
                            </p>
                          </div>
                        </DropdownMenuItem>
                      )}
                    </>
                  ) : (
                    <DropdownMenuItem>
                      <p className="text-sm text-gray-500">Нет новых уведомлений</p>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Профиль пользователя */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.name || 'Тренер'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || 'Тренер'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </DropdownMenuItem>
                  {showDebug && (
                    <DropdownMenuItem onClick={() => setShowDebug(!showDebug)}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <span>Отладка</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Мобильное меню */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-4">
                {/* Статистика для мобильных */}
                {!isLoading ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Тренировок сегодня:</span>
                      <Badge variant="secondary">{todayWorkouts}</Badge>
                    </div>
                    {unreadCount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Непрочитанных:</span>
                        <Badge variant="destructive">{unreadCount}</Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center text-sm text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                    <span>{loadingStep || 'Загрузка данных...'}</span>
                  </div>
                )}
                
                {/* Навигация для мобильных */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Настройки
                    </Button>
                    {(error || showDebug) && (
                      <Button variant="ghost" className="w-full justify-start text-orange-600" onClick={refetch}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Перезагрузить данные
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Выйти
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Панель отладки */}
      {showDebug && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="font-semibold text-yellow-800 mb-2">Отладочная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Токен:</strong> {token ? '✅ Есть' : '❌ Нет'}</p>
                <p><strong>Пользователь:</strong> {user ? '✅ Есть' : '❌ Нет'}</p>
                <p><strong>Загрузка:</strong> {isLoading ? '🔄 Да' : '✅ Нет'}</p>
              </div>
              <div>
                <p><strong>Ошибка:</strong> {error || 'Нет'}</p>
                <p><strong>Этап:</strong> {loadingStep || 'Нет'}</p>
              </div>
              <div>
                <Button onClick={refetch} size="sm" className="mr-2">
                  Перезагрузить
                </Button>
                <Button onClick={() => setShowDebug(false)} size="sm" variant="outline">
                  Скрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
