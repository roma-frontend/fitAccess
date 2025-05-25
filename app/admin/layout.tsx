// app/admin/layout.tsx (обновленная версия с индикатором статуса)
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { useSchedule } from "@/contexts/ScheduleContext";
import { 
  Users, 
  Package, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Settings,
  Shield,
  Home,
  LogOut,
  Activity,
  Wifi,
  WifiOff
} from "lucide-react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { events, loading: scheduleLoading, error: scheduleError } = useSchedule();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/');
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  const navItems = [
    {
      name: "Супер Дашборд",
      href: "/admin",
      icon: Shield,
      description: "Полный контроль системы",
      isNew: true
    },
    {
      name: "Пользователи",
      href: "/admin/users",
      icon: Users,
      description: "Управление пользователями"
    },
    {
      name: "Продукты",
      href: "/admin/products",
      icon: Package,
      description: "Каталог товаров"
    },
    {
      name: "Аналитика",
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Отчеты и статистика"
    },
    {
      name: "Расписание",
      href: "/admin/schedule",
      icon: Calendar,
      description: "Тренировки и события"
    },
    {
      name: "Сообщения",
      href: "/admin/messages",
      icon: MessageSquare,
      description: "Уведомления"
    },
    {
      name: "Настройки",
      href: "/admin/settings",
      icon: Settings,
      description: "Системные настройки"
    }
  ];
  
  if (!isClient) {
    return null;
  }

  // Вычисляем статистику из общих данных расписания
  const todayEvents = events.filter(e => {
    const today = new Date();
    const eventDate = new Date(e.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  const thisWeekEvents = events.filter(e => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    return new Date(e.startTime) >= startOfWeek;
  });

  const completedEvents = events.filter(e => e.status === 'completed');
  const completionRate = events.length > 0 ? (completedEvents.length / events.length) * 100 : 0;

  // Определяем статус системы
  const getSystemStatus = () => {
    if (scheduleLoading) {
      return {
        color: 'text-yellow-600',
        bgColor: 'from-yellow-100 to-amber-100',
        icon: Activity,
        text: 'Синхронизация...',
        description: 'Обновление данных'
      };
    }
    
    if (scheduleError) {
      return {
        color: 'text-orange-600',
        bgColor: 'from-orange-100 to-red-100',
        icon: WifiOff,
        text: 'Режим оффлайн',
        description: 'Локальные данные'
      };
    }
    
    return {
      color: 'text-green-600',
      bgColor: 'from-green-100 to-emerald-100',
      icon: Wifi,
      text: 'Система активна',
      description: 'Все системы в норме'
    };
  };

  const systemStatus = getSystemStatus();
  const StatusIcon = systemStatus.icon;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Супер Админ Панель</h1>
                <p className="text-sm text-gray-600">FitAccess Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`hidden md:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r ${systemStatus.bgColor} rounded-full`}>
                <StatusIcon className={`h-4 w-4 ${systemStatus.color} ${scheduleLoading ? 'animate-pulse' : ''}`} />
                <div className="text-sm">
                  <span className={`font-medium ${systemStatus.color}`}>{systemStatus.text}</span>
                  <span className="text-xs text-gray-600 ml-1">• {systemStatus.description}</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                На главную
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border">
            <nav className="space-y-2">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Навигация</h2>
                <p className="text-sm text-gray-600">Полное управление системой</p>
              </div>
              
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative",
                      isActive 
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    )} />
                    <div className="flex-1">
                      <div className={cn(
                        "font-medium flex items-center gap-2",
                        isActive ? "text-white" : "text-gray-900"
                      )}>
                        {item.name}
                        {item.isNew && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs rounded-full font-semibold">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "text-xs",
                        isActive ? "text-blue-100" : "text-gray-500"
                      )}>
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Live Stats from ScheduleContext */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Статистика в реальном времени
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
                  <span className="text-gray-600">Сегодня:</span>
                  <div className="text-right">
                    <span className="font-medium text-green-600">{todayEvents.length}</span>
                    <div className="text-xs text-green-600">тренировок</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">На неделе:</span>
                  <div className="text-right">
                    <span className="font-medium text-purple-600">{thisWeekEvents.length}</span>
                    <div className="text-xs text-purple-600">событий</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Завершено:</span>
                  <div className="text-right">
                    <span className="font-medium text-orange-600">{completionRate.toFixed(1)}%</span>
                    <div className="text-xs text-orange-600">успешность</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced System Status */}
            <div className={`mt-4 p-3 bg-gradient-to-r ${systemStatus.bgColor} border rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={`w-4 h-4 ${systemStatus.color} ${scheduleLoading ? 'animate-pulse' : ''}`} />
                <span className={`text-sm font-medium ${systemStatus.color}`}>
                  {systemStatus.text}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Время работы: 15 дней</div>
                <div>
                  Последнее обновление: {scheduleLoading ? 'сейчас' : 'только что'}
                </div>
                <div>Активных сессий: {events.filter(e => e.status === 'confirmed').length}</div>
                {scheduleError && (
                  <div className="text-orange-700 font-medium">
                    ⚠️ Работа в автономном режиме
                  </div>
                )}
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </SuperAdminProvider>
  );
}

