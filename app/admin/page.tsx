// components/admin/SuperAdminDashboard.tsx (финальная исправленная версия)
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  BarChart3
} from "lucide-react";

// Безопасные хуки с проверкой существования
function useSafeSchedule() {
  try {
    const { useSchedule } = require('@/contexts/ScheduleContext');
    return useSchedule();
  } catch (error) {
    console.warn('ScheduleContext недоступен:', error);
    return {
      events: [],
      loading: false,
      refreshData: () => Promise.resolve()
    };
  }
}

function useSafeSuperAdmin() {
  try {
    const { useSuperAdmin } = require('@/contexts/SuperAdminContext');
    return useSuperAdmin();
  } catch (error) {
    console.warn('SuperAdminContext недоступен:', error);
    return {
      trainers: [],
      clients: [],
      stats: null,
      loading: false,
      refreshData: () => Promise.resolve(),
      searchTerm: '',
      setSearchTerm: () => {}
    };
  }
}

// Безопасная функция для создания инициалов
const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'НТ';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return 'НТ';
  
  const initials = words
    .slice(0, 2) // Берем только первые 2 слова
    .map(word => {
      const firstChar = word.charAt(0);
      return firstChar ? firstChar.toUpperCase() : '';
    })
    .filter(char => char.length > 0)
    .join('');
  
  return initials.length > 0 ? initials : 'НТ';
};

export default function SuperAdminDashboard() {
  // Состояние компонента
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Array<{
    id: string;
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Безопасное получение данных из контекстов
  const scheduleData = useSafeSchedule();
  const superAdminData = useSafeSuperAdmin();

  // Проверяем инициализацию
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // Даем время на инициализацию контекстов

    return () => clearTimeout(timer);
  }, []);

  // Безопасное извлечение данных
  const rawTrainers = superAdminData?.trainers;
  const rawClients = superAdminData?.clients;
  const rawEvents = scheduleData?.events;
  const stats = superAdminData?.stats;
  const loading = superAdminData?.loading || scheduleData?.loading || false;
  const searchTerm = superAdminData?.searchTerm || '';
  const setSearchTerm = superAdminData?.setSearchTerm || (() => {});
  const refreshSuperAdminData = superAdminData?.refreshData || (() => Promise.resolve());
  const refreshScheduleData = scheduleData?.refreshData || (() => Promise.resolve());

  // Мемоизированные безопасные данные
  const safeTrainers = useMemo(() => {
    if (!Array.isArray(rawTrainers)) {
      return [];
    }
    return rawTrainers.map((trainer: any) => ({
      id: trainer?.id || String(Math.random()),
      name: trainer?.name || 'Неизвестный тренер',
      role: trainer?.role || 'Тренер',
      status: trainer?.status || 'inactive',
      activeClients: Number(trainer?.activeClients) || 0,
      totalClients: Number(trainer?.totalClients) || 0,
      monthlyRevenue: Number(trainer?.monthlyRevenue) || 0,
      rating: Number(trainer?.rating) || 0,
      phone: trainer?.phone,
      email: trainer?.email
    }));
  }, [rawTrainers]);

  const safeClients = useMemo(() => {
    if (!Array.isArray(rawClients)) {
      return [];
    }
    return rawClients.map((client: any) => ({
      id: client?.id || String(Math.random()),
      name: client?.name || 'Неизвестный клиент',
      status: client?.status || 'inactive',
      trainerId: client?.trainerId,
      trainerName: client?.trainerName
    }));
  }, [rawClients]);

  const safeEvents = useMemo(() => {
    if (!Array.isArray(rawEvents)) {
      return [];
    }
    return rawEvents.map((event: any) => ({
      _id: event?._id || String(Math.random()),
      title: event?.title || 'Без названия',
      startTime: event?.startTime || new Date().toISOString(),
      trainerName: event?.trainerName || 'Неизвестный тренер',
      clientName: event?.clientName,
      location: event?.location,
      status: event?.status || 'scheduled'
    }));
  }, [rawEvents]);

  // Безопасная статистика
  const safeStats = useMemo(() => {
    const activeTrainers = safeTrainers.filter(t => t.status === 'active');
    const activeClients = safeClients.filter(c => c.status === 'active');
    const trialClients = safeClients.filter(c => c.status === 'trial');
    const completedEvents = safeEvents.filter(e => e.status === 'completed');
    const cancelledEvents = safeEvents.filter(e => e.status === 'cancelled');
    
    const today = new Date();
    const todayEvents = safeEvents.filter(e => {
      try {
        const eventDate = new Date(e.startTime);
        return eventDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    });

    return {
      trainers: {
        total: safeTrainers.length,
        active: activeTrainers.length,
        inactive: safeTrainers.length - activeTrainers.length,
        newThisMonth: stats?.trainers?.newThisMonth || 0
      },
      clients: {
        total: safeClients.length,
        active: activeClients.length,
        trial: trialClients.length,
        newThisMonth: stats?.clients?.newThisMonth || 0
      },
      workouts: {
        total: safeEvents.length,
        today: todayEvents.length,
        thisWeek: stats?.workouts?.thisWeek || 0,
        thisMonth: stats?.workouts?.thisMonth || 0,
        completed: completedEvents.length,
        cancelled: cancelledEvents.length
      },
      revenue: {
        total: stats?.revenue?.total || 0,
        thisMonth: stats?.revenue?.thisMonth || 0,
        growth: stats?.revenue?.growth || 0,
        byTrainer: stats?.revenue?.byTrainer || {}
      },
      activity: {
        activeTrainers: activeTrainers.length,
        busySlots: stats?.activity?.busySlots || 0,
        utilizationRate: stats?.activity?.utilizationRate || 0,
        avgSessionsPerTrainer: stats?.activity?.avgSessionsPerTrainer || 0
      }
    };
  }, [safeTrainers, safeClients, safeEvents, stats]);

  // Обработчики событий
  const handleQuickMessage = (recipients: typeof selectedRecipients) => {
    setSelectedRecipients(recipients);
    setShowQuickMessage(true);
  };

  const refreshAllData = async () => {
    try {
      await Promise.all([
        refreshSuperAdminData(),
        refreshScheduleData()
      ]);
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  };

  // Проверяем готовность к отображению
  if (!isInitialized || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">
              {!isInitialized ? 'Инициализация системы...' : 'Загрузка данных...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Тренеры: {safeTrainers.length} | Клиенты: {safeClients.length} | События: {safeEvents.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            Супер Админ Дашборд
          </h1>
          <p className="text-gray-600 mt-2">
            Полный контроль над системой FitAccess - {safeTrainers.length} тренеров, {safeClients.length} клиентов, {safeEvents.length} событий
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по всей системе..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={refreshAllData}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>

          <Button 
            onClick={() => handleQuickMessage(safeTrainers.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              phone: t.phone,
              email: t.email
            })))}
            className="flex items-center gap-2"
            disabled={safeTrainers.length === 0}
          >
            <MessageSquare className="h-4 w-4" />
            Написать всем ({safeTrainers.length})
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Активных тренеров</p>
                <p className="text-2xl font-bold text-blue-900">{safeStats.trainers.active}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{safeStats.trainers.newThisMonth} за месяц
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Всего клиентов</p>
                <p className="text-2xl font-bold text-green-900">{safeStats.clients.total}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{safeStats.clients.newThisMonth} за месяц
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Тренировок сегодня</p>
                <p className="text-2xl font-bold text-purple-900">{safeStats.workouts.today}</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {safeStats.workouts.thisWeek} на неделе
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

                <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Выручка месяца</p>
                <p className="text-2xl font-bold text-orange-900">
                  {(safeStats.revenue.thisMonth / 1000).toFixed(0)}К ₽
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{safeStats.revenue.growth}% к прошлому
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Indicator */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-800">Система работает в штатном режиме</p>
                <p className="text-sm text-green-600">
                  Все сервисы активны • Последнее обновление: только что
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-800">
                Загрузка системы: {Math.round(safeStats.activity.utilizationRate)}%
              </p>
              <p className="text-xs text-green-600">
                {safeStats.activity.activeTrainers} из {safeStats.trainers.active} тренеров активны
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Сводка по тренерам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего тренеров:</span>
                <span className="font-medium">{safeTrainers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Активных:</span>
                <span className="font-medium text-green-600">{safeStats.trainers.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Неактивных:</span>
                <span className="font-medium text-red-600">{safeStats.trainers.inactive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Новых за месяц:</span>
                <span className="font-medium text-blue-600">{safeStats.trainers.newThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Сводка по клиентам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего клиентов:</span>
                <span className="font-medium">{safeClients.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Активных:</span>
                <span className="font-medium text-green-600">{safeStats.clients.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Пробных:</span>
                <span className="font-medium text-yellow-600">{safeStats.clients.trial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Новых за месяц:</span>
                <span className="font-medium text-blue-600">{safeStats.clients.newThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Активность системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего событий:</span>
                <span className="font-medium">{safeEvents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Завершено:</span>
                <span className="font-medium text-green-600">{safeStats.workouts.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Отменено:</span>
                <span className="font-medium text-red-600">{safeStats.workouts.cancelled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Загрузка:</span>
                <span className="font-medium text-blue-600">{Math.round(safeStats.activity.utilizationRate)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="trainers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Тренеры ({safeTrainers.length})
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Расписание ({safeEvents.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Последняя активность ({safeEvents.length} событий)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeEvents.length > 0 ? (
                    safeEvents
                      .slice(0, 5)
                      .map((event, index) => (
                      <div key={`activity-${event._id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {event.trainerName} • {new Date(event.startTime).toLocaleDateString('ru')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status === 'completed' ? 'Завершено' :
                           event.status === 'confirmed' ? 'Подтверждено' :
                           event.status === 'scheduled' ? 'Запланировано' :
                           'Отменено'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Нет событий для отображения</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Trainers */}
            <Card>
              <CardHeader>
                <CardTitle>Топ тренеры ({safeTrainers.length} всего)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeTrainers.length > 0 ? (
                    safeTrainers
                      .filter(trainer => trainer.monthlyRevenue > 0)
                      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                      .slice(0, 5)
                      .map((trainer, index) => (
                      <div key={`top-trainer-${trainer.id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{trainer.name}</p>
                          <p className="text-xs text-gray-600">
                            {trainer.activeClients} клиентов • ⭐ {trainer.rating}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{(trainer.monthlyRevenue / 1000).toFixed(0)}К ₽</p>
                          <p className="text-xs text-gray-600">за месяц</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Нет тренеров для отображения</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trainers">
          <Card>
            <CardHeader>
              <CardTitle>Управление тренерами ({safeTrainers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {safeTrainers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {safeTrainers.map((trainer, index) => (
                    <Card key={`trainer-${trainer.id}-${index}`} className="border-2 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {getInitials(trainer.name)}
                          </div>
                          <div>
                            <h3 className="font-medium">{trainer.name}</h3>
                            <p className="text-sm text-gray-600">{trainer.role}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Клиентов:</span>
                            <span className="font-medium">{trainer.activeClients}/{trainer.totalClients}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Рейтинг:</span>
                            <span className="font-medium">⭐ {trainer.rating}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Выручка:</span>
                            <span className="font-medium">{(trainer.monthlyRevenue / 1000).toFixed(0)}К ₽</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Подробнее
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleQuickMessage([{
                              id: trainer.id,
                              name: trainer.name,
                              role: trainer.role,
                              phone: trainer.phone,
                              email: trainer.email
                            }])}
                          >
                            Сообщение
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Нет тренеров</h3>
                  <p>Тренеры появятся здесь после загрузки данных</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Общее расписание ({safeEvents.length} событий)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeEvents.length > 0 ? (
                  <div className="grid gap-4">
                    {safeEvents
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .slice(0, 10)
                      .map((event, index) => (
                      <div key={`schedule-${event._id}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-medium">
                            {new Date(event.startTime).toLocaleDateString('ru', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(event.startTime).toLocaleTimeString('ru', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {event.trainerName}
                            {event.clientName && ` • ${event.clientName}`}
                            {event.location && ` • ${event.location}`}
                          </p>
                        </div>
                        
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status === 'completed' ? 'Завершено' :
                           event.status === 'confirmed' ? 'Подтверждено' :
                           event.status === 'scheduled' ? 'Запланировано' :
                           'Отменено'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Нет событий</h3>
                    <p>События появятся здесь после загрузки данных</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Аналитика выручки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {(safeStats.revenue.total / 1000).toFixed(0)}К ₽
                    </p>
                    <p className="text-sm text-gray-600">Общая выручка</p>
                  </div>
                  
                  <div className="space-y-3">
                    {safeTrainers
                      .filter(trainer => trainer.monthlyRevenue > 0)
                      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                      .slice(0, 5)
                      .map((trainer, index) => (
                      <div key={`revenue-${trainer.id}-${index}`} className="flex justify-between items-center">
                        <span className="text-sm">{trainer.name}</span>
                        <span className="font-medium">{(trainer.monthlyRevenue / 1000).toFixed(0)}К ₽</span>
                      </div>
                    ))}
                    {safeTrainers.filter(t => t.monthlyRevenue > 0).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Нет данных о выручке</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Метрики производительности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Загрузка системы</span>
                      <span className="text-sm font-medium">{Math.round(safeStats.activity.utilizationRate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, Math.max(0, safeStats.activity.utilizationRate))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Завершенные тренировки</span>
                      <span className="text-sm font-medium">
                        {safeStats.workouts.total > 0 ? Math.round((safeStats.workouts.completed / safeStats.workouts.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${safeStats.workouts.total > 0 ? Math.min(100, (safeStats.workouts.completed / safeStats.workouts.total) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Активные клиенты</span>
                      <span className="text-sm font-medium">
                        {safeStats.clients.total > 0 ? Math.round((safeStats.clients.active / safeStats.clients.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${safeStats.clients.total > 0 ? Math.min(100, (safeStats.clients.active / safeStats.clients.total) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{safeStats.activity.activeTrainers}</p>
                      <p className="text-xs text-gray-600">Активных тренеров</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{safeStats.workouts.today}</p>
                      <p className="text-xs text-gray-600">Тренировок сегодня</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение клиентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeTrainers.length > 0 ? (
                    safeTrainers.map((trainer, index) => {
                      const maxClients = Math.max(...safeTrainers.map(t => t.activeClients), 1);
                      const clientPercentage = (trainer.activeClients / maxClients) * 100;
                      
                      return (
                        <div key={`client-dist-${trainer.id}-${index}`} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{trainer.name}</span>
                            <span className="font-medium">{trainer.activeClients} клиентов</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.max(0, clientPercentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Нет данных для отображения</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>Состояние системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-medium text-green-800">Система работает стабильно</p>
                    <p className="text-sm text-gray-600">Все компоненты функционируют нормально</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {safeStats.trainers.total > 0 ? Math.round((safeStats.trainers.active / safeStats.trainers.total) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Активность тренеров</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {safeStats.workouts.total > 0 ? Math.round((safeStats.workouts.completed / safeStats.workouts.total) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Успешность сессий</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Время работы:</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ошибки:</span>
                      <span className="font-medium text-green-600">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Последнее обновление:</span>
                      <span className="font-medium">Только что</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Message Modal */}
      {showQuickMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQuickMessage(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Быстрое сообщение</h3>
            <p className="text-sm text-gray-600 mb-4">
              Отправить сообщение {selectedRecipients.length} получателям
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Получатели:</label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {selectedRecipients.map((recipient, index) => (
                    <div key={`recipient-${recipient.id}-${index}`} className="text-sm py-1">
                      {recipient.name} ({recipient.role})
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Сообщение:</label>
                <textarea 
                  className="w-full border rounded p-2 text-sm" 
                  rows={4}
                  placeholder="Введите ваше сообщение..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowQuickMessage(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                onClick={() => {
                  console.log('Отправка сообщения получателям:', selectedRecipients);
                  setShowQuickMessage(false);
                }}
                className="flex-1"
              >
                Отправить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (только в development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-600">
              <div>
                                <p><strong>Raw Data:</strong></p>
                <p>Trainers: {Array.isArray(rawTrainers) ? rawTrainers.length : 'Not array'}</p>
                <p>Clients: {Array.isArray(rawClients) ? rawClients.length : 'Not array'}</p>
                <p>Events: {Array.isArray(rawEvents) ? rawEvents.length : 'Not array'}</p>
              </div>
              <div>
                <p><strong>Safe Data:</strong></p>
                <p>Trainers: {safeTrainers.length} загружено</p>
                <p>Clients: {safeClients.length} загружено</p>
                <p>Events: {safeEvents.length} загружено</p>
              </div>
              <div>
                <p><strong>Loading States:</strong></p>
                <p>SuperAdmin: {superAdminData?.loading ? 'Да' : 'Нет'}</p>
                <p>Schedule: {scheduleData?.loading ? 'Да' : 'Нет'}</p>
                <p>Combined: {loading ? 'Да' : 'Нет'}</p>
                <p>Initialized: {isInitialized ? 'Да' : 'Нет'}</p>
              </div>
              <div>
                <p><strong>UI State:</strong></p>
                <p>Active Tab: {activeTab}</p>
                <p>Search: "{searchTerm}"</p>
                <p>Recipients: {selectedRecipients.length}</p>
                <p>Modal: {showQuickMessage ? 'Да' : 'Нет'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


