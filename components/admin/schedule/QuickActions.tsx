// components/admin/schedule/QuickActions.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Download
} from "lucide-react";
import { ScheduleEvent, ScheduleStats } from "./types";

interface QuickActionsProps {
  events: ScheduleEvent[];
  stats: ScheduleStats;
  onBulkAction: (action: string, eventIds: string[]) => void;
}

export function QuickActions({ events, stats, onBulkAction }: QuickActionsProps) {
  const today = new Date();
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate > today && event.status !== 'cancelled';
  });

  const pendingConfirmation = events.filter(event => event.status === 'scheduled');
  const overdueEvents = events.filter(event => {
    const eventDate = new Date(event.endTime);
    return eventDate < today && event.status === 'confirmed';
  });

  const quickActionCards = [
    {
      title: "Подтвердить события",
      description: `${pendingConfirmation.length} событий ожидают подтверждения`,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      action: () => onBulkAction('confirm', pendingConfirmation.map(e => e._id)),
      disabled: pendingConfirmation.length === 0,
      badge: pendingConfirmation.length
    },
    {
      title: "Завершить прошедшие",
      description: `${overdueEvents.length} событий требуют завершения`,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      action: () => onBulkAction('complete', overdueEvents.map(e => e._id)),
      disabled: overdueEvents.length === 0,
      badge: overdueEvents.length
    },
    {
      title: "Экспорт расписания",
      description: "Скачать отчет по расписанию",
      icon: Download,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      action: () => onBulkAction('export', events.map(e => e._id)),
      disabled: events.length === 0,
      badge: null
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quickActionCards.map((action) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.title}
                  className={`${action.bgColor} ${action.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <h5 className="font-medium text-gray-900">{action.title}</h5>
                    </div>
                    {action.badge !== null && action.badge > 0 && (
                      <Badge variant="secondary">{action.badge}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={action.disabled}
                    onClick={action.action}
                    className="w-full"
                  >
                    Выполнить
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Расписание на сегодня
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayEvents.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">На сегодня событий нет</p>
              </div>
            ) : (
              todayEvents
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 5)
                .map(event => {
                  const startTime = new Date(event.startTime).toLocaleTimeString('ru', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  const endTime = new Date(event.endTime).toLocaleTimeString('ru', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });

                  const statusColors = {
                    scheduled: 'bg-blue-100 text-blue-800',
                    confirmed: 'bg-green-100 text-green-800',
                    completed: 'bg-emerald-100 text-emerald-800',
                    cancelled: 'bg-red-100 text-red-800',
                    'no-show': 'bg-gray-100 text-gray-800'
                  };

                  return (
                    <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h6 className="font-medium text-gray-900">{event.title}</h6>
                          <Badge className={statusColors[event.status]}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>{startTime} - {endTime}</span>
                            <span>{event.trainerName}</span>
                            {event.clientName && <span>• {event.clientName}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
            
            {todayEvents.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm">
                  Показать еще {todayEvents.length - 5} событий
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Предстоящие события
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {upcomingEvents.filter(e => {
                  const eventDate = new Date(e.startTime);
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);
                  return eventDate.toDateString() === tomorrow.toDateString();
                }).length}
              </div>
              <div className="text-sm text-gray-600">Завтра</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {upcomingEvents.filter(e => {
                  const eventDate = new Date(e.startTime);
                  const weekFromNow = new Date(today);
                  weekFromNow.setDate(today.getDate() + 7);
                  return eventDate <= weekFromNow;
                }).length}
              </div>
              <div className="text-sm text-gray-600">На этой неделе</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {upcomingEvents.filter(e => {
                  const eventDate = new Date(e.startTime);
                  const monthFromNow = new Date(today);
                  monthFromNow.setMonth(today.getMonth() + 1);
                  return eventDate <= monthFromNow;
                }).length}
              </div>
              <div className="text-sm text-gray-600">В этом месяце</div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="mt-6 space-y-3">
            {pendingConfirmation.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Требуют подтверждения</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  {pendingConfirmation.length} событий ожидают подтверждения от тренеров
                </p>
              </div>
            )}

            {overdueEvents.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-900">Просроченные события</h4>
                </div>
                <p className="text-sm text-red-700">
                  {overdueEvents.length} событий требуют обновления статуса
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
