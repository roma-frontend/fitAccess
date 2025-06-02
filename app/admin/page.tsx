"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRoleTexts } from "@/lib/roleTexts";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Импорт компонентов
import { WelcomeHeader } from "@/components/admin/dashboard/WelcomeHeader";
import { StatusCards } from "@/components/admin/dashboard/StatusCards";
import { PersonalizedStats } from "@/components/admin/PersonalizedStats";
import { PersonalizedProgress } from "@/components/admin/PersonalizedProgress";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { RoleTips } from "@/components/admin/dashboard/RoleTips";
import { RoleSpecificWidgets } from "@/components/admin/dashboard/RoleSpecificWidgets";
import { QuickStatsWidget } from "@/components/admin/dashboard/QuickStatsWidget";
import { NotificationsWidget } from "@/components/admin/dashboard/NotificationsWidget";
import { QuickLinksWidget } from "@/components/admin/dashboard/QuickLinksWidget";
import { KeyMetrics } from "@/components/admin/dashboard/KeyMetrics";
import { WeeklyCalendar } from "@/components/admin/dashboard/WeeklyCalendar";
import { ProgressTracker } from "@/components/admin/dashboard/ProgressTracker";
import { DashboardFooter } from "@/components/admin/dashboard/DashboardFooter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const userRole = user?.role;
  const roleTexts = useRoleTexts(userRole);
  const router = useRouter();

  // Получаем время суток для персонализированного приветствия
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 17) return "Добрый день";
    return "Добрый вечер";
  };

  // Обработчики навигации
  const goToHome = () => router.push("/");
  const goToProfile = () => router.push('admin/profile');
  const goToSettings = () => router.push('admin/settings');

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось выйти из системы",
        });
      }
    } catch (error) {
      console.error("Ошибка выхода:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при попытке выхода",
      });
    }
  };

  // Показываем загрузку если пользователь не загружен
  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Персонализированное приветствие */}
          <WelcomeHeader
            user={user}
            roleTexts={roleTexts}
            greeting={getGreeting()}
            onHome={goToHome}
            onProfile={goToProfile}
            onSettings={goToSettings}
            onLogout={handleLogout}
          />

          {/* Карточки статуса */}
          <StatusCards userRole={userRole} />

          {/* Персонализированная статистика */}
          <PersonalizedStats />

          {/* Основной контент в зависимости от роли */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions variant="expanded" />
            <PersonalizedProgress />
          </div>

          {/* Дополнительные секции */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            <RoleTips userRole={userRole} />
          </div>

          {/* Персонализированные виджеты в зависимости от роли */}
          <RoleSpecificWidgets userRole={userRole} />

          {/* Дополнительные виджеты для всех ролей */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuickStatsWidget userRole={userRole} />
            <NotificationsWidget userRole={userRole} />
            <QuickLinksWidget userRole={userRole} />
          </div>

          {/* Ключевые метрики для админов */}
          <KeyMetrics userRole={userRole} />

          {/* Календарь событий для менеджеров */}
          <WeeklyCalendar userRole={userRole} />

          {/* Прогресс тренировок для клиентов */}
          <ProgressTracker userRole={userRole} />

          {/* Футер с общей информацией */}
          <DashboardFooter userRole={userRole} />
        </div>
      </main>
    </div>
  );
}
