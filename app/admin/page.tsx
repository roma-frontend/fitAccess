// components/admin/SuperAdminDashboard.tsx (исправленная версия)
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard, PermissionHidden, PermissionInfo } from '@/components/admin/PermissionGuard';
import { usePermissions, useUserPermissions, useTrainerPermissions } from '@/hooks/usePermissions';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { Trainer, Client, Session } from '@/lib/mock-data';
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
  CheckCircle
} from "lucide-react";

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

// Типы для аналитики
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

// Типы для событий
interface Event {
  _id: string;
  id?: string;
  title: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  trainerName: string;
  clientName: string;
  trainerId?: string;
  clientId?: string;
}

// Расширенные статусы клиентов
type ExtendedClientStatus = 'active' | 'inactive' | 'suspended' | 'trial';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickMessage, setShowQuickMessage] = useState(false);

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
    // Находим тренера для клиента
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

  // Фильтрация данных по правам доступа
  const filteredTrainers = useMemo(() => {
    return permissions.filterData(trainers, 'trainers');
  }, [trainers, permissions]);

  const filteredClients = useMemo(() => {
    return permissions.filterData(extendedClients, 'clients');
  }, [extendedClients, permissions]);

  const filteredEvents = useMemo(() => {
    return permissions.filterData(events, 'schedule');
  }, [events, permissions]);

  // Статистика с учетом прав доступа
const safeStats = useMemo(() => {
  const visibleTrainers = filteredTrainers;
  const visibleClients = filteredClients;
  const visibleEvents = filteredEvents;

  const activeTrainers = visibleTrainers.filter((t: Trainer) => t.status === 'active');
  
  // Правильная фильтрация клиентов по статусам
  const activeClients = visibleClients.filter((c: ExtendedClient) => c.status === 'active');
  const trialClients = visibleClients.filter((c: ExtendedClient) => c.status === 'trial');
  const inactiveClients = visibleClients.filter((c: ExtendedClient) => 
    c.status === 'inactive' || c.status === 'suspended'
  );
  
  const completedEvents = visibleEvents.filter((e: Event) => e.status === 'completed');
  
  const today = new Date();
  const todayEvents = visibleEvents.filter((e: Event) => {
    try {
      const eventDate = new Date(e.startTime);
      return eventDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  });

  // Безопасное получение данных о доходах
  const revenueData = analytics?.revenue || {
    total: 0,
    monthly: 0,
    thisMonth: 0,
    growth: 0
  };

  // Безопасное получение thisMonth
  const thisMonthRevenue = 'thisMonth' in revenueData 
    ? revenueData.thisMonth 
    : revenueData.monthly;

  return {
    trainers: {
      total: visibleTrainers.length,
      active: activeTrainers.length,
      inactive: visibleTrainers.length - activeTrainers.length
    },
    clients: {
      total: visibleClients.length,
      active: activeClients.length,
      trial: trialClients.length,
      inactive: inactiveClients.length
    },
    workouts: {
      total: visibleEvents.length,
      today: todayEvents.length,
      completed: completedEvents.length
    },
    revenue: {
      total: revenueData.total,
      thisMonth: thisMonthRevenue || 0,
      growth: revenueData.growth
    }
  };
}, [filteredTrainers, filteredClients, filteredEvents, analytics]);
  // Проверка готовности к отображению
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка данных...</p>
            <p className="text-sm text-gray-500 mt-2">
              Тренеры: {trainers.length} | Клиенты: {clients.length} | События: {events.length}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Попытка переподключения {retryCount}/5...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок с индикаторами */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Панель управления
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Онлайн</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Оффлайн</span>
                </>
              )}
            </div>
            
            {lastSync && (
              <div className="text-sm text-gray-500">
                Последняя синхронизация: {lastSync.toLocaleTimeString()}
              </div>
            )}

            <PermissionInfo resource="system" action="maintenance" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Поиск */}
          <PermissionHidden resource="users" action="read">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </PermissionHidden>

          {/* Кнопка обновления */}
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

          {/* Быстрое сообщение */}
          <PermissionHidden resource="notifications" action="create">
            <Button
              onClick={() => setShowQuickMessage(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Сообщение
            </Button>
          </PermissionHidden>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Ошибка загрузки данных</h4>
                <p className="text-sm text-red-600">{error}</p>
                {retryCount > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Автоматическая попытка переподключения через {Math.pow(2, retryCount) * 5} секунд
                  </p>
                )}
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

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Тренеры */}
        <PermissionGuard resource="trainers" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Тренеры</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeStats.trainers.total}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Активных: {safeStats.trainers.active}</span>
                <PermissionInfo resource="trainers" action="create" />
              </div>
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
              <div className="text-2xl font-bold">{safeStats.clients.total}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Активных: {safeStats.clients.active}</span>
                <span>Пробных: {safeStats.clients.trial}</span>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Тренировки */}
        <PermissionGuard resource="schedule" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Тренировки</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeStats.workouts.today}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Сегодня</span>
                <span>Всего: {safeStats.workouts.total}</span>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Доходы */}
        <PermissionGuard resource="analytics" action="read">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доходы</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₽{safeStats.revenue.thisMonth.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Этот месяц</span>
                {safeStats.revenue.growth > 0 && (
                  <span className="text-green-600">+{safeStats.revenue.growth}%</span>
                )}
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      {/* Основные вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
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
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </PermissionHidden>
          
          <PermissionHidden resource="system" action="read">
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </PermissionHidden>
        </TabsList>

        {/* Вкладка Обзор */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Последние тренировки */}
            <PermissionGuard resource="schedule" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Последние тренировки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredEvents.slice(0, 5).map((event: Event) => (
                      <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            event.status === 'completed' ? 'bg-green-100 text-green-800' :
                            event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {filteredEvents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет доступных тренировок</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* Активные тренеры */}
            <PermissionGuard resource="trainers" action="read">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Активные тренеры
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTrainers
                      .filter((trainer: Trainer) => trainer.status === 'active')
                      .slice(0, 5)
                      .map((trainer: Trainer) => (
                        <div key={trainer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {trainer.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{trainer.name}</p>
                              <p className="text-sm text-gray-600">{trainer.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{trainer.activeClients} клиентов</p>
                            <p className="text-xs text-gray-500">Рейтинг: {trainer.rating}/5</p>
                          </div>
                        </div>
                      ))}
                    
                    {filteredTrainers.filter((t: Trainer) => t.status === 'active').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет активных тренеров</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>

          {/* Системная информация */}
          <PermissionGuard resource="system" action="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Системная информация
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Статус системы</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      {isOnline ? 'Система работает нормально' : 'Проблемы с подключением'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Последняя синхронизация</h4>
                    <p className="text-sm text-green-600 mt-1">
                      {lastSync ? lastSync.toLocaleString() : 'Никогда'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Ваши права</h4>
                    <p className="text-sm text-purple-600 mt-1">
                      Роль: {permissions.currentRole}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      Уровень доступа: {permissions.getUserLevel()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Тренеры */}
        <TabsContent value="trainers" className="space-y-6">
          <PermissionGuard resource="trainers" action="read">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление тренерами</CardTitle>
                <div className="flex items-center gap-2">
                  <PermissionHidden resource="trainers" action="export">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </PermissionHidden>
                  
                  <PermissionHidden resource="trainers" action="create">
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Добавить тренера
                    </Button>
                  </PermissionHidden>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Фильтры */}
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
                      .filter((trainer: Trainer) => 
                        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((trainer: Trainer) => (
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
                                  <span className="text-xs text-gray-500">{trainer.role}</span>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                    trainer.status === 'active' ? 'bg-green-100 text-green-800' :
                                    trainer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {trainer.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium">{trainer.activeClients} клиентов</p>
                                <p className="text-xs text-gray-500">Рейтинг: {trainer.rating}/5</p>
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
                        <h3 className="text-lg font-medium mb-2">Нет доступных тренеров</h3>
                        <p className="text-sm">
                          {trainers.length === 0 
                            ? 'Тренеры не найдены в системе'
                            : 'У вас нет прав для просмотра тренеров'
                          }
                        </p>
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
                  <PermissionHidden resource="clients" action="export">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </PermissionHidden>
                  
                  <PermissionHidden resource="clients" action="create">
                    <Button size="sm">
                      <Activity className="h-4 w-4 mr-2" />
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
                      <p className="text-sm text-blue-600">Всего клиентов</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredClients.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Активных</p>
                      <p className="text-2xl font-bold text-green-800">
                        {safeStats.clients.active}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600">Пробных</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {safeStats.clients.trial}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Неактивных</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {safeStats.clients.inactive}
                      </p>
                    </div>
                  </div>

                  {/* Список клиентов */}
                  <div className="grid gap-3">
                    {filteredClients
                      .filter((client: ExtendedClient) => 
                                                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        client.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((client: ExtendedClient) => (
                        <div key={client.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{client.name}</h4>
                              <p className="text-sm text-gray-600">{client.email}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  Тренер: {client.trainerName || 'Не назначен'}
                                </span>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  client.status === 'active' ? 'bg-green-100 text-green-800' :
                                  client.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                  client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {client.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium">{client.totalSessions} тренировок</p>
                                <p className="text-xs text-gray-500">
                                  Последний визит: {new Date(client.lastVisit).toLocaleDateString()}
                                </p>
                              </div>

                              <PermissionHidden resource="clients" action="update">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PermissionHidden>
                            </div>
                          </div>
                        </div>
                      ))}

                    {filteredClients.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Нет доступных клиентов</h3>
                        <p className="text-sm">
                          {clients.length === 0 
                            ? 'Клиенты не найдены в системе'
                            : 'У вас нет прав для просмотра клиентов'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Аналитика */}
        <TabsContent value="analytics" className="space-y-6">
          <PermissionGuard resource="analytics" action="read">
            <div className="grid gap-6">
              {analytics ? (
                <>
                  {/* Графики доходов */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Аналитика доходов
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800">Общий доход</h4>
                          <p className="text-2xl font-bold text-green-900">
                            ₽{analytics.revenue.total.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800">За месяц</h4>
                          <p className="text-2xl font-bold text-blue-900">
                            ₽{analytics.revenue.monthly.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800">Рост</h4>
                          <p className="text-2xl font-bold text-purple-900">
                            +{analytics.revenue.growth}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Статистика пользователей */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Статистика пользователей
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">Всего пользователей</h4>
                          <p className="text-2xl font-bold">{analytics.users.total}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800">Активных</h4>
                          <p className="text-2xl font-bold text-green-900">{analytics.users.active}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800">Новых</h4>
                          <p className="text-2xl font-bold text-blue-900">{analytics.users.new}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800">Рост</h4>
                          <p className="text-2xl font-bold text-purple-900">+{analytics.users.growth}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Аналитика недоступна</h3>
                      <p className="text-sm">Данные аналитики не загружены или отсутствуют</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Настройки */}
        <TabsContent value="settings" className="space-y-6">
          <PermissionGuard resource="system" action="read">
            <div className="grid gap-6">
              {/* Системные настройки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Системные настройки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Автоматическая синхронизация</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Включить автоматическую синхронизацию данных каждые 5 минут
                      </p>
                      <PermissionGuard resource="system" action="update" showFallback={false}>
                        <Button variant="outline" size="sm">
                          {isOnline ? 'Включено' : 'Отключено'}
                        </Button>
                      </PermissionGuard>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Уведомления</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Настройка системных уведомлений и оповещений
                      </p>
                      <PermissionGuard resource="system" action="update" showFallback={false}>
                        <Button variant="outline" size="sm">
                          Настроить
                        </Button>
                      </PermissionGuard>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Резервное копирование</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Автоматическое создание резервных копий данных
                      </p>
                      <PermissionGuard resource="system" action="maintenance" showFallback={false}>
                        <Button variant="outline" size="sm">
                          Создать копию
                        </Button>
                      </PermissionGuard>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Импорт/Экспорт</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Управление импортом и экспортом данных
                      </p>
                      <div className="flex gap-2">
                        <PermissionGuard resource="system" action="export" showFallback={false}>
                          <Button variant="outline" size="sm">
                            Экспорт
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard resource="system" action="import" showFallback={false}>
                          <Button variant="outline" size="sm">
                            Импорт
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Управление правами */}
              <PermissionGuard resource="users" action="read">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Управление правами доступа
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Ваши текущие права</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Роль:</span> {permissions.currentRole}
                          </div>
                          <div>
                            <span className="font-medium">Уровень:</span> {permissions.getUserLevel()}
                          </div>
                          <div>
                            <span className="font-medium">Пользователи:</span> 
                            {permissions.can('users', 'read') ? ' ✓' : ' ✗'}
                          </div>
                          <div>
                            <span className="font-medium">Система:</span> 
                            {permissions.can('system', 'maintenance') ? ' ✓' : ' ✗'}
                          </div>
                        </div>
                      </div>

                      {/* Доступные роли для создания */}
                      {userPermissions.canCreateUser && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Доступные роли для создания</h4>
                          <div className="flex flex-wrap gap-2">
                            {userPermissions.creatableRoles.map((role: string) => (
                              <span
                                key={role}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {role}
                              </span>
                            ))}
                            {userPermissions.creatableRoles.length === 0 && (
                              <span className="text-sm text-gray-500">
                                Нет доступных ролей для создания
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Матрица прав доступа */}
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">Матрица прав доступа</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Ресурс</th>
                                <th className="text-center p-2">Чтение</th>
                                <th className="text-center p-2">Создание</th>
                                <th className="text-center p-2">Изменение</th>
                                <th className="text-center p-2">Удаление</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(['users', 'trainers', 'clients', 'schedule', 'analytics'] as const).map((resource) => (
                                <tr key={resource} className="border-b">
                                  <td className="p-2 font-medium capitalize">{resource}</td>
                                  <td className="text-center p-2">
                                    {permissions.can(resource, 'read') ? '✅' : '❌'}
                                  </td>
                                  <td className="text-center p-2">
                                    {permissions.can(resource, 'create') ? '✅' : '❌'}
                                  </td>
                                  <td className="text-center p-2">
                                    {permissions.can(resource, 'update') ? '✅' : '❌'}
                                  </td>
                                  <td className="text-center p-2">
                                    {permissions.can(resource, 'delete') ? '✅' : '❌'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PermissionGuard>

              {/* Системная информация */}
              <PermissionGuard resource="system" action="maintenance">
                <Card>
                  <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Системная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Статус системы:</span>
                          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                            {isOnline ? 'Онлайн' : 'Оффлайн'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Последняя синхронизация:</span>
                          <span className="text-gray-900">
                            {lastSync ? lastSync.toLocaleString() : 'Никогда'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Попытки переподключения:</span>
                          <span className="text-gray-900">{retryCount}/5</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Всего тренеров:</span>
                          <span className="text-gray-900">{trainers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Всего клиентов:</span>
                          <span className="text-gray-900">{clients.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Всего событий:</span>
                          <span className="text-gray-900">{events.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          onClick={syncAllData}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Принудительная синхронизация
                        </Button>
                        
                        <PermissionGuard resource="system" action="maintenance" showFallback={false}>
                          <Button variant="outline" size="sm">
                            Создать резервную копию
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PermissionGuard>
            </div>
          </PermissionGuard>
        </TabsContent>

        {/* Вкладка Расписание */}
        <TabsContent value="schedule" className="space-y-6">
          <PermissionGuard resource="schedule" action="read">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление расписанием</CardTitle>
                <div className="flex items-center gap-2">
                  <PermissionHidden resource="schedule" action="export">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </PermissionHidden>
                  
                  <PermissionHidden resource="schedule" action="create">
                    <Button size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Добавить событие
                    </Button>
                  </PermissionHidden>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Статистика расписания */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Всего событий</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredEvents.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Завершенных</p>
                      <p className="text-2xl font-bold text-green-800">
                        {filteredEvents.filter((e: Event) => e.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600">Запланированных</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {filteredEvents.filter((e: Event) => e.status === 'scheduled').length}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Отмененных</p>
                      <p className="text-2xl font-bold text-red-800">
                        {filteredEvents.filter((e: Event) => e.status === 'cancelled').length}
                      </p>
                    </div>
                  </div>

                  {/* Список событий */}
                  <div className="grid gap-3">
                    {filteredEvents
                      .filter((event: Event) => 
                        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.clientName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 15)
                      .map((event: Event) => (
                        <div key={event._id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-gray-600">
                                {event.trainerName} • {event.clientName}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(event.startTime).toLocaleString()}
                                </span>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  event.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {event.status}
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
                        <h3 className="text-lg font-medium mb-2">Нет доступных событий</h3>
                        <p className="text-sm">
                          {events.length === 0 
                            ? 'События не найдены в системе'
                            : 'У вас нет прав для просмотра событий'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>
      </Tabs>

      {/* Модальное окно быстрого сообщения */}
      {showQuickMessage && (
        <PermissionGuard resource="notifications" action="create" showFallback={false}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Быстрое сообщение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Кому..." />
                <Input placeholder="Тема..." />
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Сообщение..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuickMessage(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={() => setShowQuickMessage(false)}>
                    Отправить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PermissionGuard>
      )}

      {/* Плавающая кнопка помощи */}
      <div className="fixed bottom-6 right-6">
        <PermissionGuard resource="system" action="read" showFallback={false}>
          <Button
            size="sm"
            className="rounded-full shadow-lg"
            onClick={() => {
              // Здесь можно открыть модальное окно помощи
              console.log('Открыть помощь');
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      </div>

      {/* Индикатор статуса подключения */}
      <div className="fixed bottom-6 left-6">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-600' : 'bg-red-600'
          }`} />
          {isOnline ? 'Подключено' : 'Нет подключения'}
          {retryCount > 0 && !isOnline && (
            <span className="text-xs">
              (попытка {retryCount}/5)
            </span>
          )}
        </div>
      </div>

      {/* Уведомления о новых данных */}
      {lastSync && (
        <div className="fixed top-6 right-6 z-40">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Данные обновлены
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



