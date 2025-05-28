// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/MainHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Users,
  Calendar,
  ShoppingCart,
  Shield,
  UserCheck,
  Settings,
  Zap,
  CheckCircle,
  ArrowRight,
  Crown,
  User,
  Star,
  Award,
  Clock,
  Heart,
  Target,
  Flame,
  Loader2,
  Wrench,
  BarChart3,
  FileText,
  ShieldCheck,
  Cog,
  Activity,
  Code,
  Download,
  Database,
  Sparkles,
  TrendingUp,
  Globe,
  Smartphone,
} from "lucide-react";
import { memo } from "react";

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

// Мемоизированные компоненты
const TrainerCard = memo(({ trainer }: { trainer: any }) => {
  const router = useRouter();
  const IconComponent = trainer.icon;

  const handleCardClick = () => {
    router.push(trainer.link);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(trainer.link);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(trainer.bookingLink);
  };

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={handleBookingClick}
    >
      <div className="relative overflow-hidden">
        <div
          className={`h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
        >
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
              <IconComponent className="h-12 w-12 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <h3 className="text-xl font-bold transition-all duration-300 group-hover:scale-105">
              {trainer.name}
            </h3>
            <p
              className={`${trainer.textColor} transition-opacity duration-300 group-hover:opacity-90`}
            >
              {trainer.specialty}
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 transition-all duration-300 group-hover:scale-110">
          <div className="flex items-center bg-white/90 rounded-full px-2 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{trainer.rating}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award
              className={`h-4 w-4 ${trainer.iconColor} transition-colors duration-300`}
            />
            <span>{trainer.experience}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trainer.badges.map((badge: string, index: number) => (
              <Badge
                key={index}
                className={`${trainer.badgeColor} transition-all duration-300 hover:scale-105`}
              >
                {badge}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
            {trainer.description}
          </p>

          <div className="flex items-center justify-between pt-4">
            <div className="text-lg font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
              {trainer.price}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProfileClick}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Профиль
              </button>
              <button
                onClick={handleBookingClick}
                className={`px-3 py-1 text-sm bg-gradient-to-r ${trainer.gradient} text-white rounded ${trainer.hoverGradient} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
              >
                Записаться
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TrainerCard.displayName = "TrainerCard";

const ProgramCard = memo(({ program }: { program: any }) => {
  const router = useRouter();
  const IconComponent = program.icon;

  const handleCardClick = () => {
    router.push(program.link);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(program.link);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bookingLink = `${program.link}?action=book`;
    router.push(bookingLink);
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${program.bgGradient} ${program.borderColor} cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6 text-center">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${program.iconGradient} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <IconComponent className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 className="text-lg font-semibold mb-2 transition-all duration-300 group-hover:scale-105">
          {program.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 transition-colors duration-300 group-hover:text-gray-700">
          {program.description}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4" />
          <span>{program.duration}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDetailsClick}
            className={`flex-1 bg-gradient-to-r ${program.buttonGradient} text-white py-2 px-3 rounded text-sm ${program.buttonHover} transition-all duration-300 transform hover:scale-105 hover:shadow-md`}
          >
            Подробнее
          </button>
          <button
            onClick={handleBookClick}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
          >
            Записаться
          </button>
        </div>
      </CardContent>
    </Card>
  );
});

ProgramCard.displayName = "ProgramCard";

export default function HomePage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        console.log("Статус авторизации на главной:", data);

        setAuthStatus({
          authenticated: data.authenticated,
          user: data.user,
          dashboardUrl: data.dashboardUrl,
        });
      } catch (error) {
        console.error("Ошибка проверки авторизации:", error);
        setAuthStatus({ authenticated: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setAuthStatus({ authenticated: false });
        window.location.reload();
      }
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  const handleDashboardRedirect = () => {
    if (authStatus?.dashboardUrl) {
      router.push(authStatus.dashboardUrl);
    }
  };

  // Данные тренеров
  const trainers = [
    {
      name: "Анна Петрова",
      specialty: "Йога и стретчинг",
      rating: "4.9",
      experience: "5+ лет опыта",
      price: "от 2000₽/час",
      icon: Heart,
      gradient: "from-pink-400 to-purple-600",
      hoverGradient: "hover:from-pink-600 hover:to-purple-700",
      textColor: "text-pink-100",
      iconColor: "text-purple-600",
      badgeColor: "bg-pink-100 text-pink-800",
      description:
        "Сертифицированный инструктор йоги. Поможет обрести гармонию тела и духа.",
      badges: ["Йога", "Пилатес", "Стретчинг"],
      link: "/trainers/anna-petrova",
      bookingLink: "/book-trainer/anna-petrova",
    },
    {
      name: "Михаил Волков",
      specialty: "Силовые тренировки",
      rating: "4.8",
      experience: "8+ лет опыта",
      price: "от 2500₽/час",
      icon: Dumbbell,
      gradient: "from-blue-500 to-indigo-700",
      hoverGradient: "hover:from-blue-600 hover:to-indigo-800",
      textColor: "text-blue-100",
      iconColor: "text-blue-600",
      badgeColor: "bg-blue-100 text-blue-800",
      description:
        "Мастер спорта по пауэрлифтингу. Поможет набрать мышечную массу и силу.",
      badges: ["Силовые", "Кроссфит", "Пауэрлифтинг"],
      link: "/trainers/mikhail-volkov",
      bookingLink: "/book-trainer/mikhail-volkov",
    },
    {
      name: "Елена Смирнова",
      specialty: "Кардио и похудение",
      rating: "5.0",
      experience: "6+ лет опыта",
      price: "от 2200₽/час",
      icon: Flame,
      gradient: "from-green-400 to-emerald-600",
      hoverGradient: "hover:from-green-600 hover:to-emerald-700",
      textColor: "text-green-100",
      iconColor: "text-green-600",
      badgeColor: "bg-green-100 text-green-800",
      description:
        "Специалист по жиросжиганию. Поможет достичь идеальной формы.",
      badges: ["Кардио", "HIIT", "Похудение"],
      link: "/trainers/elena-smirnova",
      bookingLink: "/book-trainer/elena-smirnova",
    },
    {
      name: "Дмитрий Козлов",
      specialty: "Функциональный тренинг",
      rating: "4.7",
      experience: "7+ лет опыта",
      price: "от 2300₽/час",
      icon: Target,
      gradient: "from-orange-400 to-red-600",
      hoverGradient: "hover:from-orange-600 hover:to-red-700",
      textColor: "text-orange-100",
      iconColor: "text-orange-600",
      badgeColor: "bg-orange-100 text-orange-800",
      description:
        "Эксперт функционального тренинга. Улучшит координацию и выносливость.",
      badges: ["TRX", "Функциональный", "Реабилитация"],
      link: "/trainers/dmitriy-kozlov",
      bookingLink: "/book-trainer/dmitriy-kozlov",
    },
    {
      name: "Ольга Иванова",
      specialty: "Групповые программы",
      rating: "4.9",
      experience: "4+ года опыта",
      price: "от 1800₽/час",
      icon: Users,
      gradient: "from-teal-400 to-cyan-600",
      hoverGradient: "hover:from-teal-600 hover:to-cyan-700",
      textColor: "text-teal-100",
      iconColor: "text-teal-600",
      badgeColor: "bg-teal-100 text-teal-800",
      description:
        "Энергичный тренер групповых программ. Сделает тренировки веселыми!",
      badges: ["Аэробика", "Зумба", "Степ"],
      link: "/trainers/olga-ivanova",
      bookingLink: "/book-trainer/olga-ivanova",
    },
    {
      name: "Александр Петров",
      specialty: "Персональный тренинг",
      rating: "5.0",
      experience: "10+ лет опыта",
      price: "от 5000₽/час",
      icon: Crown,
      gradient: "from-violet-500 to-purple-700",
      hoverGradient: "hover:from-violet-600 hover:to-purple-800",
      textColor: "text-violet-100",
      iconColor: "text-violet-600",
      badgeColor: "bg-violet-100 text-violet-800",
            description: "Элитный персональный тренер. Работает с VIP-клиентами.",
      badges: ["VIP", "Элитный", "Премиум"],
      link: "/trainers/aleksandr-petrov",
      bookingLink: "/book-trainer/aleksandr-petrov",
    },
  ];

  // Данные программ
  const programs = [
    {
      title: "Йога и релакс",
      description:
        "Гармония тела и духа через древние практики йоги и медитации",
      duration: "60-90 мин",
      icon: Heart,
      bgGradient: "bg-gradient-to-br from-pink-50 to-rose-100",
      borderColor: "border-pink-200",
      iconGradient: "from-pink-400 to-rose-500",
      buttonGradient: "from-pink-500 to-rose-600",
      buttonHover: "hover:from-pink-600 hover:to-rose-700",
      link: "/programs/yoga",
    },
    {
      title: "Силовой тренинг",
      description:
        "Наращивание мышечной массы и увеличение силовых показателей",
      duration: "45-60 мин",
      icon: Dumbbell,
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
      borderColor: "border-blue-200",
      iconGradient: "from-blue-500 to-indigo-600",
      buttonGradient: "from-blue-500 to-indigo-600",
      buttonHover: "hover:from-blue-600 hover:to-indigo-700",
      link: "/programs/strength",
    },
    {
      title: "Кардио и жиросжигание",
      description: "Интенсивные кардио-тренировки для быстрого похудения",
      duration: "30-45 мин",
      icon: Flame,
      bgGradient: "bg-gradient-to-br from-green-50 to-emerald-100",
      borderColor: "border-green-200",
      iconGradient: "from-green-500 to-emerald-600",
      buttonGradient: "from-green-500 to-emerald-600",
      buttonHover: "hover:from-green-600 hover:to-emerald-700",
      link: "/programs/cardio",
    },
    {
      title: "Функциональный тренинг",
      description: "Тренировка движений для повседневной активности и спорта",
      duration: "50-70 мин",
      icon: Target,
      bgGradient: "bg-gradient-to-br from-orange-50 to-red-100",
      borderColor: "border-orange-200",
      iconGradient: "from-orange-500 to-red-600",
      buttonGradient: "from-orange-500 to-red-600",
      buttonHover: "hover:from-orange-600 hover:to-red-700",
      link: "/programs/functional",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Загружаем систему...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Обновленный header */}
      <MainHeader
        authStatus={authStatus}
        isLoading={isLoading}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  {authStatus?.authenticated ? (
                    <>
                      Добро пожаловать,{" "}
                      <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        {authStatus.user?.name}!
                      </span>
                    </>
                  ) : (
                    <>
                      FitFlow
                      <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        {" "}Pro
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Умная система управления фитнес-центром
                </p>
              </div>
            </div>
          </div>

          {authStatus?.authenticated ? (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Вы вошли как{" "}
                      <span className="text-blue-600">
                        {authStatus.user?.role === "member" && "Участник"}
                        {authStatus.user?.role === "admin" && "Администратор"}
                        {authStatus.user?.role === "super-admin" && "Супер Администратор"}
                        {authStatus.user?.role === "manager" && "Менеджер"}
                        {authStatus.user?.role === "trainer" && "Тренер"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{authStatus.user?.email}</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleDashboardRedirect}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Перейти в дашборд
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Современная платформа для управления фитнес-клубом с биометрическим доступом, 
                AI-аналитикой, умным расписанием и интегрированным магазином.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/setup-users")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl px-8 py-4"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Быстрый старт
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="outline"
                  size="lg"
                  className="transition-all duration-300 hover:scale-105 rounded-xl px-8 py-4"
                >
                  <Globe className="h-5 w-5 mr-2" />
                  Посмотреть демо
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Новые возможности - показываем всем */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ✨ Новые возможности FitFlow Pro
            </h2>
            <p className="text-lg text-gray-600">
              Передовые технологии для современного фитнес-центра
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Аналитика</h3>
                <p className="text-sm text-gray-600">
                  Умные рекомендации и прогнозы на основе данных
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Мобильное приложение</h3>
                <p className="text-sm text-gray-600">
                  Полный функционал в кармане участника
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Биометрия</h3>
                <p className="text-sm text-gray-600">
                  Безопасный вход по отпечатку пальца
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Умная аналитика</h3>
                <p className="text-sm text-gray-600">
                  Детальная статистика и отчеты в реальном времени
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Карточки входа - показываем только неавторизованным пользователям */}
        {!authStatus?.authenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Для участников</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Доступ к тренировкам, расписанию и покупкам
                </p>
                <Button
                  onClick={() => router.push("/member-login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 rounded-xl py-3"
                >
                  Войти как участник
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Для персонала</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Управление залом, клиентами и расписанием
                </p>
                <Button
                                    onClick={() => router.push("/staff-login")}
                  variant="outline"
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl py-3"
                >
                  Войти как персонал
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Управление участниками</CardTitle>
              <CardDescription className="text-base">
                Полный контроль над членством, абонементами и посещениями
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Биометрический вход
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  QR-коды для быстрого доступа
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Статистика посещений
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Запись к тренерам</CardTitle>
              <CardDescription className="text-base">
                Онлайн-бронирование персональных и групповых тренировок
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Выбор тренера и времени
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Групповые занятия
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Уведомления и напоминания
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Интегрированный магазин</CardTitle>
              <CardDescription className="text-base">
                Продажа напитков, спортпита и мерча прямо в приложении
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Онлайн-заказы
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Управление складом
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Аналитика продаж
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Секция тренеров */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              💪 Наши профессиональные тренеры
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Опытные специалисты помогут вам достичь ваших фитнес-целей
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-blue-800 text-lg font-medium">
                💡 <strong>Совет:</strong> Нажмите на карточку тренера, чтобы
                узнать больше, или сразу нажмите "Записаться" для быстрого
                бронирования!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <TrainerCard key={trainer.name} trainer={trainer} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => router.push("/trainers")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl px-8 py-4"
            >
              Посмотреть всех тренеров
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Секция программ */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🏋️ Популярные фитнес-программы
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Выберите программу, которая подходит именно вам
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-green-800 text-lg font-medium">
                💡 <strong>Совет:</strong> Нажмите на карточку программы, чтобы
                узнать подробности, расписание и записаться на занятия!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <ProgramCard key={program.title} program={program} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => router.push("/programs")}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl px-8 py-4"
            >
              Посмотреть все программы
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Быстрые действия для пользователей */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-center justify-center text-2xl">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Быстрые действия
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {authStatus?.authenticated
                  ? "Популярные действия для вашей роли"
                  : "Популярные действия для участников клуба"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authStatus?.authenticated ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Button
                    onClick={handleDashboardRedirect}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center bg-white hover:bg-blue-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Shield className="h-8 w-8 mb-2 text-blue-600" />
                    <span className="text-base font-semibold">Мой дашборд</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/trainers")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Users className="h-8 w-8 mb-2 text-green-600" />
                    <span className="text-base font-semibold">Тренеры</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/programs")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center bg-white hover:bg-purple-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Heart className="h-8 w-8 mb-2 text-purple-600" />
                    <span className="text-base font-semibold">Программы</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Button
                    onClick={() => router.push("/trainers")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Users className="h-8 w-8 mb-2 text-green-600" />
                    <span className="text-base font-semibold">Выбрать тренера</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/member-login")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center bg-white hover:bg-blue-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Calendar className="h-8 w-8 mb-2 text-blue-600" />
                    <span className="text-base font-semibold">Мои тренировки</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/programs")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center bg-white hover:bg-purple-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Heart className="h-8 w-8 mb-2 text-purple-600" />
                    <span className="text-base font-semibold">Групповые занятия</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Панель разработчика - показываем админам и супер-админам */}
        {authStatus?.authenticated &&
          ["admin", "super-admin"].includes(authStatus?.user?.role || "") && (
            <Card className="mb-16 border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <Settings className="h-5 w-5 text-white" />
                  </div>
                  Панель разработчика
                </CardTitle>
                <CardDescription className="text-lg">
                  Быстрая настройка и тестирование системы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Основные функции для всех админов */}
                  <Button
                    onClick={() => router.push("/setup-users")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Users className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Создать пользователей</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/setup-demo-data")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Zap className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium">Демо-данные</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/admin")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-purple-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Shield className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-sm font-medium">Админ-панель</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/dev/database-health")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-cyan-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Database className="h-6 w-6 mb-2 text-cyan-600" />
                    <span className="text-sm font-medium">Здоровье БД</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/dev/system-analytics")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-indigo-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <BarChart3 className="h-6 w-6 mb-2 text-indigo-600" />
                    <span className="text-sm font-medium">Системная аналитика</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/dev/backup-restore")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-emerald-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Download className="h-6 w-6 mb-2 text-emerald-600" />
                    <span className="text-sm font-medium">Бэкап/Восстановление</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/dev/api-tester")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-amber-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Code className="h-6 w-6 mb-2 text-amber-600" />
                    <span className="text-sm font-medium">API Тестер</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/dev/performance-monitor")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-rose-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                  >
                    <Activity className="h-6 w-6 mb-2 text-rose-600" />
                    <span className="text-sm font-medium">Мониторинг</span>
                  </Button>

                  {/* Функции только для супер-админа */}
                  {authStatus?.user?.role === "super-admin" && (
                    <>
                      <Button
                        onClick={() => router.push("/create-admin")}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center hover:bg-orange-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                      >
                        <UserCheck className="h-6 w-6 mb-2 text-orange-600" />
                        <span className="text-sm font-medium">Создать админа</span>
                      </Button>

                      <Button
                        onClick={() => router.push("/dev/system-config")}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center hover:bg-red-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                      >
                        <Cog className="h-6 w-6 mb-2 text-red-600" />
                        <span className="text-sm font-medium">Настройки системы</span>
                      </Button>

                      <Button
                        onClick={() => router.push("/dev/security-audit")}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center hover:bg-violet-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                      >
                        <ShieldCheck className="h-6 w-6 mb-2 text-violet-600" />
                        <span className="text-sm font-medium">Аудит безопасности</span>
                      </Button>

                      <Button
                        onClick={() => router.push("/dev/logs-viewer")}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center hover:bg-slate-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
                      >
                        <FileText className="h-6 w-6 mb-2 text-slate-600" />
                        <span className="text-sm font-medium">Просмотр логов</span>
                      </Button>
                    </>
                  )}
                </div>

                {/* Умные быстрые действия */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5" />
                      🚀 Быстрый старт
                    </h4>
                    <p className="text-green-700 text-sm mb-4">
                      Автоматическая настройка всего за один клик
                    </p>
                    <Button
                      onClick={async () => {
                        // Автоматическая настройка
                        router.push("/setup-users");
                        setTimeout(() => router.push("/setup-demo-data"), 2000);
                        setTimeout(() => router.push("/admin"), 4000);
                      }}
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl"
                    >
                      Автонастройка системы
                    </Button>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200 rounded-2xl">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5" />
                      📊 Диагностика
                    </h4>
                    <p className="text-blue-700 text-sm mb-4">
                      Проверка состояния всех систем
                    </p>
                    <Button
                      onClick={() => router.push("/dev/health-check")}
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                    >
                      Проверить систему
                    </Button>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-lg">
                      <Wrench className="h-5 w-5" />
                      🔧 Инструменты
                    </h4>
                    <p className="text-purple-700 text-sm mb-4">
                      Полный набор инструментов разработчика
                    </p>
                    <Button
                      onClick={() => router.push("/dev/tools")}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                    >
                      Открыть тулбокс
                    </Button>
                  </div>
                </div>

                {/* Пошаговая инструкция */}
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-100 border-2 border-yellow-300 rounded-2xl">
                  <h4 className="font-bold text-yellow-800 mb-4 text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    🚀 Пошаговая настройка системы:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ol className="text-sm text-yellow-800 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        Создайте пользователей (админ, тренеры, персонал)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        Добавьте демо-данные (участники, продукты, занятия)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        Проверьте здоровье базы данных
                      </li>
                    </ol>
                    <ol className="text-sm text-yellow-800 space-y-2" start={4}>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        Войдите в админ-панель для управления
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        Протестируйте функции под разными ролями
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">6</span>
                        Настройте мониторинг и бэкапы
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Статус системы */}
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-700 font-medium">Статус системы:</span>
                      <span className="text-green-600 font-bold">Работает стабильно</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Последняя проверка: только что
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* CTA */}
        <div className="text-center">
          {authStatus?.authenticated ? (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300 rounded-2xl p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Продолжайте работу
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Перейдите в свой дашборд для управления системой
              </p>
              <Button
                onClick={handleDashboardRedirect}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-12 py-4 text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl"
              >
                <TrendingUp className="mr-3 h-6 w-6" />
                Перейти в дашборд
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300 rounded-2xl p-8">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Готовы начать?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Создайте тестовых пользователей и начните изучение системы
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  onClick={() => router.push("/setup-users")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl px-8 py-4 text-lg"
                >
                  <Zap className="h-6 w-6 mr-3" />
                  Создать пользователей
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
                <Button
                  onClick={() => router.push("/setup-demo-data")}
                  variant="outline"
                  size="lg"
                  className="transition-all duration-300 hover:scale-105 border-2 rounded-2xl px-8 py-4 text-lg"
                >
                  <Database className="h-6 w-6 mr-3" />
                  Добавить демо-данные
                </Button>
              </div>
              
              {/* Дополнительные ссылки */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => router.push("/demo")}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Посмотреть демо
                </Button>
                <Button
                  onClick={() => router.push("/docs")}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Документация
                </Button>
                <Button
                  onClick={() => router.push("/support")}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Поддержка
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p className="mb-4">
              © 2024 FitFlow Pro. Умная система управления фитнес-центром.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-gray-700 transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Условия использования
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Техподдержка
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



