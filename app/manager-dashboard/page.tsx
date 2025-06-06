// app/manager/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ManagerHeader from "@/components/manager/ManagerHeader";
import { ManagerProvider, useManager } from "@/contexts/ManagerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Star,
  Activity,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";

function ManagerDashboardContent() {
  const router = useRouter();
  const { stats, trainers, bookings, loading, refreshData } = useManager();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Статистические карточки
  const statCards = [
    {
      title: "Всего тренеров",
      value: stats.totalTrainers,
      change: "+2",
      changeType: "increase",
      icon: Users,
      color: "blue",
      description: `${stats.activeTrainers} активных`,
    },
    {
      title: "Записи сегодня",
      value: stats.todayBookings,
      change: "+5",
      changeType: "increase",
      icon: Calendar,
      color: "green",
      description: "На сегодня",
    },
    {
      title: "Доход за месяц",
      value: `${(stats.monthlyRevenue / 1000).toFixed(0)}К ₽`,
      change: "+12%",
      changeType: "increase",
      icon: DollarSign,
      color: "orange",
      description: "По сравнению с прошлым месяцем",
    },
    {
      title: "Средний рейтинг",
      value: stats.averageRating.toFixed(1),
      change: "+0.2",
      changeType: "increase",
      icon: Star,
      color: "purple",
      description: "Рейтинг тренеров",
    },
  ];

  // Получение цвета статуса тренера
  const getTrainerStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "vacation":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrainerStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активен";
      case "busy":
        return "Занят";
      case "inactive":
        return "Неактивен";
      case "vacation":
        return "Отпуск";
      default:
        return "Неизвестно";
    }
  };

  // Получение цвета статуса записи
  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Запланирована";
      case "completed":
        return "Завершена";
      case "cancelled":
        return "Отменена";
      case "no-show":
        return "Не явился";
      default:
        return "Неизвестно";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Дашборд менеджера
            </h1>
            <p className="text-gray-600">
              Управление тренерами, записями и аналитикой фитнес-центра
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Обновить
            </Button>

            <Button
              onClick={() => router.push("/manager/reports")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </Button>

            <Button
              onClick={() => router.push("/manager/trainers/add")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить тренера
            </Button>
          </div>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = {
              blue: "text-blue-600 bg-blue-100",
              green: "text-green-600 bg-green-100",
              orange: "text-orange-600 bg-orange-100",
              purple: "text-purple-600 bg-purple-100",
            };

            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {card.value}
                      </p>
                      <div className="flex items-center gap-1">
                        {card.changeType === "increase" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            card.changeType === "increase"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {card.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[card.color as keyof typeof colorClasses]}`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Тренеры */}
          <div className="lg:col-span-2 space-y-6">
            {/* Активные тренеры */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Активные тренеры
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/manager/trainers")}
                >
                  Посмотреть всех
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainers.slice(0, 5).map((trainer) => (
                    <div
                      key={trainer.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={trainer.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                            {trainer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {trainer.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {trainer.specialization.slice(0, 2).join(", ")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getTrainerStatusColor(trainer.status)}
                            >
                              {getTrainerStatusText(trainer.status)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">
                                {trainer.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {trainer.totalClients} клиентов
                        </p>
                        <p className="text-xs text-gray-500">
                          {trainer.completedSessions} тренировок
                        </p>
                        {trainer.nextSession && (
                          <p className="text-xs text-blue-600 mt-1">
                            Следующая: {trainer.nextSession.time}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Последние записи */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Последние записи
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/manager/bookings")}
                >
                  Все записи
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Тренер</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Время</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.slice(0, 5).map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {booking.trainerName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-900">
                              {booking.clientName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {new Date(booking.date).toLocaleDateString(
                                  "ru-RU"
                                )}
                              </div>
                              <div className="text-gray-500">
                                {booking.time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getBookingStatusColor(booking.status)}
                            >
                              {getBookingStatusText(booking.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {booking.price.toLocaleString()} ₽
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Боковые виджеты */}
          <div className="space-y-6">
            {/* Быстрая аналитика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Быстрая аналитика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Загрузка тренеров
                    </span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Выполнение плана
                    </span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Удовлетворенность
                    </span>
                    <span className="text-sm font-medium">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/manager/analytics")}
                  >
                    Подробная аналитика
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Топ тренеры месяца */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Топ тренеры месяца
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainers
                    .sort((a, b) => b.monthlyEarnings - a.monthlyEarnings)
                    .slice(0, 3)
                    .map((trainer, index) => (
                      <div key={trainer.id} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                                ? "bg-gray-100 text-gray-800"
                                : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <Avatar className="h-8 w-8">
                          <AvatarImage src={trainer.avatar} />
                          <AvatarFallback>
                            {trainer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {trainer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {trainer.monthlyEarnings.toLocaleString()} ₽
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-medium">
                            {trainer.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Уведомления и задачи */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Требует внимания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Превышение записей
                      </p>
                      <p className="text-xs text-yellow-700">
                        У Адама Петрова 15 записей на завтра
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <UserCheck className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Новая заявка
                      </p>
                      <p className="text-xs text-blue-700">
                        Дмитрий Козлов подал заявку на работу
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        Жалоба клиента
                      </p>
                      <p className="text-xs text-red-700">
                        Требует рассмотрения в течение 24 часов
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/manager/notifications")}
                  >
                    Все уведомления
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/manager/trainers/add")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить тренера
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/manager/bookings/create")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Создать запись
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/manager/reports")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Сгенерировать отчет
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/manager/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Настройки системы
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Дополнительная статистика внизу */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Завершенных тренировок
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedSessions}
                  </p>
                  <p className="text-xs text-gray-500">За текущий месяц</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Новых клиентов
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.newClients}
                  </p>
                  <p className="text-xs text-gray-500">За последние 30 дней</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Общий рейтинг
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Средний по всем тренерам
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  return (
    <ProtectedRoute
      allowedRoles={["manager", "admin", "super-admin"]}
      redirectTo="/staff-login"
    >
      <ManagerProvider>
        <ManagerDashboardContent />
      </ManagerProvider>
    </ProtectedRoute>
  );
}
