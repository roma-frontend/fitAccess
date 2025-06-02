// components/trainer/TrainerHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTrainer } from "@/contexts/TrainerContext";
import {
  ArrowLeft,
  Users,
  Calendar,
  MessageSquare,
  Star,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Activity,
  TrendingUp,
  Target,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export default function TrainerHeader() {
  const router = useRouter();
  const { stats, messages, workouts } = useTrainer();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();

      if (data.authenticated && data.user?.role === "trainer") {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/staff-login");
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  // Вычисляем данные
  const today = new Date().toISOString().split("T")[0];
  const todayWorkouts = workouts.filter((w) => w.date === today).length;
  const unreadMessages = messages.filter(
    (m) => !m.read && !m.isFromTrainer
  ).length;
  const newNotifications = unreadMessages + (todayWorkouts === 0 ? 1 : 0);

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Основной header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Верхняя строка */}
          <div className="flex items-center justify-between h-16">
            {/* Левая часть */}
            <div className="flex items-center space-x-4">
              {/* Кнопка назад */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Главная</span>
              </Button>

              {/* Аватар и информация о тренере */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                  <AvatarImage src="/avatars/trainer.jpg" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "Т"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {user?.name || "Тренер"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Управление клиентами и тренировками
                  </p>
                </div>
              </div>
            </div>

            {/* Правая часть */}
            <div className="flex items-center gap-3">
              {/* Уведомления */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {newNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                        {newNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Уведомления
                    {newNotifications > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {newNotifications}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {unreadMessages > 0 && (
                    <DropdownMenuItem className="flex items-start gap-3 p-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Новые сообщения</p>
                        <p className="text-xs text-gray-600">
                          У вас {unreadMessages} непрочитанных сообщений
                        </p>
                        <p className="text-xs text-gray-400 mt-1">19:22</p>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {stats.totalClients > 0 && (
                    <DropdownMenuItem className="flex items-start gap-3 p-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Пробные клиенты</p>
                        <p className="text-xs text-gray-600">
                          1 клиентов на пробном периоде
                        </p>
                        <p className="text-xs text-gray-400 mt-1">19:22</p>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {todayWorkouts === 0 && (
                    <DropdownMenuItem className="flex items-start gap-3 p-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Свободный день</p>
                        <p className="text-xs text-gray-600">
                          На сегодня тренировок не запланировано
                        </p>
                        <p className="text-xs text-gray-400 mt-1">19:22</p>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {newNotifications === 0 && (
                    <DropdownMenuItem disabled className="text-center py-4">
                      <span className="text-gray-500">
                        Нет новых уведомлений
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Профиль */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-1"
                  >
                    <span className="hidden sm:block text-sm font-medium">
                      Adam
                    </span>
                    <span className="hidden sm:block text-xs text-gray-500">
                      Тренер
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatars/trainer.jpg" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                          {user?.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "Т"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name || "Adam"}</p>
                        <p className="text-xs text-gray-500">Тренер</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push("/trainer-profile")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки профиля
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Индикатор онлайн */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Онлайн
                </span>
              </div>
            </div>
          </div>

          {/* Нижняя строка с дополнительной информацией */}
          <div className="hidden md:flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Активных клиентов: {stats.activeClients}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Тренировок сегодня: {todayWorkouts}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Рейтинг: {stats.avgRating}</span>
              </div>
              {unreadMessages > 0 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Новых сообщений: {unreadMessages}</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Последнее обновление:{" "}
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"></div>

          {/* Быстрые действия для мобильных */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Быстрые действия
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => router.push("/trainer-dashboard?tab=clients")}
              >
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Клиенты</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => router.push("/trainer-dashboard?tab=schedule")}
              >
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="text-sm">Расписание</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 relative"
                onClick={() => router.push("/trainer-dashboard?tab=messages")}
              >
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Сообщения</span>
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => router.push("/trainer-dashboard")}
              >
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Обзор</span>
              </Button>
            </div>
          </div>

          {/* Информация о статусе для мобильных */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Онлайн
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Activity className="h-4 w-4" />
                <span>Активных: {stats.activeClients}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Target className="h-4 w-4" />
                <span>Сегодня: {todayWorkouts}</span>
              </div>
            </div>
          </div>

          {/* Уведомления для мобильных */}
          {newNotifications > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Уведомления ({newNotifications})
              </h3>
              <div className="space-y-2">
                {unreadMessages > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="font-medium text-sm">Новые сообщения</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      У вас {unreadMessages} непрочитанных сообщений
                    </p>
                  </div>
                )}

                {todayWorkouts === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="font-medium text-sm">Свободный день</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      На сегодня тренировок не запланировано
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
