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
  BarChart3
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
    if (!authStatus?.authenticated) {
      e.preventDefault();
      router.push('/member-login?redirect=' + encodeURIComponent('/shop'));
      setIsMobileMenuOpen(false);
    }
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
      onClick: handleShopClick
    },
    { href: "/about", label: "О нас", icon: BarChart3 },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg sticky top-0 z-40">
      {/* Контейнер с адаптивными отступами */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Основная строка хедера с адаптивной высотой */}
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* Логотип - адаптивный размер и текст */}
          <Link 
            href="/" 
            className={combineAnimations(
              "flex items-center gap-2 sm:gap-3 min-w-0",
              ANIMATION_CLASSES.transition.all,
              ANIMATION_CLASSES.hover.scale
            )}
          >
            {/* Иконка - адаптивный размер */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            
            {/* Текст логотипа - показывается поэтапно */}
            <div className="text-white min-w-0">
              {/* Основное название - скрывается только на очень маленьких экранах */}
              <div className="text-md sm:text-xl lg:text-xl font-bold truncate">
                FitFlow Pro
              </div>
              {/* Подпись - показывается только на больших экранах */}
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
                      "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 relative",
                      ANIMATION_CLASSES.transition.colors
                    )}
                    title="Требуется авторизация"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium hidden xl:inline">{item.label}</span>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.onClick}
                  className={combineAnimations(
                    "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10",
                    ANIMATION_CLASSES.transition.colors
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium hidden xl:inline">{item.label}</span>
                </Link>
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
                    {/* Кнопки авторизации - адаптивные */}
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
                    
                    {/* Только кнопка входа на очень маленьких экранах */}
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

            {/* Мобильное меню - показывается до lg */}
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

        {/* Мобильная навигация - улучшенная адаптивность */}
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
                      <span className="font-medium text-sm sm:text-base">{item.label}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-white/60 hidden sm:inline">Требуется вход</span>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0" />
                      </div>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      item.onClick?.(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Кнопки авторизации в мобильном меню */}
              {!authStatus?.authenticated && (
                <div className="pt-3 sm:pt-4 border-t border-white/20 space-y-1 sm:space-y-2">
                  <Link
                    href="/member-login"
                    className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
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
                    <span className="font-medium text-sm sm:text-base">Регистрация</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
