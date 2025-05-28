// components/admin/SuperAdminAnalytics.tsx (исправленная версия)
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Download,
  Filter,
  Eye,
} from "lucide-react";
import { useSuperAdmin, useSuperAdminAnalytics } from "@/contexts/SuperAdminContext";
import { useSchedule } from "@/contexts/ScheduleContext";

export default function SuperAdminAnalytics() {
  const { trainers, clients, stats } = useSuperAdmin();
  const { events } = useSchedule();
  const { getTopPerformers, getRevenueAnalytics, getClientAnalytics } = useSuperAdminAnalytics();
  
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

  // Вычисляем аналитику по тренерам
  const trainerAnalytics = trainers
    .map((trainer) => {
      const trainerEvents = events.filter((e) => e.trainerId === trainer.id);
      const trainerClients = clients.filter((c) => c.trainerId === trainer.id);

      const completedEvents = trainerEvents.filter(
        (e) => e.status === "completed"
      ).length;
      const cancelledEvents = trainerEvents.filter(
        (e) => e.status === "cancelled"
      ).length;
      const totalEvents = trainerEvents.length;

      const completionRate =
                totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
      const cancellationRate =
        totalEvents > 0 ? (cancelledEvents / totalEvents) * 100 : 0;

      const avgProgress =
        trainerClients.length > 0
          ? trainerClients.reduce((sum, c) => sum + c.progress, 0) /
            trainerClients.length
          : 0;

      return {
        ...trainer,
        totalEvents,
        completedEvents,
        cancelledEvents,
        completionRate,
        cancellationRate,
        avgProgress,
        clientCount: trainerClients.length,
        revenuePerClient:
          trainerClients.length > 0
            ? trainer.monthlyRevenue / trainerClients.length
            : 0,
      };
    })
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

  // Аналитика по времени
  const getTimeAnalytics = () => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      quarter: new Date(now.getFullYear(), now.getMonth() - 3, 1),
    };

    const startDate = ranges[timeRange];
    const periodEvents = events.filter(
      (e) => new Date(e.startTime) >= startDate
    );

    return {
      totalEvents: periodEvents.length,
      completedEvents: periodEvents.filter((e) => e.status === "completed").length,
      cancelledEvents: periodEvents.filter((e) => e.status === "cancelled").length,
      revenue: trainers.reduce((sum, t) => sum + t.monthlyRevenue, 0),
      newClients: clients.filter((c) => new Date(c.joinDate) >= startDate).length,
    };
  };

  const timeAnalytics = getTimeAnalytics();

  // Топ метрики
  const topPerformers = getTopPerformers();
  const topMetrics = {
    mostActiveTrainer: topPerformers.byRevenue[0],
    highestRated: topPerformers.byRating[0],
    mostClients: topPerformers.byClients[0],
    bestCompletion: trainerAnalytics.sort(
      (a, b) => b.completionRate - a.completionRate
    )[0],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceColor = (
    value: number,
    type: "completion" | "rating" | "progress"
  ) => {
    if (type === "completion" || type === "progress") {
      if (value >= 90) return "text-green-600";
      if (value >= 70) return "text-yellow-600";
      return "text-red-600";
    }
    if (type === "rating") {
      if (value >= 4.5) return "text-green-600";
      if (value >= 4.0) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Аналитика и отчеты
          </h2>
          <p className="text-gray-600">
            Детальная статистика по всем тренерам и клиентам
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "week" | "month" | "quarter")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Последняя неделя</option>
            <option value="month">Последний месяц</option>
            <option value="quarter">Последний квартал</option>
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Экспорт отчета
          </Button>
        </div>
      </div>

      {/* Period Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Событий за период
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {timeAnalytics.totalEvents}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Завершено</p>
                <p className="text-2xl font-bold text-green-900">
                  {timeAnalytics.completedEvents}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Отменено</p>
                <p className="text-2xl font-bold text-red-900">
                  {timeAnalytics.cancelledEvents}
                </p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Выручка</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(timeAnalytics.revenue / 1000).toFixed(0)}К
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Новых клиентов
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {timeAnalytics.newClients}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Лидер по выручке
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {topMetrics.mostActiveTrainer?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <h3 className="font-semibold text-gray-900">
                {topMetrics.mostActiveTrainer?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {topMetrics.mostActiveTrainer?.role}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  topMetrics.mostActiveTrainer?.monthlyRevenue || 0
                )}
              </p>
              <p className="text-xs text-gray-500">в месяц</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Лучший рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {topMetrics.highestRated?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <h3 className="font-semibold text-gray-900">
                {topMetrics.highestRated?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {topMetrics.highestRated?.role}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {topMetrics.highestRated?.rating}⭐
              </p>
              <p className="text-xs text-gray-500">рейтинг</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Больше клиентов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {topMetrics.mostClients?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <h3 className="font-semibold text-gray-900">
                {topMetrics.mostClients?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {topMetrics.mostClients?.role}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {topMetrics.mostClients?.activeClients}
              </p>
              <p className="text-xs text-gray-500">активных клиентов</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Лучшая эффективность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {topMetrics.bestCompletion?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <h3 className="font-semibold text-gray-900">
                {topMetrics.bestCompletion?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {topMetrics.bestCompletion?.role}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {topMetrics.bestCompletion?.completionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">завершение</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trainers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trainers">Аналитика тренеров</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
          <TabsTrigger value="revenue">Финансовая аналитика</TabsTrigger>
        </TabsList>

        {/* Trainers Analytics */}
        <TabsContent value="trainers">
          <Card>
            <CardHeader>
              <CardTitle>Детальная аналитика по тренерам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Тренер</th>
                      <th className="text-center p-3">Клиенты</th>
                      <th className="text-center p-3">Тренировки</th>
                      <th className="text-center p-3">% Завершения</th>
                      <th className="text-center p-3">% Отмен</th>
                      <th className="text-center p-3">Рейтинг</th>
                      <th className="text-center p-3">Выручка</th>
                      <th className="text-center p-3">Прогресс клиентов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerAnalytics.map((trainer) => (
                      <tr
                        key={trainer.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                                                    <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {trainer.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium">{trainer.name}</p>
                              <p className="text-sm text-gray-600">
                                {trainer.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <div>
                            <p className="font-medium">{trainer.clientCount}</p>
                            <p className="text-xs text-gray-500">
                              {trainer.activeClients} активных
                            </p>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <div>
                            <p className="font-medium">{trainer.totalEvents}</p>
                            <p className="text-xs text-gray-500">
                              {trainer.completedEvents} завершено
                            </p>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span
                            className={`font-medium ${getPerformanceColor(trainer.completionRate, "completion")}`}
                          >
                            {trainer.completionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span
                            className={`font-medium ${trainer.cancellationRate > 10 ? "text-red-600" : "text-green-600"}`}
                          >
                            {trainer.cancellationRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className={`font-medium ${getPerformanceColor(trainer.rating, "rating")}`}
                            >
                              {trainer.rating}
                            </span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <div>
                            <p className="font-medium">
                              {formatCurrency(trainer.monthlyRevenue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(trainer.revenuePerClient)}/клиент
                            </p>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span
                            className={`font-medium ${getPerformanceColor(trainer.avgProgress, "progress")}`}
                          >
                            {trainer.avgProgress.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Эффективность по дням недели</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Понедельник",
                    "Вторник",
                    "Среда",
                    "Четверг",
                    "Пятница",
                    "Суббота",
                    "Воскресенье",
                  ].map((day, index) => {
                    const dayEvents = events.filter(
                      (e) => new Date(e.startTime).getDay() === (index + 1) % 7
                    );
                    const completedEvents = dayEvents.filter(
                      (e) => e.status === "completed"
                    ).length;
                    const completionRate =
                      dayEvents.length > 0
                        ? (completedEvents / dayEvents.length) * 100
                        : 0;

                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium w-24">{day}</span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right w-20">
                          <span className="text-sm font-medium">
                            {completionRate.toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500">
                            {dayEvents.length} событий
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Загрузка по часам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => {
                    const hourEvents = events.filter(
                      (e) => new Date(e.startTime).getHours() === hour
                    );
                    const maxEvents = 20; // Максимальное количество событий в час
                    const percentage = Math.min(
                      (hourEvents.length / maxEvents) * 100,
                      100
                    );

                    return (
                      <div
                        key={hour}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium w-16">
                          {hour}:00
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-2 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {hourEvents.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение выручки по тренерам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainerAnalytics.slice(0, 8).map((trainer, index) => {
                    const totalRevenue = trainerAnalytics.reduce(
                      (sum, t) => sum + t.monthlyRevenue,
                      0
                    );
                    const percentage =
                      (trainer.monthlyRevenue / totalRevenue) * 100;

                    return (
                      <div key={trainer.id} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-orange-600"
                                  : "bg-blue-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {trainer.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {trainer.clientCount} клиентов
                            </span>
                            <span className="text-xs font-medium">
                              {formatCurrency(trainer.monthlyRevenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Финансовые показатели</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.revenue.total)}
                      </p>
                      <p className="text-sm text-gray-600">Общая выручка</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.revenue.thisMonth)}
                      </p>
                      <p className="text-sm text-gray-600">За этот месяц</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Средние показатели:
                    </h4>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        Выручка на тренера
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          stats.revenue.thisMonth / trainers.length
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        Выручка на клиента
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          stats.revenue.thisMonth / clients.length
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        Выручка на тренировку
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          stats.revenue.thisMonth / stats.workouts.completed
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Рост по месяцам:
                    </h4>
                    <div className="space-y-2">
                      {[
                        {
                          month: "Май 2024",
                          amount: stats.revenue.thisMonth,
                          growth: 12.5,
                        },
                        {
                          month: "Апрель 2024",
                          amount: stats.revenue.thisMonth * 0.89,
                          growth: 8.3,
                        },
                        {
                          month: "Март 2024",
                          amount: stats.revenue.thisMonth * 0.82,
                          growth: 15.2,
                        },
                      ].map((item) => (
                        <div
                          key={item.month}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-600">
                            {item.month}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                              {formatCurrency(item.amount)}
                            </span>
                            <span
                              className={`ml-2 text-xs ${item.growth > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {item.growth > 0 ? "+" : ""}
                              {item.growth}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Экспорт и действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Экспорт аналитики тренеров
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Экспорт финансового отчета
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Экспорт полного отчета
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


