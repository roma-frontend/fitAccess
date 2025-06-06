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
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!authStatus?.authenticated) {
      e.preventDefault();
      router.push('/member-login?redirect=' + encodeURIComponent('/shop'));
      setIsMobileMenuOpen(false);
    }
    // Если авторизован, ссылка сработает как обычно
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <Link 
            href="/" 
            className={combineAnimations(
              "flex items-center gap-3",
              ANIMATION_CLASSES.transition.all,
              ANIMATION_CLASSES.hover.scale
            )}
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <div className="text-xl font-bold">FitFlow Pro</div>
              <div className="text-xs text-blue-100 hidden sm:block">
                Умная система управления
              </div>
            </div>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              
              // Для элементов, требующих авторизации, используем кнопку вместо ссылки
              if (item.requiresAuth && !authStatus?.authenticated) {
                return (
                  <button
                    key={item.href}
                    onClick={item.onClick}
                    className={combineAnimations(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 relative",
                      ANIMATION_CLASSES.transition.colors
                    )}
                    title="Требуется авторизация"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {/* Индикатор, что требуется авторизация */}
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
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10",
                    ANIMATION_CLASSES.transition.colors
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Правая часть хедера */}
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {authStatus?.authenticated ? (
                  <UserMenu />
                ) : (
                  <div className="hidden sm:flex items-center gap-3">
                    <Link href="/member-login">
                      <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 transition-colors"
                      >
                        Вход
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        className="bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Регистрация
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Мобильное меню */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                
                // Для элементов, требующих авторизации в мобильном меню
                if (item.requiresAuth && !authStatus?.authenticated) {
                  return (
                    <button
                      key={item.href}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors relative"
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-white/60">Требуется вход</span>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {!authStatus?.authenticated && (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <Link
                    href="/member-login"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Вход</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Регистрация</span>
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
