// app/page.tsx (обновленная версия с новым header)
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

// Мемоизированные компоненты остаются без изменений
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
                onClick={handleBookingClick}
                className={`px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all duration-300 transform hover:scale-105`}
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

        // Если пользователь авторизован через JWT, мигрируем на сессии
        if (data.authenticated && data.system === "jwt-fallback") {
          console.log("Обнаружен JWT токен, выполняем миграцию на сессии...");

          try {
            const migrateResponse = await fetch(
              "/api/auth/migrate-to-session",
              {
                method: "POST",
              }
            );

            const migrateData = await migrateResponse.json();

            if (migrateData.success) {
              console.log("Миграция на сессии выполнена успешно");
              setAuthStatus({
                authenticated: true,
                user: migrateData.user,
                dashboardUrl: data.dashboardUrl,
              });
            } else {
              console.error("Ошибка миграции:", migrateData.error);
              setAuthStatus({
                authenticated: data.authenticated,
                user: data.user,
                dashboardUrl: data.dashboardUrl,
              });
            }
          } catch (migrateError) {
            console.error("Ошибка запроса миграции:", migrateError);
            setAuthStatus({
              authenticated: data.authenticated,
              user: data.user,
              dashboardUrl: data.dashboardUrl,
            });
          }
        } else {
          setAuthStatus({
            authenticated: data.authenticated,
            user: data.user,
            dashboardUrl: data.dashboardUrl,
          });
        }
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

  // Данные тренеров (остаются без изменений)
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

  // Данные программ (остаются без изменений)
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
          <p className="text-gray-600 text-lg">Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Новый красивый header */}
      <MainHeader 
        authStatus={authStatus} 
        isLoading={isLoading} 
        onLogout={handleLogout} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {authStatus?.authenticated ? (
              <>
                Добро пожаловать обратно,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {authStatus.user?.name}!
                </span>
              </>
            ) : (
              <>
                Умная система управления
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {" "}
                  фитнес-центром
                </span>
              </>
            )}
          </h1>

          {authStatus?.authenticated ? (
            <div className="space-y-6">
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Вы вошли как{" "}
                <strong>
                  {authStatus.user?.role === "member" && "Участник"}
                  {authStatus.user?.role === "admin" && "Администратор"}
                  {authStatus.user?.role === "super-admin" && "Супер Администратор"}
                  {authStatus.user?.role === "manager" && "Менеджер"}
                  {authStatus.user?.role === "trainer" && "Тренер"}
                </strong>
                                . Перейдите в свой дашборд для управления системой.
              </p>
              <Button
                onClick={handleDashboardRedirect}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Перейти в личный кабинет
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Полнофункциональная платформа для управления фитнес-клубом с
                биометрическим доступом, записью к тренерам, магазином и
                аналитикой.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/setup-users")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Быстрый старт
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="outline"
                  size="lg"
                  className="transition-all duration-300 hover:scale-105"
                >
                  Посмотреть демо
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Карточки входа - показываем только неавторизованным пользователям */}
        {!authStatus?.authenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <User className="h-16 w-16 text-blue-600 mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                <h3 className="text-xl font-semibold mb-2">Для участников</h3>
                <p className="text-gray-600 mb-6">
                  Доступ к тренировкам, расписанию и покупкам
                </p>
                <Button
                  onClick={() => router.push("/member-login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                >
                  Войти как участник
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-green-600 mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                <h3 className="text-xl font-semibold mb-2">Для персонала</h3>
                <p className="text-gray-600 mb-6">
                  Управление залом, клиентами и расписанием
                </p>
                <Button
                  onClick={() => router.push("/staff-login")}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105"
                >
                  Войти как персонал
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2 transition-transform duration-300 hover:scale-110" />
              <CardTitle>Управление участниками</CardTitle>
              <CardDescription>
                Полный контроль над членством, абонементами и посещениями
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Биометрический вход
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  QR-коды для быстрого доступа
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Статистика посещений
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <Calendar className="h-8 w-8 text-green-600 mb-2 transition-transform duration-300 hover:scale-110" />
              <CardTitle>Запись к тренерам</CardTitle>
              <CardDescription>
                Онлайн-бронирование персональных и групповых тренировок
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Выбор тренера и времени
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Групповые занятия
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Уведомления и напоминания
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <ShoppingCart className="h-8 w-8 text-purple-600 mb-2 transition-transform duration-300 hover:scale-110" />
              <CardTitle>Интегрированный магазин</CardTitle>
              <CardDescription>
                Продажа напитков, спортпита и мерча прямо в приложении
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Онлайн-заказы
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Управление складом
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Аналитика продаж
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Секция тренеров */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              💪 Наши профессиональные тренеры
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Опытные специалисты помогут вам достичь ваших фитнес-целей
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                💡 <strong>Совет:</strong> Нажмите на карточку тренера, чтобы
                узнать больше, или сразу нажмите "Записаться" для быстрого
                бронирования!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <TrainerCard key={trainer.name} trainer={trainer}  />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => router.push("/trainers")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Посмотреть всех тренеров
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Секция программ */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🏋️ Популярные фитнес-программы
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Выберите программу, которая подходит именно вам
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-green-800 text-sm">
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
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Посмотреть все программы
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Быстрые действия для пользователей */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
                Быстрые действия
              </CardTitle>
              <CardDescription className="text-center">
                {authStatus?.authenticated
                  ? "Популярные действия для вашей роли"
                  : "Популярные действия для участников клуба"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authStatus?.authenticated ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleDashboardRedirect}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-white hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                  >
                    <Shield className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Мой дашборд</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/trainers")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-all duration-300 hover:scale-105"
                  >
                    <Users className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium">Тренеры</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/programs")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-white hover:bg-purple-50 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-sm font-medium">Программы</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => router.push("/trainers")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-all duration-300 hover:scale-105"
                  >
                    <Users className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium">Выбрать тренера</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/member-login")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-white hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                  >
                    <Calendar className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Мои тренировки</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/programs")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-white hover:bg-purple-50 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className="h-6 w-6 mb-2 text-purple-600" />
                                        <span className="text-sm font-medium">
                      Групповые занятия
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access для разработчиков - показываем только неавторизованным или админам */}
        {(!authStatus?.authenticated ||
          ["admin", "super-admin"].includes(authStatus?.user?.role || "")) && (
          <Card className="mb-16 border-2 border-dashed border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Панель разработчика
              </CardTitle>
              <CardDescription>
                Быстрая настройка и тестирование системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => router.push("/setup-users")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">Создать пользователей</span>
                </Button>

                <Button
                  onClick={() => router.push("/setup-demo-data")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center hover:bg-green-50 transition-all duration-300 hover:scale-105"
                >
                  <Zap className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Демо-данные</span>
                </Button>

                <Button
                  onClick={() => router.push("/admin")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center hover:bg-purple-50 transition-all duration-300 hover:scale-105"
                >
                  <Shield className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Админ-панель</span>
                </Button>

                <Button
                  onClick={() => router.push("/create-admin")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center hover:bg-orange-50 transition-all duration-300 hover:scale-105"
                >
                  <UserCheck className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">Создать админа</span>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  🚀 Быстрый старт:
                </h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Создайте пользователей (админ, тренеры, персонал)</li>
                  <li>
                    2. Добавьте демо-данные (участники, продукты, занятия)
                  </li>
                  <li>3. Войдите в админ-панель для управления системой</li>
                  <li>4. Протестируйте все функции под разными ролями</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center">
          {authStatus?.authenticated ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Продолжайте работу
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Перейдите в свой дашборд для управления системой
              </p>
              <Button
                onClick={handleDashboardRedirect}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Перейти в дашборд
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Готовы начать?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Создайте тестовых пользователей и начните изучение системы
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/setup-users")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Создать пользователей
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  onClick={() => router.push("/setup-demo-data")}
                  variant="outline"
                  size="lg"
                  className="transition-all duration-300 hover:scale-105"
                >
                  Добавить демо-данные
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

                      


