// contexts/DashboardContext.tsx (исправленная версия)
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ensureDebugSystem } from '@/utils/cleanTypes';

// ✅ ТИПЫ ТОЛЬКО ДЛЯ DASHBOARD КОНТЕКСТА
interface DashboardStats {
  totalClients: number;
  activeTrainers: number;
  todayEvents: number;
  monthlyRevenue: number;
  weeklyGrowth: number;
  clientRetention: number;
  averageRating: number;
  equipmentUtilization: number;
}

interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface DashboardAnalytics {
  clientGrowth: Array<{ month: string; clients: number; revenue: number }>;
  trainerPerformance: Array<{ 
    trainerId: string; 
    name: string; 
    sessions: number; 
    rating: number; 
    revenue: number 
  }>;
  equipmentUsage: Array<{ equipment: string; usage: number; maintenance: string }>;
  revenueByService: Array<{ service: string; revenue: number; percentage: number }>;
  peakHours: Array<{ hour: number; utilization: number }>;
  membershipTypes: Array<{ type: string; count: number; revenue: number }>;
}

interface DashboardContextType {
  // Основные данные
  stats: DashboardStats;
  notifications: DashboardNotification[];
  analytics: DashboardAnalytics;
  events: any[]; // События из Schedule
  trainers: any[]; // Тренеры из Schedule
  clients: any[]; // Клиенты
  
  // Состояние
  loading: boolean;
  error: string | null;
  
  // Действия
  refreshStats: () => Promise<void>;
  syncAllData: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Подписки
  subscribeToUpdates: (callback: (data: any) => void) => () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeTrainers: 0,
    todayEvents: 0,
    monthlyRevenue: 0,
    weeklyGrowth: 0,
    clientRetention: 0,
    averageRating: 0,
    equipmentUtilization: 0
  });
  
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    clientGrowth: [],
    trainerPerformance: [],
    equipmentUsage: [],
    revenueByService: [],
    peakHours: [],
    membershipTypes: []
  });
  
  const [events, setEvents] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<((data: any) => void)[]>([]);

  // ✅ MOCK ДАННЫЕ ДЛЯ РАЗРАБОТКИ
  const getMockStats = (): DashboardStats => ({
    totalClients: 156,
    activeTrainers: 8,
    todayEvents: 24,
    monthlyRevenue: 485000,
    weeklyGrowth: 12.5,
    clientRetention: 87.3,
    averageRating: 4.7,
    equipmentUtilization: 73.2
  });

  const getMockNotifications = (): DashboardNotification[] => [
    {
      id: 'notif1',
      type: 'warning',
      title: 'Оборудование требует обслуживания',
      message: 'Беговая дорожка #3 требует планового технического обслуживания',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high'
    },
    {
      id: 'notif2',
      type: 'success',
      title: 'Новый клиент',
      message: 'Зарегистрирован новый клиент: Анна Петрова',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium'
    },
    {
      id: 'notif3',
      type: 'info',
      title: 'Отчет готов',
      message: 'Месячный отчет по доходам готов к просмотру',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low'
    },
    {
      id: 'notif4',
      type: 'error',
      title: 'Проблема с платежом',
      message: 'Не удалось обработать платеж клиента ID: 12345',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high'
    }
  ];

  const getMockAnalytics = (): DashboardAnalytics => ({
    clientGrowth: [
      { month: 'Янв', clients: 120, revenue: 380000 },
      { month: 'Фев', clients: 135, revenue: 425000 },
      { month: 'Мар', clients: 142, revenue: 445000 },
      { month: 'Апр', clients: 156, revenue: 485000 }
    ],
    trainerPerformance: [
      { trainerId: 'trainer1', name: 'Александр Петров', sessions: 45, rating: 4.8, revenue: 67500 },
      { trainerId: 'trainer2', name: 'Мария Иванова', sessions: 38, rating: 4.9, revenue: 57000 },
      { trainerId: 'trainer3', name: 'Дмитрий Козлов', sessions: 42, rating: 4.6, revenue: 63000 }
    ],
    equipmentUsage: [
      { equipment: 'Беговые дорожки', usage: 85, maintenance: 'Хорошее' },
      { equipment: 'Силовые тренажеры', usage: 73, maintenance: 'Требует внимания' },
      { equipment: 'Кардио зона', usage: 67, maintenance: 'Хорошее' }
    ],
    revenueByService: [
      { service: 'Персональные тренировки', revenue: 285000, percentage: 58.8 },
      { service: 'Групповые занятия', revenue: 125000, percentage: 25.8 },
      { service: 'Абонементы', revenue: 75000, percentage: 15.4 }
    ],
    peakHours: [
      { hour: 9, utilization: 45 },
      { hour: 18, utilization: 89 },
      { hour: 19, utilization: 95 },
      { hour: 20, utilization: 78 }
    ],
    membershipTypes: [
      { type: 'Премиум', count: 45, revenue: 225000 },
      { type: 'Стандарт', count: 78, revenue: 195000 },
      { type: 'Базовый', count: 33, revenue: 65000 }
    ]
  });

  const getMockClients = () => [
    { id: 'client1', name: 'Анна Смирнова', membershipType: 'Премиум', joinDate: '2024-01-15' },
    { id: 'client2', name: 'Дмитрий Козлов', membershipType: 'Стандарт', joinDate: '2024-02-20' },
    { id: 'client3', name: 'Елена Васильева', membershipType: 'Премиум', joinDate: '2024-03-10' },
    { id: 'client4', name: 'Михаил Петров', membershipType: 'Базовый', joinDate: '2024-04-05' },
    { id: 'client5', name: 'Ольга Петрова', membershipType: 'Стандарт', joinDate: '2024-04-12' },
    { id: 'client6', name: 'Сергей Иванов', membershipType: 'Премиум', joinDate: '2024-04-18' }
  ];

  // ✅ ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ
  const notifySubscribers = (data: any) => {
    subscribers.forEach(callback => callback(data));
  };

  const calculateStatsFromEvents = (eventsData: any[]) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    
    const todayEvents = eventsData.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startOfToday && eventDate < endOfToday;
    });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEvents = eventsData.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startOfMonth && event.status === 'completed';
    });

    return {
      todayEvents: todayEvents.length,
      monthlyRevenue: monthEvents.length * 1500, // Примерная стоимость
      activeEvents: eventsData.filter(e => e.status !== 'cancelled').length
    };
  };

  const refreshStats = async (): Promise<void> => {
    try {
      console.log('🔄 Обновление статистики Dashboard...');
      
      // Пытаемся получить актуальные данные из Schedule контекста
      let eventsData = events;
      let trainersData = trainers;
      
      if (typeof window !== 'undefined' && window.fitAccessDebug?.schedule) {
        eventsData = window.fitAccessDebug.schedule.events || events;
        trainersData = window.fitAccessDebug.schedule.trainers || trainers;
        console.log('📊 Получены данные из Schedule:', eventsData.length, 'событий');
      }
      
      // Обновляем статистику на основе актуальных данных
      const calculatedStats = calculateStatsFromEvents(eventsData);
      const mockStats = getMockStats();
      
      const updatedStats = {
        ...mockStats,
        ...calculatedStats,
        activeTrainers: trainersData.length
      };
      
      setStats(updatedStats);
      setEvents(eventsData);
      setTrainers(trainersData);
      
      console.log('✅ Статистика Dashboard обновлена');
      notifySubscribers({ stats: updatedStats, events: eventsData });
      
    } catch (err) {
      console.error('❌ Ошибка обновления статистики:', err);
      setError('Ошибка обновления статистики');
    }
  };

    const syncAllData = async (): Promise<void> => {
    try {
      console.log('🔄 Полная синхронизация данных Dashboard...');
      setLoading(true);
      setError(null);
      
      // Пытаемся получить данные из API
      const [statsResponse, notificationsResponse] = await Promise.allSettled([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/notifications')
      ]);
      
      let statsData = getMockStats();
      let notificationsData = getMockNotifications();
      
      // Обрабатываем ответ статистики
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        statsData = await statsResponse.value.json();
        console.log('✅ Статистика загружена с API');
      } else {
        console.log('⚠️ API статистики недоступен, используем mock данные');
      }
      
      // Обрабатываем ответ уведомлений
      if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.ok) {
        notificationsData = await notificationsResponse.value.json();
        console.log('✅ Уведомления загружены с API');
      } else {
        console.log('⚠️ API уведомлений недоступен, используем mock данные');
      }
      
      // Получаем данные из Schedule контекста если доступны
      let eventsData: any[] = [];
      let trainersData: any[] = [];
      
      if (typeof window !== 'undefined' && window.fitAccessDebug?.schedule) {
        eventsData = window.fitAccessDebug.schedule.events || [];
        trainersData = window.fitAccessDebug.schedule.trainers || [];
        console.log('📊 Синхронизированы данные из Schedule:', eventsData.length, 'событий');
        
        // Пересчитываем статистику на основе актуальных событий
        const calculatedStats = calculateStatsFromEvents(eventsData);
        statsData = {
          ...statsData,
          ...calculatedStats,
          activeTrainers: trainersData.length
        };
      }
      
      // Обновляем состояние
      setStats(statsData);
      setNotifications(notificationsData);
      setAnalytics(getMockAnalytics());
      setEvents(eventsData);
      setTrainers(trainersData);
      setClients(getMockClients());
      
      console.log('✅ Полная синхронизация Dashboard завершена');
      notifySubscribers({ 
        stats: statsData, 
        notifications: notificationsData, 
        events: eventsData 
      });
      
    } catch (err) {
      console.error('❌ Критическая ошибка синхронизации:', err);
      setError('Ошибка синхронизации данных');
      
      // Fallback к mock данным
      const mockStats = getMockStats();
      const mockNotifications = getMockNotifications();
      
      setStats(mockStats);
      setNotifications(mockNotifications);
      setAnalytics(getMockAnalytics());
      setClients(getMockClients());
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const subscribeToUpdates = (callback: (data: any) => void): (() => void) => {
    setSubscribers(prev => [...prev, callback]);
    
    return () => {
      setSubscribers(prev => prev.filter(sub => sub !== callback));
    };
  };

  // ✅ СЛУШАЕМ ИЗМЕНЕНИЯ ИЗ SCHEDULE КОНТЕКСТА
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScheduleUpdate = (event: CustomEvent) => {
        console.log('🔄 Dashboard получил уведомление об изменении Schedule');
        const { events: updatedEvents } = event.detail;
        
        // Обновляем наши данные
        setEvents(updatedEvents);
        
        // Пересчитываем статистику
        const calculatedStats = calculateStatsFromEvents(updatedEvents);
        setStats(prev => ({
          ...prev,
          ...calculatedStats
        }));
        
        console.log('✅ Dashboard синхронизирован с Schedule');
      };
      
      window.addEventListener('schedule-updated', handleScheduleUpdate as EventListener);
      
      return () => {
        window.removeEventListener('schedule-updated', handleScheduleUpdate as EventListener);
      };
    }
  }, []);

  // ✅ РЕГИСТРАЦИЯ В DEBUG СИСТЕМЕ
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ensureDebugSystem();
      
      const dashboardContext = {
        events,
        trainers,
        clients,
        notifications,
        stats,
        analytics,
        loading,
        error,
        syncAllData,
        refreshStats,
        markNotificationAsRead,
        clearAllNotifications,
        subscribeToUpdates,
        getStats: () => ({
          totalNotifications: notifications.length,
          unreadNotifications: notifications.filter(n => !n.read).length,
          highPriorityNotifications: notifications.filter(n => n.priority === 'high').length,
          totalClients: stats.totalClients,
          todayEvents: stats.todayEvents,
          monthlyRevenue: stats.monthlyRevenue,
          lastSync: new Date().toISOString()
        })
      };
      
      window.fitAccessDebug.dashboard = dashboardContext;
      console.log('✅ Dashboard контекст зарегистрирован в debug системе');
    }
  }, [events, trainers, clients, notifications, stats, analytics, loading, error]);

  // ✅ ИНИЦИАЛИЗАЦИЯ ДАННЫХ
  useEffect(() => {
    syncAllData();
  }, []);

  const value: DashboardContextType = {
    stats,
    notifications,
    analytics,
    events,
    trainers,
    clients,
    loading,
    error,
    refreshStats,
    syncAllData,
    markNotificationAsRead,
    clearAllNotifications,
    subscribeToUpdates
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// ✅ ДОПОЛНИТЕЛЬНЫЕ ХУКИ ДЛЯ DASHBOARD
export function useDashboardStats() {
  const { stats, loading } = useDashboard();
  
  return React.useMemo(() => {
    const growthIndicators = {
      clientsGrowth: stats.weeklyGrowth > 0 ? 'up' : stats.weeklyGrowth < 0 ? 'down' : 'stable',
      revenueGrowth: stats.monthlyRevenue > 400000 ? 'up' : 'stable',
      retentionTrend: stats.clientRetention > 85 ? 'good' : stats.clientRetention > 70 ? 'average' : 'poor'
    };
    
    return {
      ...stats,
      growthIndicators,
      loading,
      isHealthy: stats.clientRetention > 80 && stats.averageRating > 4.5
    };
  }, [stats, loading]);
}

export function useDashboardNotifications() {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useDashboard();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;
  
  const notificationsByPriority = React.useMemo(() => {
    const grouped = notifications.reduce((acc, notif) => {
      if (!acc[notif.priority]) acc[notif.priority] = [];
      acc[notif.priority].push(notif);
      return acc;
    }, {} as Record<string, DashboardNotification[]>);
    
    return {
      high: grouped.high || [],
      medium: grouped.medium || [],
      low: grouped.low || []
    };
  }, [notifications]);
  
  const recentNotifications = React.useMemo(() => {
    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [notifications]);
  
  return {
    notifications,
    unreadCount,
    highPriorityCount,
    notificationsByPriority,
    recentNotifications,
    markAsRead: markNotificationAsRead,
    clearAll: clearAllNotifications
  };
}

export function useDashboardAnalytics() {
  const { analytics, stats } = useDashboard();
  
  const insights = React.useMemo(() => {
    const insights = [];
    
    // Анализ роста клиентов
    if (analytics.clientGrowth.length >= 2) {
      const lastMonth = analytics.clientGrowth[analytics.clientGrowth.length - 1];
      const prevMonth = analytics.clientGrowth[analytics.clientGrowth.length - 2];
      const growth = ((lastMonth.clients - prevMonth.clients) / prevMonth.clients) * 100;
      
      if (growth > 10) {
        insights.push({
          type: 'positive',
          title: 'Отличный рост клиентской базы',
          description: `Рост на ${growth.toFixed(1)}% за последний месяц`
        });
      }
    }
    
    // Анализ пиковых часов
    const peakHour = analytics.peakHours.reduce((max, hour) => 
      hour.utilization > max.utilization ? hour : max, analytics.peakHours[0]
    );
    
    if (peakHour && peakHour.utilization > 90) {
      insights.push({
        type: 'warning',
        title: 'Высокая загруженность',
        description: `${peakHour.hour}:00 - пиковое время (${peakHour.utilization}% загрузки)`
      });
    }
    
    // Анализ производительности тренеров
    const topTrainer = analytics.trainerPerformance.reduce((max, trainer) => 
      trainer.rating > max.rating ? trainer : max, analytics.trainerPerformance[0]
    );
    
    if (topTrainer && topTrainer.rating > 4.8) {
      insights.push({
        type: 'positive',
        title: 'Выдающийся тренер',
        description: `${topTrainer.name} показывает отличные результаты (${topTrainer.rating}/5)`
      });
    }
    
    return insights;
  }, [analytics]);
  
  const trends = React.useMemo(() => {
    return {
      clientGrowthTrend: analytics.clientGrowth.length >= 3 ? 
        analytics.clientGrowth.slice(-3).every((month, i, arr) => 
          i === 0 || month.clients > arr[i-1].clients
        ) ? 'growing' : 'declining' : 'stable',
      
      revenueTrend: analytics.clientGrowth.length >= 3 ?
        analytics.clientGrowth.slice(-3).every((month, i, arr) => 
          i === 0 || month.revenue > arr[i-1].revenue
        ) ? 'growing' : 'declining' : 'stable',
      
      utilizationTrend: stats.equipmentUtilization > 80 ? 'high' : 
        stats.equipmentUtilization > 60 ? 'medium' : 'low'
    };
  }, [analytics, stats]);
  
  return {
    analytics,
    insights,
    trends,
    summary: {
      totalRevenue: analytics.clientGrowth.reduce((sum, month) => sum + month.revenue, 0),
      averageRating: analytics.trainerPerformance.reduce((sum, trainer) => sum + trainer.rating, 0) / analytics.trainerPerformance.length,
      totalSessions: analytics.trainerPerformance.reduce((sum, trainer) => sum + trainer.sessions, 0),
      peakUtilization: Math.max(...analytics.peakHours.map(h => h.utilization))
    }
  };
}

export function useRealtimeUpdates() {
  const { subscribeToUpdates } = useDashboard();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((data) => {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      console.log('📊 Dashboard получил обновление:', data);
    });
    
    return unsubscribe;
  }, [subscribeToUpdates]);
  
  return {
    lastUpdate,
    updateCount,
    isConnected: true // В реальном приложении это может быть состояние WebSocket
  };
}

