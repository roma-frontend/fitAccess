// components/admin/schedule/TrainerWorkload.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Target,
  Eye,
  User,
  MapPin,
} from "lucide-react";
import { TrainerSchedule, ScheduleEvent } from "./types";

interface TrainerWorkloadProps {
  trainers: TrainerSchedule[];
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void; // Добавляем обработчик клика
}

export function TrainerWorkload({
  trainers,
  events,
  onEventClick,
}: TrainerWorkloadProps) {
  // Вычислить статистику для каждого тренера
  const getTrainerStats = (trainerId: string) => {
    const trainerEvents = events.filter((e) => e.trainerId === trainerId);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Понедельник
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Воскресенье

    const thisWeekEvents = trainerEvents.filter((e) => {
      const eventDate = new Date(e.startTime);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    const totalHours = thisWeekEvents.reduce((acc, event) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const completedEvents = thisWeekEvents.filter(
      (e) => e.status === "completed"
    ).length;
    const cancelledEvents = thisWeekEvents.filter(
      (e) => e.status === "cancelled"
    ).length;
    const upcomingEvents = thisWeekEvents.filter((e) => {
      const eventDate = new Date(e.startTime);
      return eventDate > today && e.status !== "cancelled";
    }).length;

    return {
      totalEvents: thisWeekEvents.length,
      totalHours: Math.round(totalHours * 10) / 10,
      completedEvents,
      cancelledEvents,
      upcomingEvents,
      utilizationRate: Math.round((totalHours / 40) * 100), // Предполагаем 40-часовую рабочую неделю
      thisWeekEvents: thisWeekEvents.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    };
  };

  const getWorkloadColor = (utilizationRate: number) => {
    if (utilizationRate >= 90) return "text-red-600 bg-red-50";
    if (utilizationRate >= 70) return "text-orange-600 bg-orange-50";
    if (utilizationRate >= 50) return "text-green-600 bg-green-50";
    return "text-blue-600 bg-blue-50";
  };

  const getWorkloadLabel = (utilizationRate: number) => {
    if (utilizationRate >= 90) return "Перегружен";
    if (utilizationRate >= 70) return "Высокая загрузка";
    if (utilizationRate >= 50) return "Оптимальная загрузка";
    return "Низкая загрузка";
  };

  const getStatusColor = (status: ScheduleEvent["status"]) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

const getEventTypeIcon = (type: ScheduleEvent["type"]) => {
  const icons = {
    training: "🏋️",
    consultation: "💬",
    group: "👥",
    meeting: "🤝",
    break: "☕",
    other: "📋",
  };
  return icons[type];
};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Загрузка тренеров (текущая неделя)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {trainers.map((trainer) => {
            const stats = getTrainerStats(trainer.trainerId);
            const workloadColor = getWorkloadColor(stats.utilizationRate);
            const workloadLabel = getWorkloadLabel(stats.utilizationRate);

            return (
              <div key={trainer.trainerId} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {trainer.trainerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {trainer.trainerName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {trainer.trainerRole}
                      </p>
                    </div>
                  </div>
                  <Badge className={workloadColor}>{workloadLabel}</Badge>
                </div>

                {/* Прогресс загрузки */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Загрузка: {stats.totalHours}ч / 40ч</span>
                    <span className="font-medium">
                      {stats.utilizationRate}%
                    </span>
                  </div>
                  <Progress value={stats.utilizationRate} className="h-3" />
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-600">
                      {stats.totalEvents}
                    </div>
                    <div className="text-xs text-gray-600">Всего событий</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-600">
                      {stats.completedEvents}
                    </div>
                    <div className="text-xs text-gray-600">Завершено</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-600">
                      {stats.upcomingEvents}
                    </div>
                    <div className="text-xs text-gray-600">Предстоящие</div>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Clock className="h-5 w-5 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-red-600">
                      {stats.cancelledEvents}
                    </div>
                    <div className="text-xs text-gray-600">Отменено</div>
                  </div>
                </div>

                {/* Рабочие часы */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Рабочие часы
                  </h4>
                  <div className="text-sm text-gray-600">
                    {trainer.workingHours.start} - {trainer.workingHours.end}
                    <span className="ml-2">
                      (
                      {trainer.workingHours.days
                        .map((day) => {
                          const days = [
                            "Вс",
                            "Пн",
                            "Вт",
                            "Ср",
                            "Чт",
                            "Пт",
                            "Сб",
                          ];
                          return days[day];
                        })
                        .join(", ")}
                      )
                    </span>
                  </div>
                </div>

                {/* События на эту неделю */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    События на эту неделю ({stats.thisWeekEvents.length})
                  </h4>

                  {stats.thisWeekEvents.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>На эту неделю событий нет</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stats.thisWeekEvents.map((event) => {
                        const startTime = new Date(event.startTime);
                        const endTime = new Date(event.endTime);
                        const isToday =
                          startTime.toDateString() ===
                          new Date().toDateString();
                        const isPast = endTime < new Date();

                        return (
                          <div
                            key={event._id}
                            onClick={() => onEventClick(event)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                              isToday
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white hover:bg-gray-50"
                            } ${isPast ? "opacity-75" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getEventTypeIcon(event.type)}
                                </span>
                                <h5 className="font-medium text-gray-900">
                                  {event.title}
                                </h5>
                                <Badge className={getStatusColor(event.status)}>
                                  {event.status}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {startTime.toLocaleDateString("ru", {
                                    weekday: "short",
                                    day: "numeric",
                                  })}{" "}
                                  {startTime.toLocaleTimeString("ru", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" - "}
                                  {endTime.toLocaleTimeString("ru", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {event.clientName && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{event.clientName}</span>
                                </div>
                              )}

                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>

                            {event.description && (
                              <div className="mt-2 text-xs text-gray-500 truncate">
                                {event.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
