// components/MainHeader.tsx - исправленная версия
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Sparkles,
  Home,
  Users,
  Calendar,
  ShoppingCart,
  BarChart3,
  Scan, // ✅ Face Auth иконка
  Zap, // ✅ Дополнительная иконка для "новых" функций
} from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import { AuthStatus } from "@/hooks/useAuth";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";

interface MainHeaderProps {
  authStatus: AuthStatus | null;
  isLoading: boolean;
  onLogout: () => void;
}

export default function MainHeader({ authStatus, isLoading }: MainHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Обработчик клика по магазину
  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!authStatus?.authenticated) {
      router.push("/member-login?redirect=" + encodeURIComponent("/shop"));
    } else {
      router.push("/shop");
    }
    setIsMobileMenuOpen(false);
  };

  // ✅ Улучшенная логика для Face ID
  const handleFaceAuthClick = (e: React.MouseEvent) => {
    if (authStatus?.authenticated) {
      router.push("/auth/face-auth?mode=manage");
    } else {
      router.push("/auth/face-auth");
    }
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/trainers", label: "Тренеры", icon: Users },
    { href: "/programs", label: "Программы", icon: Calendar },
    {
      href: "/shop",
      label: "Магазин",
      icon: ShoppingCart,
      requiresAuth: true,
      onClick: handleShopClick,
      showPulse: true,
    },
    {
      href: "/auth/face-auth",
      label: "Face ID",
      icon: Scan,
      requiresAuth: false,
      badge: "AI",
      description: authStatus?.authenticated
        ? "Управление Face ID"
        : "Вход по лицу за 2 сек",
      onClick: handleFaceAuthClick,
      isNew: true, // ✅ Помечаем как новую функцию (но без пульсации)
    },
    { href: "/about", label: "О нас", icon: BarChart3 },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Логотип */}
          <Link
            href="/"
            className={combineAnimations(
              "flex items-center gap-2 sm:gap-3 min-w-0",
              ANIMATION_CLASSES.transition.all,
              ANIMATION_CLASSES.hover.scale
            )}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-white min-w-0">
              <div className="text-md sm:text-xl lg:text-xl font-bold truncate">
                FitFlow Pro
              </div>
              <div className="text-xs lg:text-md text-blue-100">
                Умная система управления
              </div>
            </div>
          </Link>

          {/* Навигация для средних и больших экранов */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;

              if (item.requiresAuth && !authStatus?.authenticated) {
                return (
                  <button
                    key={item.href}
                    onClick={item.onClick}
                    className={combineAnimations(
                      "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 relative group",
                      ANIMATION_CLASSES.transition.colors
                    )}
                    title="Требуется авторизация"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium hidden xl:inline">
                      {item.label}
                    </span>

                    {/* ✅ Пульсирующая точка ТОЛЬКО для магазина */}
                    {item.showPulse && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    )}

                    {/* Бейдж для новых функций */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-yellow-900 px-1 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.href}
                  onClick={item.onClick || (() => router.push(item.href))}
                  className={combineAnimations(
                    "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 relative group",
                    ANIMATION_CLASSES.transition.colors
                  )}
                  title={item.description}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium hidden xl:inline">
                    {item.label}
                  </span>

                  {/* ✅ Улучшенный бейдж с градиентом (только для Face ID) */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 text-xs bg-gradient-to-r from-purple-400 to-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                      {item.badge}
                    </span>
                  )}

                  {/* ✅ Статичный индикатор новой функции (НЕ пульсирующий) */}
                  {item.isNew && !item.badge && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg" />
                  )}

                  {/* ✅ Улучшенный tooltip для Face ID */}
                  {item.href === "/auth/face-auth" && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-1 mt-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap z-50 shadow-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span>{item.description}</span>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900/95"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Правая часть хедера */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {!isLoading && (
              <>
                {authStatus?.authenticated ? (
                  <UserMenu />
                ) : (
                  <>
                    <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                      <Link href="/member-login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/10 transition-colors text-xs sm:text-sm px-2 sm:px-3"
                        >
                          Вход
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button
                          size="sm"
                          className="bg-white text-blue-600 hover:bg-blue-50 transition-colors text-xs sm:text-sm px-2 sm:px-3"
                        >
                          Регистрация
                        </Button>
                      </Link>
                    </div>

                    <div className="sm:hidden">
                      <Link href="/member-login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/10 transition-colors text-xs px-2"
                        >
                          Вход
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-3 sm:py-4">
            <nav className="space-y-1 sm:space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;

                if (item.requiresAuth && !authStatus?.authenticated) {
                  return (
                    <button
                      key={item.href}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors relative"
                    >
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        {item.label}
                      </span>

                      <div className="ml-auto flex items-center gap-2">
                        {item.badge && (
                          <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-xs text-white/60 hidden sm:inline">
                          Требуется вход
                        </span>
                        {/* ✅ Пульсирующая точка в мобильной версии ТОЛЬКО для магазина */}
                        {item.showPulse && (
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.href}
                    onClick={(e) => {
                      item.onClick?.(e) || router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors relative"
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {item.label}
                        </span>

                        {/* ✅ Бейдж для Face ID */}
                        {item.badge && (
                          <span className="text-xs bg-gradient-to-r from-purple-400 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg">
                            {item.badge}
                          </span>
                        )}

                        {/* ✅ NEW индикатор только для Face ID (без пульсации) */}
                        {item.isNew && !item.badge && (
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Описание */}
                      {item.description && (
                        <div className="text-xs text-white/70 mt-0.5 flex items-center gap-1">
                          {item.href === "/auth/face-auth" && (
                            <Zap className="h-3 w-3 text-yellow-400" />
                          )}
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Кнопки авторизации в мобильном меню */}
              {!authStatus?.authenticated && (
                <div className="pt-3 sm:pt-4 border-t border-white/20 space-y-1 sm:space-y-2">
                  <Link
                    href="/member-login"
                    className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white                    /90 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Вход</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">
                      Регистрация
                    </span>
                  </Link>
                </div>
              )}

              {/* ✅ Дополнительная секция с Face ID для мобильных (без пульсации) */}
              {!authStatus?.authenticated && (
                <div className="pt-2 border-t border-white/10 mt-3">
                  <div className="px-3 sm:px-4 py-2">
                    <div className="text-xs text-white/60 mb-2 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Новые возможности
                    </div>
                    <button
                      onClick={handleFaceAuthClick}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                    >
                      <div className="relative">
                        <Scan className="h-4 w-4" />
                        {/* ✅ Статичная точка (НЕ пульсирующая) */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Face ID</span>
                          <span className="text-xs bg-gradient-to-r from-purple-400 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                            AI
                          </span>
                        </div>
                        <div className="text-xs text-white/70 mt-0.5">
                          Вход по лицу за 2 секунды
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* ✅ Дополнительный баннер для Face ID (показывается периодически) */}
      {!authStatus?.authenticated && (
        <div className="hidden lg:block bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-medium">Попробуйте Face ID</span>
              </div>
              <div className="text-xs text-white/70">•</div>
              <div className="text-xs text-white/70">
                Вход по лицу за 2 секунды
              </div>
              <div className="text-xs text-white/70">•</div>
              <button
                onClick={handleFaceAuthClick}
                className="text-xs text-purple-300 hover:text-purple-200 underline transition-colors"
              >
                Попробовать сейчас
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
