// components/MainHeader.tsx (обновленная версия)
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
import {
  Dumbbell,
  ArrowRight,
  LogOut,
  Settings,
  User,
  Shield,
  ChevronDown,
  Menu,
  X,
  Home,
  Users,
  Calendar,
  Bell,
  ExternalLink,
} from "lucide-react";


interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
  dashboardUrl?: string;
}


interface MainHeaderProps {
  authStatus: AuthStatus | null;
  isLoading: boolean;
  onLogout: () => void;
}


export default function MainHeader({
  authStatus,
  isLoading,
  onLogout,
}: MainHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "member":
        return "Участник";
      case "admin":
        return "Администратор";
      case "super-admin":
        return "Супер Администратор";
      case "manager":
        return "Менеджер";
      case "trainer":
        return "Тренер";
      default:
        return "Пользователь";
    }
  };


  const handleDashboardRedirect = () => {
    if (authStatus?.dashboardUrl) {
      router.push(authStatus.dashboardUrl);
    }
  };


  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }


  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Левая часть - Логотип и название */}
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-lg"
                onClick={() => router.push("/")}
              >
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-300"
                  onClick={() => router.push("/")}
                >
                  FitAccess
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Умная система управления
                </p>
              </div>
            </div>


            {/* Правая часть */}
            <div className="flex items-center space-x-4">
              {authStatus?.authenticated ? (
                <>
                  {/* Навигационные иконки - только для авторизованных */}
                  <div className="hidden md:flex items-center space-x-2">
                    {/* Уведомления */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center rounded-full">
                        3
                      </Badge>
                    </Button>


                    {/* Тренеры */}
                    <Button
                      onClick={() => router.push("/trainers")}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <Users className="h-5 w-5" />
                      <span className="hidden lg:inline">Тренеры</span>
                    </Button>
                  </div>


                  {/* Основная кнопка дашборда */}
                  <Button
                    onClick={handleDashboardRedirect}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <span>Перейти в дашборд</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>


                  {/* Профиль пользователя */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                          <AvatarImage
                            src={`/avatars/${authStatus.user?.role}.jpg`}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold text-sm">
                            {authStatus.user?.name
                              ? authStatus.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {authStatus.user?.name || "Adam"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getRoleDisplayName(authStatus.user?.role || "")}
                          </p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/avatars/${authStatus.user?.role}.jpg`}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                              {authStatus.user?.name
                                ? authStatus.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {authStatus.user?.name || "Adam"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {authStatus.user?.email}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {getRoleDisplayName(authStatus.user?.role || "")}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />


                      <DropdownMenuItem onClick={handleDashboardRedirect}>
                        <Shield className="mr-2 h-4 w-4" />
                        Мой дашборд
                        <ExternalLink className="ml-auto h-3 w-3" />
                      </DropdownMenuItem>


                      <DropdownMenuItem
                        onClick={() => router.push("/trainer/profile")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Мой профиль
                      </DropdownMenuItem>


                      <DropdownMenuSeparator />


                      <DropdownMenuItem
                        onClick={onLogout}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Кнопки входа для неавторизованных пользователей */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <Button
                      onClick={() => router.push("/demo-smart-login")}
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-600 hover:bg-purple-50 transition-all duration-200"
                    >
                      🤖 Демо вход
                    </Button>


                    <Button
                      onClick={() => router.push("/face-login")}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 transition-all duration-200"
                    >
                      Умный вход
                    </Button>


                    <Button
                      onClick={() => router.push("/member-login")}
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                    >
                      Войти
                    </Button>
                  </div>


                  {/* Debug кнопка для разработки */}
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      onClick={() => router.push("/debug-auth")}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hidden lg:flex"
                    >
                      Debug
                    </Button>
                  )}
                </>
              )}


              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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


      {/* Упрощенное мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {authStatus?.authenticated ? (
              <div className="space-y-3">
                {/* Информация о пользователе */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/avatars/${authStatus.user?.role}.jpg`}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                      {authStatus.user?.name
                        ? authStatus.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {authStatus.user?.name || "Adam"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getRoleDisplayName(authStatus.user?.role || "")}
                    </p>
                  </div>
                </div>


                {/* Основная кнопка */}
                <Button
                  onClick={() => {
                    handleDashboardRedirect();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center"
                >
                  Перейти в дашборд
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>


                {/* Дополнительные действия */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600"
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки профиля
                  </Button>


                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Кнопки входа для мобильных */}
                <Button
                  onClick={() => {
                    router.push("/demo-smart-login");
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-center text-purple-600 border-purple-600"
                >
                  🤖 Демо умного входа
                </Button>


                <Button
                  onClick={() => {
                    router.push("/face-login");
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-center text-blue-600 border-blue-600"
                >
                  Умный вход
                </Button>


                <Button
                  onClick={() => {
                    router.push("/member-login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Войти
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}



