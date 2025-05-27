// components/manager/ManagerHeader.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useManager } from "@/contexts/ManagerContext";
import {
  Dumbbell,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Plus,
  Menu,
  X,
  Home,
  UserCheck,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";

export default function ManagerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { stats, loading } = useManager();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Мок данные для пользователя
  const user = {
    name: "Анна Менеджер",
    email: "anna.manager@fitaccess.com",
    avatar: "/avatars/manager-anna.jpg",
    role: "Менеджер",
  };

  // Функция выхода из системы
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      console.log("🚪 Начинаем процесс выхода из системы...");
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Успешный выход из системы");
        
        toast({
          title: "Выход выполнен",
          description: "Вы успешно вышли из системы",
        });

        // Небольшая задержка для показа уведомления
        setTimeout(() => {
          // Перенаправляем на главную страницу
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error(data.error || "Ошибка при выходе из системы");
      }
    } catch (error) {
      console.error("❌ Ошибка выхода:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка выхода",
        description: error instanceof Error ? error.message : "Не удалось выйти из системы",
      });
      
      // В случае ошибки все равно перенаправляем на главную
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Функция для определения активного пути
  const isActivePath = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
    }
    return pathname.startsWith(href);
  };

  // Навигационные элементы
  const navItems = [
    {
      label: "Тренеры",
      href: "/manager/trainers",
      icon: Users,
      badge: `${stats.activeTrainers}/${stats.totalTrainers}`,
    },
    {
      label: "Записи",
      href: "/manager/bookings",
      icon: Calendar,
      badge: stats.todayBookings.toString(),
    },
    {
      label: "Аналитика",
      href: "/manager/analytics",
      icon: BarChart3,
    },
  ];

  // Статистические элементы для header
  const headerStats = [
    {
      value: `${stats.activeTrainers}/${stats.totalTrainers}`,
      label: "Активных тренеров",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      value: stats.todayBookings.toString(),
      label: "Сегодня записей",
      color: "text-green-600 dark:text-green-400",
    },
    {
      value: stats.newClients.toString(),
      label: "Новых клиентов",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      value: `${(stats.monthlyRevenue / 1000).toFixed(0)}К`,
      label: "Доход за месяц",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  const unreadNotifications = 2;

  return (
    <>
      {/* Основной header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Левая часть - Логотип */}
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => router.push("/")}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    FitAccess
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Панель менеджера</p>
                </div>
              </div>
            </div>

            {/* Центральная часть - Навигация (скрыта на мобильных) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActivePath(item.href);

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className={`relative flex items-center gap-2 px-4 py-2 transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
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
            <div className="flex items-center space-x-3">
              {/* Статистика (только на больших экранах) */}
              <div className="hidden xl:flex items-center space-x-4 mr-4">
                {headerStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка добавления тренера */}
              <Button
                onClick={() => router.push("/manager/trainers/add")}
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoggingOut}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Добавить тренера</span>
                <span className="lg:hidden">Добавить</span>
              </Button>

              {/* Переключатель тем */}
              <ThemeToggle />

              {/* Уведомления */}
              <DropdownMenu
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    disabled={isLoggingOut}
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center rounded-full animate-pulse">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuLabel className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                    <span>Уведомления</span>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {unreadNotifications} новых
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Новый тренер подал заявку
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Дмитрий Козлов ожидает одобрения
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            5 мин назад
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Превышен лимит записей
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            У Адама Петрова 15 записей на завтра
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            1 час назад
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full ml-2 mt-1"></div>
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
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    disabled={isLoggingOut}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold text-sm">
                        АМ
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                          АМ
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <Badge className="text-xs mt-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                  <DropdownMenuItem
                    onClick={() => router.push("/manager/profile")}
                    disabled={isLoggingOut}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Мой профиль
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/manager/settings")}
                    disabled={isLoggingOut}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Быстрая статистика в профиле для мобильных */}
                  <div className="xl:hidden">
                  <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                      Быстрая статистика:
                    </DropdownMenuLabel>
                    <div className="px-2 py-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.activeTrainers}/{stats.totalTrainers}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Тренеры</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {stats.todayBookings}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Записей</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <div className="font-semibold text-purple-600 dark:text-purple-400">
                            {stats.newClients}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Новых</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                          <div className="font-semibold text-orange-600 dark:text-orange-400">
                            {(stats.monthlyRevenue / 1000).toFixed(0)}К
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Доход</div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  </div>

                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Выходим...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                disabled={isLoggingOut}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Статистика для мобильных */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {headerStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Навигация для мобильных */}
            <div className="space-y-2 mb-6">
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
                    className={`w-full justify-start h-12 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
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

            {/* Быстрые действия для мобильных */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Быстрые действия
              </h3>

              <Button
                onClick={() => {
                  router.push("/manager/trainers/add");
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoggingOut}
              >
                <Plus className="mr-3 h-5 w-5" />
                <span className="font-medium">Добавить тренера</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  router.push("/manager/bookings/create");
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingOut}
              >
                <Calendar className="mr-3 h-5 w-5" />
                <span className="font-medium">Создать запись</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  router.push("/manager/settings");
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingOut}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span className="font-medium">Настройки</span>
              </Button>
            </div>

            {/* Профиль и выход для мобильных */}
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Профиль
              </h3>

              {/* Информация о пользователе */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    АМ
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <Badge className="text-xs mt-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  router.push("/manager/profile");
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingOut}
              >
                <UserCheck className="mr-3 h-5 w-5" />
                <span className="font-medium">Мой профиль</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <span className="font-medium">Выходим...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="font-medium">Выйти из системы</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay для блокировки интерфейса во время выхода */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Выходим из системы...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Пожалуйста, подождите</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


