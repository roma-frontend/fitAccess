// components/admin/AdminHeader.tsx
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
import { useAdmin } from "@/contexts/AdminContext";
import {
  Dumbbell,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Plus,
  Menu,
  X,
  Settings,
  UserCheck,
  LogOut,
  ChevronDown,
  Loader2,
  Shield,
  Database,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { stats, loading } = useAdmin();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Мок данные для пользователя
  const user = {
    name: "Максим Админ",
    email: "max.admin@fitaccess.com",
    avatar: "/avatars/admin-max.jpg",
    role: "Администратор",
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

        setTimeout(() => {
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
      
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Функция для определения активного пути
  const isActivePath = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // Навигационные элементы
  const navItems = [
    {
      label: "Пользователи",
      href: "/admin/users",
      icon: Users,
      badge: `${stats.totalUsers}`,
    },
    {
      label: "Менеджеры",
      href: "/admin/managers",
      icon: Shield,
      badge: `${stats.totalManagers}`,
    },
    {
      label: "Система",
      href: "/admin/system",
      icon: Database,
      badge: stats.systemAlerts > 0 ? stats.systemAlerts.toString() : undefined,
    },
    {
      label: "Аналитика",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  // Статистические элементы для header
  const headerStats = [
    {
      value: stats.totalUsers.toString(),
      label: "Всего пользователей",
      color: "text-blue-600 dark:text-blue-400",
      icon: Users,
    },
    {
      value: stats.totalManagers.toString(),
      label: "Менеджеров",
      color: "text-green-600 dark:text-green-400",
      icon: Shield,
    },
    {
      value: `${(stats.systemLoad * 100).toFixed(0)}%`,
      label: "Нагрузка системы",
      color: stats.systemLoad > 0.8 ? "text-red-600 dark:text-red-400" : "text-purple-600 dark:text-purple-400",
      icon: Activity,
    },
    {
      value: stats.systemAlerts.toString(),
      label: "Системных уведомлений",
      color: stats.systemAlerts > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400",
      icon: AlertTriangle,
    },
  ];

  const unreadNotifications = stats.systemAlerts + 1;

  if (loading) {
    return (
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

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
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                    FitAccess
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Панель администратора</p>
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
                        ? "bg-red-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark
