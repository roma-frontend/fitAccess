// app/member-dashboard/page.tsx - исправленная версия (в стиле admin)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import MemberHeader from "@/components/member/MemberHeader";
import QuickActions from "@/components/member/QuickActions";
import MemberProgress from "@/components/member/MemberProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Dumbbell,
  Target,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  Heart,
  Zap,
  Home,
} from "lucide-react";

interface Workout {
  id: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  price: number;
  notes?: string;
  category?: "trainer" | "program";
  trainerName?: string;
  trainerSpecializations?: string[];
  programTitle?: string;
  instructor?: string;
  createdAt: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  // Состояния для тренировок
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    totalHours: 0,
    daysLeft: 15,
  });

  // Загружаем тренировки только если пользователь авторизован
  useEffect(() => {
    if (user && (user.role === "member" || user.role === "client")) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      setWorkoutsLoading(true);
      const response = await fetch("/api/my-workouts", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setWorkouts(data.workouts);
        calculateStats(data.workouts);
      }
    } catch (error) {
      console.error("❌ Ошибка запроса тренировок:", error);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const calculateStats = (workouts: Workout[]) => {
    const now = new Date();
    const upcoming = workouts.filter(
      (w) => new Date(w.date) > now && w.status !== "cancelled"
    ).length;
    const completed = workouts.filter((w) => w.status === "completed").length;
    const totalHours = workouts
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.duration / 60, 0);

    setStats({
      upcoming,
      completed,
      totalHours: Math.round(totalHours),
      daysLeft: 15,
    });
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 MemberDashboard: выполняем выход через useAuth...");
      await logout();
    } catch (error) {
      console.error("❌ Ошибка выхода:", error);
      // В случае ошибки принудительно перенаправляем
      window.location.href = "/";
    }
  };

  // Функция для перехода на главную (упрощенная)
  const goToHomePage = () => {
    console.log("🏠 MemberDashboard: переход на главную страницу...");
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Подтверждено";
      case "pending":
        return "Ожидает подтверждения";
      case "completed":
        return "Завершено";
      case "cancelled":
        return "Отменено";
      default:
        return status;
    }
  };

  // Получаем ближайшие тренировки
  const upcomingWorkouts = workouts
    .filter((w) => new Date(w.date) > new Date() && w.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Показываем загрузку (как в admin dashboard)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка дашборда...</p>
        </div>
      </div>
    );
  }

  // Проверяем авторизацию и роль (как в admin dashboard)
  if (!user || (user.role !== "member" && user.role !== "client")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Проблема с доступом
          </h1>
          <p className="text-gray-600 mb-6">
            {!user 
              ? "Необходима авторизация" 
              : `Доступ запрещен. Ваша роль: ${user.role}. Эта страница только для участников.`
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/member-login")}>
              Войти как участник
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              На главную
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Красивый адаптивный header */}
      <MemberHeader user={user} stats={stats} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие с кнопкой перехода на главную */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Добро пожаловать, {user.name || user.email.split("@")[0]}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  Ваш путь к здоровью и отличной форме
                </p>
              </div>
            </div>

            {/* Кнопка перехода на главную */}
            <Button
              onClick={goToHomePage}
              variant="outline"
              className="flex items-center gap-2 hover:shadow-md transition-all"
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Быстрые действия
          </h2>
          <QuickActions stats={stats} />
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Ближайшие тренировки */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Ближайшие тренировки
                  {stats.upcoming > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.upcoming}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push("/member-dashboard/my-bookings")}
                  className="hover:shadow-md transition-shadow"
                >
                  Все тренировки
                </Button>
              </CardHeader>
              <CardContent>
                {workoutsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : upcomingWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
                        onClick={() =>
                          router.push("/member-dashboard/my-bookings")
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Dumbbell className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {workout.type}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(workout.date).toLocaleDateString(
                                  "ru-RU",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {workout.time}
                              </span>
                            </div>
                            {workout.trainerName && (
                              <p className="text-sm text-gray-500 mt-1">
                                <User className="h-3 w-3 inline mr-1" />
                                {workout.trainerName}
                              </p>
                            )}
                            {workout.instructor && (
                              <p className="text-sm text-gray-500 mt-1">
                                <Users className="h-3 w-3 inline mr-1" />
                                {workout.instructor}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(workout.status)}>
                          {getStatusText(workout.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Нет запланированных тренировок
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Запишитесь на тренировку или программу прямо сейчас
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => router.push("/trainers")}>
                        <User className="h-4 w-4 mr-2" />
                        Записаться к тренеру
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/programs")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Выбрать программу
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель с прогрессом */}
          <div className="space-y-6">
            {/* Следующая тренировка */}
            {!workoutsLoading && upcomingWorkouts.length > 0 && (
              <Card className="shadow-lg border-l-4 border-l-blue-500 border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Следующая тренировка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-gray-900">
                      {upcomingWorkouts[0].type}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            upcomingWorkouts[0].date
                          ).toLocaleDateString("ru-RU", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{upcomingWorkouts[0].time}</span>
                      </div>
                      {upcomingWorkouts[0].trainerName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{upcomingWorkouts[0].trainerName}</span>
                        </div>
                      )}
                      {upcomingWorkouts[0].instructor && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{upcomingWorkouts[0].instructor}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() =>
                        router.push("/member-dashboard/my-bookings")
                      }
                    >
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Мини прогресс */}
            <Card className="shadow-lg border-l-4 border-l-green-500 border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Краткий прогресс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Тренировки в месяце</span>
                      <span className="text-blue-600 font-bold">
                        {stats.completed}/20
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min((stats.completed / 20) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Часы тренировок</span>
                      <span className="text-green-600 font-bold">
                        {stats.totalHours}/40
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min((stats.totalHours / 40) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/member-dashboard/progress")}
                  >
                    Подробный прогресс
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Мотивационная карточка */}
            <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Отличная работа! 💪
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы уже выполнили {Math.round((stats.completed / 20) * 100)}%
                  месячной цели
                </p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => router.push("/trainers")}
                >
                  Продолжить тренировки
                </Button>
              </CardContent>
            </Card>

            {/* Дополнительная кнопка для перехода на главную */}
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Главная страница
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вернуться на главную страницу сайта
                </p>
                <Button
                  onClick={goToHomePage}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Перейти на главную
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Полный компонент прогресса */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Ваш прогресс и достижения
          </h2>
          <MemberProgress />
        </div>

        {/* Информационная панель с советами */}
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💡 Советы для эффективных тренировок
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Регулярность
                  </h4>
                  <p className="text-gray-600">
                    Занимайтесь минимум 3 раза в неделю
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Питание</h4>
                  <p className="text-gray-600">
                    Правильное питание - 70% успеха
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Отдых</h4>
                  <p className="text-gray-600">Давайте мышцам восстановиться</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Прогресс</h4>
                  <p className="text-gray-600">Ведите дневник тренировок</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

