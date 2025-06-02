// components/admin/SuperAdminDashboard.tsx (исправленная версия)
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard, PermissionHidden, PermissionInfo } from '@/components/admin/PermissionGuard';
import { usePermissions, useUserPermissions, useTrainerPermissions } from '@/hooks/usePermissions';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { UnifiedTrainer, UnifiedEvent, UnifiedClient, WorkingHours } from '@/types/unified';
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
  Shield,
  AlertTriangle,
  CheckCircle,
  Bell,
  AlertCircle
} from "lucide-react";

// Расширенные типы для аналитики
interface ExtendedAnalytics {
  revenue: {
    total: number;
    monthly: number;
    thisMonth?: number;
    growth: number;
    byProduct?: { name: string; revenue: number; }[];
    trend?: { date: string; amount: number; }[];
    averageCheck: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  workouts: {
    total: number;
    completed: number;
    cancelled: number;
    noShows: number;
    weeklyDistribution: { day: string; count: number; }[];
  };
  topTrainers: {
    id: string;
    name: string;
    clients: number;
    revenue: number;
    rating: number;
  }[];
  clientRetention: {
    rate: number;
    newClients: number;
    lostClients: number;
  };
}

// Типы для топ тренеров
interface TopTrainer {
  id: string;
  name: string;
  clients: number;
  revenue: number;
  rating: number;
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Используем единый контекст данных
  const {
    trainers: rawTrainers,
    clients: rawClients,
    events: rawEvents,
    products,
    analytics: rawAnalytics,
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

  // Безопасное приведение типов аналитики
  const analytics = useMemo((): ExtendedAnalytics | null => {
    if (!rawAnalytics) return null;
    
    return {
      revenue: {
        total: rawAnalytics.revenue?.total || 0,
        monthly: rawAnalytics.revenue?.monthly || 0,
        thisMonth: rawAnalytics.revenue?.thisMonth || rawAnalytics.revenue?.monthly || 0,
        growth: rawAnalytics.revenue?.growth || 0,
        averageCheck: (rawAnalytics.revenue as any)?.averageCheck || 0,
        byProduct: (rawAnalytics.revenue as any)?.byProduct || [],
        trend: (rawAnalytics.revenue as any)?.trend || []
      },
      users: (rawAnalytics as any).users || {
        total: 0,
        active: 0,
        new: 0,
        growth: 0
      },
      workouts: (rawAnalytics as any).workouts || {
        total: 0,
        completed: 0,
        cancelled: 0,
        noShows: 0,
        weeklyDistribution: []
      },
      topTrainers: (rawAnalytics as any).topTrainers || [],
      clientRetention: (rawAnalytics as any).clientRetention || {
        rate: 0,
        newClients: 0,
        lostClients: 0
      }
    };
  }, [rawAnalytics]);

  // Преобразование данных к унифицированным типам
  const trainers = useMemo((): UnifiedTrainer[] => {
    return rawTrainers.map(trainer => ({
      ...trainer,
      // Обеспечиваем наличие всех обязательных полей
      specialization: trainer.specializations || [],
      specializations: trainer.specializations || [],
      experience: trainer.experience || 0,
      rating: trainer.rating || 0,
      activeClients: trainer.activeClients || 0,
      totalSessions: trainer.totalSessions || trainer.totalWorkouts || 0,
      hourlyRate: trainer.hourlyRate || 0,
      certifications: trainer.certifications || [],
      workingHours: {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '10:00', end: '16:00', isWorking: true },
        sunday: { start: '10:00', end: '16:00', isWorking: false }
      } as WorkingHours,
      // Поля из контекста
      avatar: trainer.avatar,
      joinDate: trainer.joinDate || trainer.createdAt || new Date().toISOString(),
      totalClients: trainer.totalClients || trainer.activeClients || 0,
      monthlyRevenue: trainer.monthlyRevenue || 0,
      lastActivity: trainer.lastActivity || trainer.updatedAt || trainer.createdAt || new Date().toISOString(),
      // Общие поля
      createdAt: trainer.createdAt || new Date().toISOString(),
      updatedAt: trainer.updatedAt,
      createdBy: 'system',
      updatedBy: undefined
    }));
  }, [rawTrainers]);

  const events = useMemo((): UnifiedEvent[] => {
    return rawEvents.map(event => ({
      id: event.id || event._id || '',
      _id: event._id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime || '',
      // Обеспечиваем совместимость статусов
      status: event.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
      trainerName: event.trainerName || '',
      clientName: event.clientName || '',
      trainerId: event.trainerId || '',
      clientId: event.clientId || '',
      type: (event.type === 'training' ? 'personal' : 
             event.type === 'consultation' ? 'consultation' : 
             'group') as 'personal' | 'group' | 'consultation',
      notes: event.notes || '',
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: event.updatedAt,
      createdBy: event.createdBy || 'system',
      updatedBy: undefined
    }));
  }, [rawEvents]);

  const clients = useMemo((): UnifiedClient[] => {
    return rawClients.map(client => {
      // Находим тренера для клиента
      const trainer = trainers.find(t => t.id === client.trainerId);
      
      return {
        ...client,
        status: client.status as 'active' | 'inactive' | 'suspended' | 'trial',
        membershipType: (client.membershipType || 'basic') as 'basic' | 'premium' | 'vip',
        membershipExpiry: client.membershipExpiry || '',
        trainerName: trainer?.name,
        lastVisit: client.lastVisit || client.joinDate,
        totalSessions: client.totalSessions || 0,
        createdAt: client.createdAt || client.joinDate,
        updatedAt: client.updatedAt,
        createdBy: 'system',
        updatedBy: undefined
      };
    
    });
}, [rawClients, trainers]);

// Фильтрация данных по правам доступа
const filteredTrainers = useMemo(() => {
  return permissions.filterData(trainers, 'trainers') as UnifiedTrainer[];
}, [trainers, permissions]);

const filteredClients = useMemo(() => {
  return permissions.filterData(clients, 'clients') as UnifiedClient[];
}, [clients, permissions]);

const filteredEvents = useMemo(() => {
  return permissions.filterData(events, 'schedule') as UnifiedEvent[];
}, [events, permissions]);

// Статистика с учетом прав доступа
const safeStats = useMemo(() => {
  const visibleTrainers = filteredTrainers;
  const visibleClients = filteredClients;
  const visibleEvents = filteredEvents;

  const activeTrainers = visibleTrainers.filter((t: UnifiedTrainer) => t.status === 'active');
  
  // Правильная фильтрация клиентов по статусам
  const activeClients = visibleClients.filter((c: UnifiedClient) => c.status === 'active');
  const trialClients = visibleClients.filter((c: UnifiedClient) => c.status === 'trial');
  const inactiveClients = visibleClients.filter((c: UnifiedClient) => 
    c.status === 'inactive' || c.status === 'suspended'
  );
  
  const completedEvents = visibleEvents.filter((e: UnifiedEvent) => e.status === 'completed');
  
  const today = new Date();
  const todayEvents = visibleEvents.filter((e: UnifiedEvent) => {
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
  const thisMonthRevenue = revenueData.thisMonth || revenueData.monthly || 0;

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
      thisMonth: thisMonthRevenue,
      growth: revenueData.growth
    }
  };
}, [filteredTrainers, filteredClients, filteredEvents, analytics]);

// Получение разрешений пользователя
const userPermissionsData = useMemo(() => {
  const permissionsObj = permissions as any;
  return permissionsObj.permissions || {};
}, [permissions]);

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

const currentError = error || localError;

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
    {currentError && (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Ошибка загрузки данных</h4>
              <p className="text-sm text-red-600">{currentError}</p>
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
                  {filteredEvents.slice(0, 5).map((event: UnifiedEvent) => (
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
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          event.status === 'no-show' ? 'bg-orange-100 text-orange-800' :
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
                      .filter((trainer: UnifiedTrainer) => trainer.status === 'active')
                      .slice(0, 5)
                      .map((trainer: UnifiedTrainer) => (
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
                    
                    {filteredTrainers.filter((t: UnifiedTrainer) => t.status === 'active').length === 0 && (
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
                      .filter((trainer: UnifiedTrainer) => 
                        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((trainer: UnifiedTrainer) => (
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
                      .filter((client: UnifiedClient) => 
                        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        client.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((client: UnifiedClient) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Всего событий</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredEvents.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Завершенных</p>
                      <p className="text-2xl font-bold text-green-800">
                        {filteredEvents.filter((e: UnifiedEvent) => e.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600">Запланированных</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {filteredEvents.filter((e: UnifiedEvent) => e.status === 'scheduled').length}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Неявки</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {filteredEvents.filter((e: UnifiedEvent) => e.status === 'no-show').length}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Отмененных</p>
                      <p className="text-2xl font-bold text-red-800">
                        {filteredEvents.filter((e: UnifiedEvent) => e.status === 'cancelled').length}
                      </p>
                    </div>
                  </div>

                  {/* Список событий */}
                  <div className="grid gap-3">
                    {filteredEvents
                      .filter((event: UnifiedEvent) => 
                        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (event.trainerName && event.trainerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (event.clientName && event.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .slice(0, 15)
                      .map((event: UnifiedEvent) => (
                        <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
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
                                {event.type && (
                                  <span className="text-xs text-gray-500 capitalize">
                                    {event.type}
                                  </span>
                                )}
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  event.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                  event.status === 'no-show' ? 'bg-orange-100 text-orange-800' :
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
                          <h4 className="font-medium text-blue-800">Этот месяц</h4>
                          <p className="text-2xl font-bold text-blue-900">
                            ₽{(analytics.revenue.thisMonth || analytics.revenue.monthly).toLocaleString()}
                          </p>
                          <p className="text-sm text-blue-600">
                            {analytics.revenue.growth > 0 ? '+' : ''}{analytics.revenue.growth}% к прошлому месяцу
                          </p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800">Средний чек</h4>
                          <p className="text-2xl font-bold text-purple-900">
                            ₽{analytics.revenue.averageCheck.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* График доходов по месяцам */}
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>График доходов</p>
                          <p className="text-sm">Интеграция с системой аналитики</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Статистика тренировок */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Статистика тренировок
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-800">Всего тренировок</h4>
                          <p className="text-2xl font-bold text-orange-900">
                            {analytics.workouts.total}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800">Завершенных</h4>
                          <p className="text-2xl font-bold text-green-900">
                            {analytics.workouts.completed}
                          </p>
                          <p className="text-sm text-green-600">
                            {analytics.workouts.total > 0 
                              ? ((analytics.workouts.completed / analytics.workouts.total) * 100).toFixed(1)
                              : 0
                            }%
                          </p>
                        </div>
                        
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-medium text-red-800">Неявки</h4>
                          <p className="text-2xl font-bold text-red-900">
                            {analytics.workouts.noShows}
                          </p>
                          <p className="text-sm text-red-600">
                            {analytics.workouts.total > 0 
                              ? ((analytics.workouts.noShows / analytics.workouts.total) * 100).toFixed(1)
                              : 0
                            }%
                          </p>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium text-yellow-800">Отмененных</h4>
                          <p className="text-2xl font-bold text-yellow-900">
                            {analytics.workouts.cancelled}
                          </p>
                          <p className="text-sm text-yellow-600">
                            {analytics.workouts.total > 0 
                              ? ((analytics.workouts.cancelled / analytics.workouts.total) * 100).toFixed(1)
                              : 0
                            }%
                          </p>
                        </div>
                      </div>

                      {/* График активности по дням недели */}
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>График активности по дням</p>
                          <p className="text-sm">Распределение тренировок по дням недели</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Топ тренеров */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Топ тренеров
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.topTrainers.map((trainer: TopTrainer, index: number) => (
                          <div key={trainer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{trainer.name}</p>
                                <p className="text-sm text-gray-600">{trainer.clients} клиентов</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₽{trainer.revenue.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Рейтинг: {trainer.rating}/5</p>
                            </div>
                          </div>
                        ))}

                        {analytics.topTrainers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Нет данных о тренерах</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Удержание клиентов */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Удержание клиентов
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800">Уровень удержания</h4>
                          <p className="text-2xl font-bold text-green-900">
                            {analytics.clientRetention.rate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-green-600">
                            Клиенты остаются активными
                          </p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800">Новые клиенты</h4>
                          <p className="text-2xl font-bold text-blue-900">
                            {analytics.clientRetention.newClients}
                          </p>
                          <p className="text-sm text-blue-600">
                            За этот месяц
                          </p>
                        </div>
                        
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-medium text-red-800">Потерянные клиенты</h4>
                          <p className="text-2xl font-bold text-red-900">
                            {analytics.clientRetention.lostClients}
                          </p>
                          <p className="text-sm text-red-600">
                            За этот месяц
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Аналитика недоступна</h3>
                    <p className="text-sm text-gray-500">
                      Данные аналитики загружаются или недоступны для вашего уровня доступа
                    </p>
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
                    <Shield className="h-5 w-5" />
                    Системные настройки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Информация о системе */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Статус системы</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Подключение:</span>
                            <span className={`text-sm font-medium ${
                              isOnline ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isOnline ? 'Активно' : 'Отключено'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Последняя синхронизация:</span>
                            <span className="text-sm">
                              {lastSync ? lastSync.toLocaleString() : 'Никогда'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Попыток переподключения:</span>
                            <span className="text-sm">{retryCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Права доступа</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Текущая роль:</span>
                            <span className="text-sm font-medium">{permissions.currentRole}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Уровень доступа:</span>
                            <span className="text-sm">{permissions.getUserLevel()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Администратор:</span>
                            <span className={`text-sm font-medium ${
                              permissions.isAdmin() ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {permissions.isAdmin() ? 'Да' : 'Нет'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Действия системы */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Действия системы</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={syncAllData}
                          variant="outline"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                              Синхронизация...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Синхронизировать данные
                            </>
                          )}
                        </Button>

                        <PermissionHidden resource="system" action="maintenance">
                          <Button variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Экспорт всех данных
                          </Button>
                        </PermissionHidden>

                        <PermissionHidden resource="system" action="maintenance">
                          <Button variant="outline">
                            <Shield className="h-4 w-4 mr-2" />
                            Проверка целостности
                          </Button>
                        </PermissionHidden>
                      </div>
                    </div>

                    {/* Информация о разрешениях */}
                    <PermissionGuard resource="system" action="maintenance">
                      <div className="border-t pt-6">
                        <h4 className="font-medium mb-4">Матрица разрешений</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {Object.entries(userPermissionsData).map(([resource, actions]) => (
                              <div key={resource} className="bg-white p-3 rounded border">
                                <h5 className="font-medium capitalize mb-2">{resource}</h5>
                                <div className="space-y-1">
                                  {Object.entries(actions as Record<string, boolean>).map(([action, allowed]) => (
                                    <div key={action} className="flex justify-between">
                                      <span className="text-gray-600 capitalize">{action}:</span>
                                      <span className={`font-medium ${
                                        allowed ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {allowed ? 'Да' : 'Нет'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PermissionGuard>
                  </div>
                </CardContent>
              </Card>

              {/* Настройки уведомлений */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Настройки уведомлений
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Уведомления о новых клиентах</p>
                        <p className="text-sm text-gray-600">Получать уведомления при регистрации новых клиентов</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Напоминания о тренировках</p>
                        <p className="text-sm text-gray-600">Уведомления за час до начала тренировки</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Отчеты о доходах</p>
                        <p className="text-sm text-gray-600">Еженедельные отчеты о финансовых показателях</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Системные уведомления</p>
                        <p className="text-sm text-gray-600">Уведомления об ошибках и проблемах системы</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Статистика использования */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Статистика использования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Активные пользователи</h4>
                      <p className="text-2xl font-bold text-blue-900">
                        {filteredTrainers.filter(t => t.status === 'active').length + 
                         filteredClients.filter(c => c.status === 'active').length}
                      </p>
                      <p className="text-sm text-blue-600">За последние 30 дней</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Сессии сегодня</h4>
                      <p className="text-2xl font-bold text-green-900">
                        {safeStats.workouts.today}
                      </p>
                      <p className="text-sm text-green-600">Запланированных тренировок</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800">Загрузка системы</h4>
                      <p className="text-2xl font-bold text-purple-900">
                        {Math.round((safeStats.workouts.today / Math.max(filteredTrainers.length, 1)) * 100)}%
                      </p>
                      <p className="text-sm text-purple-600">Средняя нагрузка</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-800">Время отклика</h4>
                      <p className="text-2xl font-bold text-orange-900">
                        {isOnline ? '< 100' : '> 5000'}ms
                      </p>
                      <p className="text-sm text-orange-600">Среднее время ответа</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </PermissionGuard>
        </TabsContent>
      </Tabs>

      {/* Модальные окна и диалоги */}
      {showQuickMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Быстрое сообщение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Получатели</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Все пользователи</option>
                  <option>Только тренеры</option>
                  <option>Только клиенты</option>
                  <option>Администраторы</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Сообщение</label>
                <textarea 
                  className="w-full p-2 border rounded-lg h-24 resize-none"
                  placeholder="Введите ваше сообщение..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="urgent" />
                <label htmlFor="urgent" className="text-sm">Срочное уведомление</label>
              </div>
              
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
      )}
      
      {/* Уведомления об ошибках */}
      {currentError && (
        <div className="fixed bottom-4 right-4 max-w-md z-40">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">Ошибка</h4>
                  <p className="text-sm text-red-700 mt-1">{currentError}</p>
                  <Button
                    onClick={() => setLocalError(null)}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <CardContent className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium">Загрузка данных...</p>
                <p className="text-sm text-gray-600">Пожалуйста, подождите</p>
                {retryCount > 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Попытка {retryCount}/5
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Уведомления о статусе подключения */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-30">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Работа в автономном режиме
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Индикатор синхронизации */}
      {loading && isOnline && (
        <div className="fixed top-4 left-4 z-30">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-800">
                  Синхронизация данных...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


