// components/member/MemberHeader.tsx
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dumbbell,
  Calendar,
  User,
  Users,
  Bell,
  Plus,
  Menu,
  X,
  Home,
  UserCheck,
  Settings,
  LogOut,
  ChevronDown,
  QrCode,
  CreditCard,
  Clock,
  Target,
  TrendingUp,
  Heart,
  Shield
} from "lucide-react";

interface MemberHeaderProps {
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatar?: string;
  };
  stats?: {
    upcoming: number;
    completed: number;
    totalHours: number;
    daysLeft: number;
  };
  onLogout?: () => void;
}

export default function MemberHeader({ 
  user, 
  stats = { upcoming: 0, completed: 0, totalHours: 0, daysLeft: 15 },
  onLogout 
}: MemberHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Функция для определения активного пути
  const isActivePath = (href: string) => {
    if (href === '/member-dashboard') {
      return pathname === '/member-dashboard';
    }
    return pathname.startsWith(href);
  };

  // Навигационные элементы
  const navItems = [
    {
      label: "Мои записи",
      href: "/member-dashboard/my-bookings",
      icon: Calendar,
      badge: stats.upcoming > 0 ? stats.upcoming.toString() : undefined
    },
    {
      label: "Тренеры",
      href: "/trainers",
      icon: User
    },
    {
      label: "Программы",
      href: "/programs",
      icon: Users
    }
  ];

  // Статистические элементы для header
  const headerStats = [
    {
      value: stats.upcoming.toString(),
      label: "Предстоящих записей",
      color: "text-blue-600 dark:text-blue-400",
      icon: Calendar
    },
    {
      value: stats.completed.toString(),
      label: "Завершено тренировок",
      color: "text-green-600 dark:text-green-400",
      icon: Target
    },
    {
      value: `${stats.totalHours}ч`,
      label: "Часов тренировок",
      color: "text-purple-600 dark:text-purple-400",
      icon: Clock
    },
    {
      value: `${stats.daysLeft}д`,
      label: "До конца абонемента",
      color: "text-orange-600 dark:text-orange-400",
      icon: TrendingUp
    }
  ];

  const unreadNotifications = 1; // Мок количество непрочитанных

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "/";
      } catch (error) {
        console.error("Ошибка выхода:", error);
      }
    }
  };

  return (
    <>
      {/* Основной header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="w-full max-w-none">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6 xl:px-8">
            
            {/* Левая часть - Логотип */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div 
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group min-w-0"
                onClick={() => router.push('/member-dashboard')}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg flex-shrink-0">
                  <Dumbbell className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="hidden sm:block min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                    FitAccess
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Личный кабинет</p>
                </div>
              </div>
            </div>

            {/* Центральная часть - Навигация (скрыта на мобильных и планшетах) */}
            <nav className="hidden xl:flex items-center space-x-1 flex-1 justify-center max-w-2xl mx-4">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className={`relative flex items-center gap-2 px-3 py-2 transition-all duration-200 ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        className={`ml-1 text-xs ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Правая часть - Статистика и действия */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              
              {/* Статистика (только на очень больших экранах) */}
              <div className="hidden 2xl:flex items-center space-x-4 mr-4">
                {headerStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center group cursor-pointer">
                      <div className="flex items-center gap-1 mb-1">
                        <IconComponent className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
                        <div className={`text-lg font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Быстрые действия */}
              <div className="hidden sm:flex items-center space-x-1 sm:space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/trainers')}
                  className="flex items-center gap-1 sm:gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 border-gray-200 dark:border-gray-700 px-2 sm:px-3 h-8 sm:h-9"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden md:inline text-sm">Записаться</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => router.push('/qr-code')}
                  className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-2 sm:px-3 h-8 sm:h-9"
                >
                  <QrCode className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden md:inline text-sm">QR-код</span>
                </Button>
              </div>

              {/* Уведомления */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center rounded-full animate-pulse">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuLabel className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                    <span>Уведомления</span>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {unreadNotifications} новое
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  
                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            Напоминание о тренировке
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            Завтра в 14:00 - тренировка с Адамом Петровым
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 часа назад</p>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem className="text-center text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    Посмотреть все уведомления
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Профиль пользователя */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 min-w-0"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold text-xs sm:text-sm">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'У'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user?.name || user?.email || 'Участник'}
                      </p>
                                            <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-600 truncate">Участник</span>
                      </div>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 hidden md:block flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 sm:w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                          {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'У'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{user?.name || 'Участник'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        <Badge className="text-xs mt-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Участник
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  
                  <DropdownMenuItem onClick={() => router.push('/member-profile')} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <UserCheck className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Мой профиль</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push('/member-dashboard/my-bookings')} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Мои записи</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push('/qr-code')} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <QrCode className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>QR-код входа</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push('/shop')} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Абонементы</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  
                  {/* Быстрая статистика в профиле для планшетов и мобильных */}
                  <div className="2xl:hidden">
                    <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                      Моя статистика:
                    </DropdownMenuLabel>
                    <div className="px-2 py-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.upcoming}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Записей</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="font-semibold text-green-600 dark:text-green-400">{stats.completed}</div>
                          <div className="text-gray-500 dark:text-gray-400">Завершено</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <div className="font-semibold text-purple-600 dark:text-purple-400">{stats.totalHours}ч</div>
                          <div className="text-gray-500 dark:text-gray-400">Часов</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                          <div className="font-semibold text-orange-600 dark:text-orange-400">{stats.daysLeft}д</div>
                          <div className="text-gray-500 dark:text-gray-400">Осталось</div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  </div>
                  
                  <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="xl:hidden p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
            
            {/* Статистика для мобильных и планшетов */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {headerStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} flex-shrink-0`} />
                      <div className={`text-lg sm:text-xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Навигация для мобильных и планшетов */}
            <div className="space-y-2 mb-4 sm:mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Навигация
              </h3>
              
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-10 sm:h-12 ${
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <IconComponent className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        className={`ml-auto ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Быстрые действия для мобильных и планшетов */}
            <div className="space-y-2 mb-4 sm:mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Быстрые действия
              </h3>
              
              <Button
                onClick={() => {
                  router.push('/trainers');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">Записаться к тренеру</span>
              </Button>

              <Button
                onClick={() => {
                  router.push('/programs');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start h-10 sm:h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                <Users className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">Выбрать программу</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 sm:h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  router.push('/qr-code');
                  setMobileMenuOpen(false);
                }}
              >
                <QrCode className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">QR-код входа</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 sm:h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  router.push('/shop');
                  setMobileMenuOpen(false);
                }}
              >
                <CreditCard className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">Абонементы</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 sm:h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  router.push('/member-profile');
                  setMobileMenuOpen(false);
                }}
              >
                <Settings className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">Настройки профиля</span>
              </Button>

              {/* Переключатель тем в мобильном меню */}
              <div className="sm:hidden flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Тема оформления</span>
                <ThemeToggle />
              </div>
            </div>

            {/* Прогресс-бар абонемента для мобильных и планшетов */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Ваш прогресс</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Тренировки в месяце</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{stats.completed}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((stats.completed / 20) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                                    <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Абонемент</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{stats.daysLeft} дней осталось</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((stats.daysLeft / 30) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Дополнительная информация о прогрессе */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalHours}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Часов всего</div>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {Math.round((stats.completed / 20) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Выполнено</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Информация о пользователе в мобильном меню */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'У'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.name || 'Участник'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <Badge className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Участник
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


