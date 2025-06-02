// components/admin/SuperAdminOverview.tsx (исправленная версия)
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity,
  Clock,
  Target,
  AlertTriangle,
  Star,
  MapPin,
  RefreshCw
} from "lucide-react";
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';

export default function SuperAdminOverview() {
  const { events, loading: scheduleLoading } = useSchedule();
  const superAdminData = useSuperAdmin();

  // Проверяем, что данные загружены
  if (!superAdminData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка данных супер-админа...</p>
          </div>
        </div>
      </div>
    );
  }

  const { trainers, clients, stats, getTrainerStats } = superAdminData;

  // Проверяем, что массивы инициализированы
  const safeTrainers = trainers || [];
  const safeClients = clients || [];
  const safeEvents = events || [];

  // Получаем топ тренеров по различным метрикам
  const topTrainersByRevenue = [...safeTrainers]
    .sort((a: any, b: any) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
    .slice(0, 5);

  const topTrainersByRating = [...safeTrainers]
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const topTrainersByClients = [...safeTrainers]
    .sort((a: any, b: any) => (b.activeClients || 0) - (a.activeClients || 0))
    .slice(0, 5);

  // Получаем предстоящие события из единого контекста
  const upcomingEvents = safeEvents
    .filter((e: any) => new Date(e.startTime) > new Date() && e.status !== 'cancelled')
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10);

  // Получаем события, требующие внимания
  const eventsNeedingAttention = safeEvents.filter((e: any) => {
    const eventDate = new Date(e.startTime);
    const now = new Date();
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return (
      (e.status === 'scheduled' && hoursDiff < 24 && hoursDiff > 0) ||
      (e.status === 'confirmed' && eventDate < now)
    );
  });

  // Получаем неактивных тренеров
  const inactiveTrainers = safeTrainers.filter((t: any) => {
    if (!t.lastActivity) return true;
    const lastActivity = new Date(t.lastActivity);
    const hoursSinceActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 24 || t.status !== 'active';
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (scheduleLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Синхронизация данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Data Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">
            Данные обновлены в реальном времени • {safeEvents.length} событий
          </span>
        </div>
      </div>

      {/* Alerts and Notifications */}
      {(eventsNeedingAttention.length > 0 || inactiveTrainers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {eventsNeedingAttention.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Требуют внимания ({eventsNeedingAttention.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventsNeedingAttention.slice(0, 3).map((event: any) => (
                    <div key={event._id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-gray-600">
                          {event.trainerName} • {new Date(event.startTime).toLocaleString('ru')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                  {eventsNeedingAttention.length > 3 && (
                    <p className="text-xs text-orange-700 text-center pt-2">
                      +{eventsNeedingAttention.length - 3} событий
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {inactiveTrainers.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Users className="h-5 w-5" />
                  Неактивные тренеры ({inactiveTrainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inactiveTrainers.slice(0, 3).map((trainer: any) => (
                    <div key={trainer.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <p className="font-medium text-sm">{trainer.name}</p>
                        <p className="text-xs text-gray-600">
                          Последняя активность: {trainer.lastActivity ? new Date(trainer.lastActivity).toLocaleString('ru') : 'Неизвестно'}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {trainer.status || 'inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Топ по выручке
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTrainersByRevenue.length > 0 ? (
                topTrainersByRevenue.map((trainer: any, index: number) => (
                  <div key={trainer.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{trainer.name}</p>
                      <p className="text-xs text-gray-600">{formatCurrency(trainer.monthlyRevenue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{trainer.activeClients || 0}</p>
                      <p className="text-xs text-gray-500">клиентов</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Нет данных о выручке</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top by Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Топ по рейтингу
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTrainersByRating.length > 0 ? (
                topTrainersByRating.map((trainer: any, index: number) => (
                  <div key={trainer.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{trainer.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{(trainer.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{trainer.totalWorkouts || 0}</p>
                      <p className="text-xs text-gray-500">тренировок</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Star className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Нет данных о рейтинге</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top by Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Топ по клиентам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTrainersByClients.length > 0 ? (
                topTrainersByClients.map((trainer: any, index: number) => (
                  <div key={trainer.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{trainer.name}</p>
                      <p className="text-xs text-gray-600">{trainer.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{trainer.activeClients || 0}</p>
                      <p className="text-xs text-gray-500">активных</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Нет данных о клиентах</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* System Health with Real-time Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Загрузка системы (в реальном времени)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Загрузка тренеров</span>
                  <span className="font-medium">{stats?.activity?.utilizationRate?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={stats?.activity?.utilizationRate || 0} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Активные события</span>
                  <span className="font-medium">
                    {safeEvents.filter((e: any) => e.status === 'confirmed').length}/{safeEvents.length}
                  </span>
                </div>
                <Progress 
                  value={safeEvents.length > 0 ? (safeEvents.filter((e: any) => e.status === 'confirmed').length / safeEvents.length) * 100 : 0} 
                  className="h-3" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Занятые слоты</span>
                  <span className="font-medium">{stats?.activity?.busySlots || 0}</span>
                </div>
                <Progress value={Math.min(((stats?.activity?.busySlots || 0) / 100) * 100, 100)} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats?.activity?.avgSessionsPerTrainer?.toFixed(1) || 0}</p>
                  <p className="text-xs text-gray-600">Сессий на тренера</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats?.workouts?.thisWeek || 0}</p>
                  <p className="text-xs text-gray-600">Тренировок на неделе</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events from ScheduleContext */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Предстоящие события
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Предстоящих событий нет</p>
                </div>
              ) : (
                upcomingEvents.map((event: any) => {
                  const startTime = new Date(event.startTime);
                  const isToday = startTime.toDateString() === new Date().toDateString();
                  const isTomorrow = startTime.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
                  
                  return (
                    <div 
                      key={event._id} 
                      className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                        isToday ? 'bg-blue-50 border-blue-200' : 
                        isTomorrow ? 'bg-green-50 border-green-200' : 
                        'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {isToday ? 'Сегодня' : isTomorrow ? 'Завтра' : startTime.toLocaleDateString('ru')}
                            {' '}
                            {startTime.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{event.trainerName}</span>
                          {event.clientName && <span>• {event.clientName}</span>}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity from Real-time Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Последняя активность (в реальном времени)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Показываем последние изменения в событиях */}
            {safeEvents.length > 0 ? (
              safeEvents.slice(-4).reverse().map((event: any, index: number) => {
                const activityType = event.status === 'completed' ? 'завершена' : 
                                   event.status === 'confirmed' ? 'подтверждена' : 
                                   event.status === 'cancelled' ? 'отменена' : 'создана';
                
                const activityColor = event.status === 'completed' ? 'bg-green-500' :
                                     event.status === 'confirmed' ? 'bg-blue-500' :
                                     event.status === 'cancelled' ? 'bg-red-500' : 'bg-purple-500';
                
                return (
                  <div key={`${event._id}-${index}`} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${activityColor}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Тренировка {activityType}</p>
                      <p className="text-xs text-gray-500">
                        {event.trainerName} • {event.title} • {new Date(event.startTime).toLocaleString('ru')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Активность не обнаружена</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего тренеров</p>
                <p className="text-2xl font-bold text-blue-600">{safeTrainers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Активных: {safeTrainers.filter((t: any) => t.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего клиентов</p>
                <p className="text-2xl font-bold text-green-600">{safeClients.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Активных: {safeClients.filter((c: any) => c.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Событий сегодня</p>
                <p className="text-2xl font-bold text-purple-600">
                  {safeEvents.filter((e: any) => {
                    const today = new Date();
                    const eventDate = new Date(e.startTime);
                    return eventDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Подтверждено: {safeEvents.filter((e: any) => {
                  const today = new Date();
                  const eventDate = new Date(e.startTime);
                  return eventDate.toDateString() === today.toDateString() && e.status === 'confirmed';
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(safeTrainers.reduce((sum: number, t: any) => sum + (t.monthlyRevenue || 0), 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                За текущий месяц
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
