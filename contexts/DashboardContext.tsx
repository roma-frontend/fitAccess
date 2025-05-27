// contexts/DashboardContext.tsx (используем единую функцию)
"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  UnifiedTrainer, 
  UnifiedClient, 
  UnifiedEvent, 
  DashboardStats, 
  Analytics 
} from '@/types/dashboard';
import { ensureDebugSystem } from '@/utils/cleanTypes';

interface DashboardContextType {
  trainers: UnifiedTrainer[];
  clients: UnifiedClient[];
  events: UnifiedEvent[];
  stats: DashboardStats;
  analytics: Analytics | null;
  loading: boolean;
  error: string | null;
  syncAllData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  addEvent: (event: UnifiedEvent) => void;
  updateEvent: (eventId: string, data: Partial<UnifiedEvent>) => void;
  removeEvent: (eventId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const dashboardData = useDashboardData();

  const addEvent = (event: UnifiedEvent) => {
    console.log('📝 Dashboard: добавление события', event.title);
    dashboardData.refreshStats();
  };

  const updateEvent = (eventId: string, data: Partial<UnifiedEvent>) => {
    console.log('📝 Dashboard: обновление события', eventId);
    dashboardData.refreshStats();
  };

  const removeEvent = (eventId: string) => {
    console.log('📝 Dashboard: удаление события', eventId);
    dashboardData.refreshStats();
  };

  // ✅ РЕГИСТРАЦИЯ В DEBUG СИСТЕМЕ С ЕДИНОЙ ФУНКЦИЕЙ
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // ✅ ИСПОЛЬЗУЕМ ЕДИНУЮ ФУНКЦИЮ ИНИЦИАЛИЗАЦИИ
      ensureDebugSystem();
      
      // ✅ СОЗДАЕМ ОБЪЕКТ DASHBOARD КОНТЕКСТА
      const dashboardContext = {
        events: dashboardData.events,
        trainers: dashboardData.trainers,
        clients: dashboardData.clients,
        stats: dashboardData.stats,
        analytics: dashboardData.analytics,
        loading: dashboardData.loading,
        error: dashboardData.error,
        syncAllData: dashboardData.syncAllData,
        refreshStats: dashboardData.refreshStats,
        addEvent,
        updateEvent,
        removeEvent,
        getStats: () => ({
          totalEvents: dashboardData.events.length,
          totalTrainers: dashboardData.trainers.length,
          totalClients: dashboardData.clients.length,
          loading: dashboardData.loading,
          lastSync: new Date().toISOString()
        })
      };
      
      // ✅ РЕГИСТРИРУЕМ DASHBOARD КОНТЕКСТ
      window.fitAccessDebug.dashboard = dashboardContext;
      
      console.log('✅ Dashboard контекст зарегистрирован в debug системе');
    }
  }, []);

  // ✅ ОБНОВЛЯЕМ ДАННЫЕ В DEBUG СИСТЕМЕ ПРИ ИЗМЕНЕНИЯХ
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fitAccessDebug?.dashboard) {
      window.fitAccessDebug.dashboard.events = dashboardData.events;
      window.fitAccessDebug.dashboard.trainers = dashboardData.trainers;
      window.fitAccessDebug.dashboard.clients = dashboardData.clients;
      window.fitAccessDebug.dashboard.stats = dashboardData.stats;
      window.fitAccessDebug.dashboard.analytics = dashboardData.analytics;
      window.fitAccessDebug.dashboard.loading = dashboardData.loading;
      window.fitAccessDebug.dashboard.error = dashboardData.error;
    }
  }, [dashboardData.events, dashboardData.trainers, dashboardData.clients, dashboardData.stats, dashboardData.analytics, dashboardData.loading, dashboardData.error]);

  // ✅ СЛУШАЕМ ИЗМЕНЕНИЯ ИЗ SCHEDULE ЧЕРЕЗ WINDOW EVENTS
  useEffect(() => {
    const handleScheduleUpdate = (event: CustomEvent) => {
      console.log('🔄 Dashboard получил обновление от Schedule:', event.detail);
      dashboardData.refreshStats();
      setTimeout(() => {
        dashboardData.syncAllData();
      }, 500);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('schedule-updated', handleScheduleUpdate as EventListener);
      return () => {
        window.removeEventListener('schedule-updated', handleScheduleUpdate as EventListener);
      };
    }
  }, [dashboardData.refreshStats, dashboardData.syncAllData]);

  const value: DashboardContextType = {
    ...dashboardData,
    addEvent,
    updateEvent,
    removeEvent
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
