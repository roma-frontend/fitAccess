// app/admin/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard, PermissionHidden, PermissionInfo } from '@/components/admin/PermissionGuard';
import { usePermissions, useUserPermissions, useTrainerPermissions } from '@/hooks/usePermissions';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
// Импортируем только доступные типы из контекста
import type { Trainer, Client } from '@/contexts/UnifiedDataContext';
import {
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  CalendarPlus
} from "lucide-react";

// Определяем типы локально, если они не экспортируются из контекста
interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  clientId: string;
  trainerName: string;
  clientName: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type?: string;
  notes?: string;
}

interface ExtendedClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  trainerId?: string;
  membershipType: string;
  membershipExpiry: string;
  totalSessions: number;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  trainerName?: string;
  lastVisit: string;
}

// Создаем новый интерфейс вместо расширения
interface ExtendedTrainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  specialization: string;
  experience: number;
  activeClients: number;
  // Добавляем все остальные поля из базового Trainer, если они есть
  [key: string]: any;
}

interface Analytics {
  revenue: {
    total: number;
    monthly: number;
    thisMonth?: number;
    growth: number;
    byProduct?: { name: string; revenue: number; }[];
    trend?: { date: string; amount: number; }[];
  };
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Используем единый контекст данных
  const {
    trainers,
    clients,
    events,
    products,
    analytics,
    loading,
    error,
    isOnline,
    retryCount,
    lastSync,
    syncAllData
  } = useUnifiedData();

  // Права доступа
  const permissions = usePermissions();
  const userPermissions = useUserPermissions();
  const trainerPermissions = useTrainerPermissions();

  // Преобразование клиентов с дополнительными полями
  const extendedClients = useMemo((): ExtendedClient[] => {
    return clients.map(client => {
      const trainer = trainers.find(t => t.id === client.trainerId);

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        joinDate: client.joinDate,
        trainerId: client.trainerId,
        membershipType: client.membershipType,
        membershipExpiry: client.membershipExpiry,
        totalSessions: client.totalSessions,
        status: client.status as 'active' | 'inactive' | 'suspended' | 'trial',
        trainerName: trainer?.name,
        lastVisit: client.joinDate,
      };
    });
  }, [clients, trainers]);

  // Преобразование тренеров с дополнительными полями
  const extendedTrainers = useMemo((): ExtendedTrainer[] => {
    return trainers.map(trainer => {
      // Безопасно извлекаем все свойства из базового тренера
      const baseTrainer = trainer as any;

      return {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        status: trainer.status,
        specialization: baseTrainer.specialization || 'Общий фитнес',
        experience: baseTrainer.experience || 0,
        activeClients: baseTrainer.activeClients || 0,
        // Копируем все остальные свойства
        ...baseTrainer
      };
    });
  }, [trainers]);

  // Преобразование событий
  const typedEvents = useMemo((): Event[] => {
    return (events as any[]).map(event => ({
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      clientId: event.clientId,
      trainerName: event.trainerName,
      clientName: event.clientName,
      status: event.status,
      type: event.type,
      notes: event.notes,
    }));
  }, [events]);

  // Фильтрация данных по правам доступа
  const filteredTrainers = useMemo(() => {
    return permissions.filterData(extendedTrainers, 'trainers') as ExtendedTrainer[];
  }, [extendedTrainers, permissions]);

  const filteredClients = useMemo(() => {
    return permissions.filterData(extendedClients, 'clients') as ExtendedClient[];
  }, [extendedClients, permissions]);

  const filteredEvents = useMemo(() => {
    return permissions.filterData(typedEvents, 'schedule') as Event[];
  }, [typedEvents, permissions]);

  // Статистика для админа (упрощенная)
  const adminStats = useMemo(() => {
    const visibleTrainers = filteredTrainers;
    const visibleClients = filteredClients;
    const visibleEvents = filteredEvents;

    const activeTrainers = visibleTrainers.filter(trainer => trainer.status === 'active');
    const activeClients = visibleClients.filter(client => client.status === 'active');

    const today = new Date();
    const todayEvents = visibleEvents.filter(event => {
      try {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    });

    const thisWeekEvents = visibleEvents.filter(event => {
      try {
        const eventDate = new Date(event.startTime);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventDate >= weekStart && eventDate <= weekEnd;
      } catch {
        return false;
      }
    });

    return {
      trainers: {
        total: visibleTrainers.length,
        active: activeTrainers.length
      },
      clients: {
        total: visibleClients.length,
        active: activeClients.length,
        new: visibleClients.filter(client => {
          const joinDate = new Date(client.joinDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return joinDate >= thirtyDaysAgo;
        }).length
      },
      sessions: {
        today: todayEvents.length,
        thisWeek: thisWeekEvents.length,
        completed: visibleEvents.filter(event => event.status === 'completed').length
      }
    };
  }, [filteredTrainers, filteredClients, filteredEvents]);

  // Предстоящие события
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter(event => {
        try {
          const eventDate = new Date(event.startTime);
          return eventDate > now && event.status !== 'cancelled';
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, [filteredEvents]);

  // Недавние клиенты
  const recentClients = useMemo(() => {
    return filteredClients
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 5);
  }, [filteredClients]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка панели управления...</p>
            {retryCount > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Переподключение {retryCount}/5...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Панель администратора
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Система работает</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Проблемы с подключением</span>
                </>
              )}
            </div>

            {lastSync && (
              <div className="text-sm text-gray-500">
                Обновлено: {lastSync.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск клиентов, тренеров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Быстрые действия */}
          <Button
            onClick={() => setShowQuickActions(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Быстрые действия
          </Button>

          {/* Обновление */}
          <Button
            onClick={syncAllData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Ошибка загрузки</h4>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button
                onClick={syncAllData}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                Повторить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Тренеры */}
        <PermissionGuard resource="trainers" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Тренеры</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.trainers.active}</div>
              <p className="text-xs text-muted-foreground">
                Активных из {adminStats.trainers.total}
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Клиенты */}
        <PermissionGuard resource="clients" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.clients.active}</div>
              <p className="text-xs text-muted-foreground">
                Активных • {adminStats.clients.new} новых за месяц
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Сегодняшние тренировки */}
        <PermissionGuard resource="schedule" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.sessions.today}</div>
              <p className="text-xs text-muted-foreground">
                Тренировок • {adminStats.sessions.thisWeek} на неделе
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Выполненные тренировки */}
        <PermissionGuard resource="schedule" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.sessions.completed}</div>
              <p className="text-xs text-muted-foreground">
                Всего тренировок
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      {/* Основные вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>

          <PermissionHidden resource="trainers" action="read">
            <TabsTrigger value="trainers">Тренеры</TabsTrigger>
          </PermissionHidden>

          <PermissionHidden resource="clients" action="read">
            <TabsTrigger value="clients">Клиенты</TabsTrigger>
          </PermissionHidden>

          <PermissionHidden resource="schedule" action="read">
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
          </PermissionHidden>

          <PermissionHidden resource="analytics" action="read">
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </PermissionHidden>
        </TabsList>

        {/* Вкладка Обзор */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Предстоящие тренировки */}
            <PermissionGuard resource="schedule" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Предстоящие тренировки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            {event.trainerName} • {event.clientName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(event.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {upcomingEvents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет предстоящих тренировок</p>
                      </div>
                    )}
                  </div>

                  <PermissionHidden resource="schedule" action="create">
                    <div className="mt-4 pt-4 border-t">
                      <Button size="sm" className="w-full">
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Добавить тренировку
                      </Button>
                    </div>
                  </PermissionHidden>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* Новые клиенты */}
            <PermissionGuard resource="clients" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Новые клиенты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.membershipType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(client.joinDate).toLocaleDateString()}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                              client.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {client.status === 'active' ? 'Активен' :
                              client.status === 'trial' ? 'Пробный' : 'Неактивен'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {recentClients.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет новых клиентов</p>
                      </div>
                    )}
                  </div>

                  <PermissionHidden resource="clients" action="create">
                    <div className="mt-4 pt-4 border-t">
                      <Button size="sm" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Добавить клиента
                      </Button>
                    </div>
                  </PermissionHidden>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>

          {/* Быстрая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PermissionGuard resource="trainers" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Статус тренеров</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Активные:</span>
                      <span className="font-medium">{adminStats.trainers.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Всего:</span>
                      <span className="font-medium">{adminStats.trainers.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${adminStats.trainers.total > 0 ? (adminStats.trainers.active / adminStats.trainers.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard resource="clients" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Клиентская база</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Активные:</span>
                      <span className="font-medium">{adminStats.clients.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Новые за месяц:</span>
                      <span className="font-medium text-green-600">+{adminStats.clients.new}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Всего:</span>
                      <span className="font-medium">{adminStats.clients.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard resource="schedule" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Активность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Сегодня:</span>
                      <span className="font-medium">{adminStats.sessions.today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>На этой неделе:</span>
                      <span className="font-medium">{adminStats.sessions.thisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Выполнено всего:</span>
                      <span className="font-medium">{adminStats.sessions.completed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>
        </TabsContent>

        {/* Вкладка Тренеры */}
        <TabsContent value="trainers" className="space-y-6">
          <PermissionGuard resource="trainers" action="read">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление тренерами</CardTitle>
                <div className="flex items-center gap-2">
                  <PermissionHidden resource="trainers" action="create">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Добавить тренера
                    </Button>
                  </PermissionHidden>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Поиск тренеров */}
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Поиск тренеров..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {/* Список тренеров */}
                  <div className="grid gap-4">
                    {filteredTrainers
                      .filter((trainer) =>
                        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((trainer) => (
                        <div key={trainer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-lg">
                                  {trainer.name.charAt(0)}
                                </span>
                              </div>

                              <div>
                                <h3 className="font-medium">{trainer.name}</h3>
                                <p className="text-sm text-gray-600">{trainer.email}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {trainer.specialization}
                                  </span>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${trainer.status === 'active' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                    {trainer.status === 'active' ? 'Активен' : 'Неактивен'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium">
                                  {trainer.activeClients} клиентов
                                </p>
                                <p className="text-xs text-gray-500">
                                  Опыт: {trainer.experience} лет
                                </p>
                              </div>

                              <PermissionHidden resource="trainers" action="update">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PermissionHidden>

                              <PermissionGuard
                                resource="trainers"
                                action="update"
                                objectOwnerId={trainer.id}
                                showFallback={false}
                              >
                                <Button variant="outline" size="sm">
                                  Редактировать
                                </Button>
                              </PermissionGuard>
                            </div>
                          </div>
                        </div>
                      ))}

                    {filteredTrainers.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Тренеры не найдены</h3>
                        <p className="text-sm">Попробуйте изменить критерии поиска</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Клиенты */}
        <TabsContent value="clients" className="space-y-6">
          <PermissionGuard resource="clients" action="read">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление клиентами</CardTitle>
                <div className="flex items-center gap-2">
                  <PermissionHidden resource="clients" action="create">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Добавить клиента
                    </Button>
                  </PermissionHidden>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Статистика клиентов */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Всего</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredClients.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Активных</p>
                      <p className="text-2xl font-bold text-green-800">
                        {adminStats.clients.active}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600">Новых за месяц</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {adminStats.clients.new}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">Пробных</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {filteredClients.filter((c) => c.status === 'trial').length}
                      </p>
                    </div>
                  </div>

                  {/* Поиск и фильтры */}
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Поиск клиентов..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {/* Список клиентов */}
                  <div className="grid gap-3">
                    {filteredClients
                      .filter((client) =>
                        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        client.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 15)
                      .map((client) => (
                        <div key={client.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {client.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{client.name}</h4>
                                <p className="text-sm text-gray-600">{client.email}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Тренер: {client.trainerName || 'Не назначен'}
                                  </span>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                                      client.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                          'bg-red-100 text-red-800'
                                    }`}>
                                    {client.status === 'active' ? 'Активен' :
                                      client.status === 'trial' ? 'Пробный' :
                                        client.status === 'inactive' ? 'Неактивен' : 'Заблокирован'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium">{client.totalSessions} тренировок</p>
                                <p className="text-xs text-gray-500">
                                  Абонемент: {client.membershipType}
                                </p>
                              </div>

                              <PermissionHidden resource="clients" action="update">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PermissionHidden>

                              <PermissionGuard
                                resource="clients"
                                action="update"
                                objectOwnerId={client.trainerId}
                                showFallback={false}
                              >
                                <Button variant="outline" size="sm">
                                  Редактировать
                                </Button>
                              </PermissionGuard>
                            </div>
                          </div>
                        </div>
                      ))}

                    {filteredClients.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Клиенты не найдены</h3>
                        <p className="text-sm">Попробуйте изменить критерии поиска</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Расписание */}
        <TabsContent value="schedule" className="space-y-6">
          <PermissionGuard resource="schedule" action="read">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление расписанием</CardTitle>
                <div className="flex items-center gap-2">
                  <PermissionHidden resource="schedule" action="create">
                    <Button size="sm">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Добавить тренировку
                    </Button>
                  </PermissionHidden>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Статистика расписания */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Сегодня</p>
                      <p className="text-2xl font-bold text-blue-800">{adminStats.sessions.today}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">На неделе</p>
                      <p className="text-2xl font-bold text-green-800">{adminStats.sessions.thisWeek}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">Выполнено</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {filteredEvents.filter((e) => e.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600">Запланировано</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {filteredEvents.filter((e) => e.status === 'scheduled').length}
                      </p>
                    </div>
                  </div>

                  {/* Поиск событий */}
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Поиск по тренеру, клиенту..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {/* Список событий */}
                  <div className="grid gap-3">
                    {filteredEvents
                      .filter((event) =>
                        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.clientName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .slice(0, 20)
                      .map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-gray-600">
                                {event.trainerName} • {event.clientName}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(event.startTime).toLocaleDateString()} в {' '}
                                  {new Date(event.startTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                      event.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                  }`}>
                                  {event.status === 'completed' ? 'Выполнено' :
                                    event.status === 'confirmed' ? 'Подтверждено' :
                                      event.status === 'scheduled' ? 'Запланировано' : 'Отменено'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <PermissionHidden resource="schedule" action="update">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PermissionHidden>

                              <PermissionGuard
                                resource="schedule"
                                action="update"
                                objectOwnerId={event.trainerId}
                                showFallback={false}
                              >
                                <Button variant="outline" size="sm">
                                  Редактировать
                                </Button>
                              </PermissionGuard>
                            </div>
                          </div>
                        </div>
                      ))}

                    {filteredEvents.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">События не найдены</h3>
                        <p className="text-sm">Попробуйте изменить критерии поиска</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Отчеты */}
        <TabsContent value="reports" className="space-y-6">
          <PermissionGuard resource="analytics" action="read">
            <div className="grid gap-6">
              {/* Основные отчеты */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Основные показатели
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Активность тренеров</h4>
                      <p className="text-2xl font-bold text-blue-900">
                        {adminStats.trainers.total > 0
                          ? Math.round((adminStats.trainers.active / adminStats.trainers.total) * 100)
                          : 0}%
                      </p>
                      <p className="text-sm text-blue-600">
                        {adminStats.trainers.active} из {adminStats.trainers.total}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Рост клиентов</h4>
                      <p className="text-2xl font-bold text-green-900">+{adminStats.clients.new}</p>
                      <p className="text-sm text-green-600">За последний месяц</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800">Загрузка</h4>
                      <p className="text-2xl font-bold text-purple-900">
                        {adminStats.sessions.thisWeek}

                      </p>
                      <p className="text-sm text-purple-600">Тренировок на неделе</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-800">Эффективность</h4>
                      <p className="text-2xl font-bold text-orange-900">
                        {filteredEvents.length > 0
                          ? Math.round((adminStats.sessions.completed / filteredEvents.length) * 100)
                          : 0}%
                      </p>
                      <p className="text-sm text-orange-600">Выполненных тренировок</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Детальная аналитика */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика по тренерам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredTrainers
                        .filter((trainer) => trainer.status === 'active')
                        .slice(0, 5)
                        .map((trainer) => (
                          <div key={trainer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{trainer.name}</p>
                              <p className="text-sm text-gray-600">
                                {trainer.specialization}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {trainer.activeClients} клиентов
                              </p>
                              <p className="text-xs text-gray-500">
                                Опыт: {trainer.experience} лет
                              </p>
                            </div>
                          </div>
                        ))}

                      {filteredTrainers.filter((t) => t.status === 'active').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Нет активных тренеров</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Активность по дням</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const last7Days = Array.from({ length: 7 }, (_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() - i);
                          return date;
                        }).reverse();

                        return last7Days.map((date, index) => {
                          const dayEvents = filteredEvents.filter((event) => {
                            try {
                              const eventDate = new Date(event.startTime);
                              return eventDate.toDateString() === date.toDateString();
                            } catch {
                              return false;
                            }
                          });

                          const maxEvents = Math.max(...last7Days.map(d =>
                            filteredEvents.filter((event) => {
                              try {
                                const eventDate = new Date(event.startTime);
                                return eventDate.toDateString() === d.toDateString();
                              } catch {
                                return false;
                              }
                            }).length
                          ), 1);

                          return (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-20 text-sm text-gray-600">
                                {date.toLocaleDateString('ru', { weekday: 'short', day: 'numeric' })}
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(dayEvents.length / maxEvents) * 100}%` }}
                                ></div>
                              </div>
                              <div className="w-8 text-sm font-medium text-right">
                                {dayEvents.length}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Сводка по статусам */}
              <Card>
                <CardHeader>
                  <CardTitle>Сводка по статусам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Статусы клиентов */}
                    <div>
                      <h4 className="font-medium mb-3">Клиенты</h4>
                      <div className="space-y-2">
                        {[
                          { status: 'active', label: 'Активные', color: 'bg-green-500' },
                          { status: 'trial', label: 'Пробные', color: 'bg-yellow-500' },
                          { status: 'inactive', label: 'Неактивные', color: 'bg-gray-500' },
                          { status: 'suspended', label: 'Заблокированные', color: 'bg-red-500' }
                        ].map(({ status, label, color }) => {
                          const count = filteredClients.filter((c) => c.status === status).length;
                          const percentage = filteredClients.length > 0 ? (count / filteredClients.length) * 100 : 0;

                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                <span className="text-sm">{label}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {count} ({Math.round(percentage)}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Статусы тренировок */}
                    <div>
                      <h4 className="font-medium mb-3">Тренировки</h4>
                      <div className="space-y-2">
                        {[
                          { status: 'completed', label: 'Выполнено', color: 'bg-green-500' },
                          { status: 'confirmed', label: 'Подтверждено', color: 'bg-blue-500' },
                          { status: 'scheduled', label: 'Запланировано', color: 'bg-yellow-500' },
                          { status: 'cancelled', label: 'Отменено', color: 'bg-red-500' }
                        ].map(({ status, label, color }) => {
                          const count = filteredEvents.filter((e) => e.status === status).length;
                          const percentage = filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0;

                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                <span className="text-sm">{label}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {count} ({Math.round(percentage)}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Статусы тренеров */}
                    <div>
                      <h4 className="font-medium mb-3">Тренеры</h4>
                      <div className="space-y-2">
                        {[
                          { status: 'active', label: 'Активные', color: 'bg-green-500' },
                          { status: 'inactive', label: 'Неактивные', color: 'bg-gray-500' }
                        ].map(({ status, label, color }) => {
                          const count = filteredTrainers.filter((t) => t.status === status).length;
                          const percentage = filteredTrainers.length > 0 ? (count / filteredTrainers.length) * 100 : 0;

                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                <span className="text-sm">{label}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {count} ({Math.round(percentage)}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Топ тренеров по клиентам */}
              <Card>
                <CardHeader>
                  <CardTitle>Топ тренеров по количеству клиентов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTrainers
                      .filter((trainer) => trainer.status === 'active')
                      .sort((a, b) => (b.activeClients || 0) - (a.activeClients || 0))
                      .slice(0, 10)
                      .map((trainer, index) => (
                        <div key={trainer.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{trainer.name}</p>
                            <p className="text-sm text-gray-600">
                              {trainer.specialization}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{trainer.activeClients}</p>
                            <p className="text-xs text-gray-500">клиентов</p>
                          </div>
                        </div>
                      ))}

                    {filteredTrainers.filter((t) => t.status === 'active').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет данных о тренерах</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </PermissionGuard>
        </TabsContent>
      </Tabs>

      {/* Модальное окно быстрых действий */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <PermissionGuard resource="clients" action="create" showFallback={false}>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setShowQuickActions(false);
                      // Здесь логика добавления клиента
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Добавить клиента
                  </Button>
                </PermissionGuard>

                <PermissionGuard resource="schedule" action="create" showFallback={false}>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setShowQuickActions(false);
                      // Здесь логика добавления тренировки
                    }}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Запланировать тренировку
                  </Button>
                </PermissionGuard>

                <PermissionGuard resource="trainers" action="create" showFallback={false}>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setShowQuickActions(false);
                      // Здесь логика добавления тренера
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Добавить тренера
                  </Button>
                </PermissionGuard>

                <PermissionGuard resource="analytics" action="read" showFallback={false}>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setShowQuickActions(false);
                      setActiveTab('reports');
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Посмотреть отчеты
                  </Button>
                </PermissionGuard>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    setShowQuickActions(false);
                    syncAllData();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Обновить данные
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowQuickActions(false)}
                >
                  Закрыть
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Индикатор статуса подключения */}
      <div className="fixed bottom-6 left-6">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm shadow-lg transition-all ${isOnline
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'
            }`} />
          {isOnline ? 'Система работает' : 'Нет подключения'}
          {retryCount > 0 && !isOnline && (
            <span className="text-xs">
              ({retryCount}/5)
            </span>
          )}
        </div>
      </div>

      {/* Уведомление об обновлении */}
      {lastSync && (
        <div className="fixed top-6 right-6 z-40">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Данные обновлены
            </div>
          </div>
        </div>
      )}

      {/* Плавающая кнопка помощи */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="sm"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            // Здесь можно открыть модальное окно помощи
            console.log('Открыть справку');
          }}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


