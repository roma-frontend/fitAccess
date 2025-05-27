// components/debug/ContextRegistrar.tsx (улучшенная версия)
"use client";

import { useEffect } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';

export default function ContextRegistrar() {
  const schedule = useSchedule();
  const dashboard = useDashboard();
  const superAdmin = useSuperAdmin();

  useEffect(() => {
    console.log('🔧 ContextRegistrar: принудительная регистрация контекстов');
    
    if (typeof window !== 'undefined') {
      // ✅ ИНИЦИАЛИЗИРУЕМ FITACCESSDEBUG ЕСЛИ ЕГО НЕТ
      if (!window.fitAccessDebug) {
        window.fitAccessDebug = {} as any;
        console.log('✅ fitAccessDebug объект создан');
      }
      
      // ✅ ПРИНУДИТЕЛЬНО РЕГИСТРИРУЕМ SCHEDULE
      if (schedule && !window.fitAccessDebug.schedule) {
        window.fitAccessDebug.schedule = {
          events: schedule.events,
          trainers: schedule.trainers,
          loading: schedule.loading,
          error: schedule.error,
          createEvent: schedule.createEvent,
          updateEvent: schedule.updateEvent,
          deleteEvent: schedule.deleteEvent,
          updateEventStatus: schedule.updateEventStatus,
          getEventsByTrainer: schedule.getEventsByTrainer,
          getEventsInDateRange: schedule.getEventsInDateRange,
          searchEvents: schedule.searchEvents,
          refreshData: schedule.refreshData,
          subscribeToUpdates: schedule.subscribeToUpdates,
          getStats: () => ({
            totalEvents: schedule.events.length,
            activeEvents: schedule.events.filter(e => e.status !== 'cancelled').length,
            trainersCount: schedule.trainers.length
          }),
          clearAllEvents: () => {
            console.log('🧹 Очистка событий через ContextRegistrar');
          }
        };
        console.log('✅ Schedule контекст принудительно зарегистрирован');
        console.log(`📊 Schedule: ${schedule.events.length} событий, ${schedule.trainers.length} тренеров`);
      }
      
      // ✅ ПРИНУДИТЕЛЬНО РЕГИСТРИРУЕМ DASHBOARD
      if (dashboard && !window.fitAccessDebug.dashboard) {
        window.fitAccessDebug.dashboard = {
          events: dashboard.events,
          trainers: dashboard.trainers,
          clients: dashboard.clients,
          stats: dashboard.stats,
          analytics: dashboard.analytics,
          loading: dashboard.loading,
          error: dashboard.error,
          syncAllData: dashboard.syncAllData,
          refreshStats: dashboard.refreshStats,
          addEvent: dashboard.addEvent,
          updateEvent: dashboard.updateEvent,
          removeEvent: dashboard.removeEvent,
          getStats: () => ({
            totalEvents: dashboard.events.length,
            totalTrainers: dashboard.trainers.length,
            totalClients: dashboard.clients.length
          })
        };
        console.log('✅ Dashboard контекст принудительно зарегистрирован');
        console.log(`📊 Dashboard: ${dashboard.events.length} событий, ${dashboard.trainers.length} тренеров, ${dashboard.clients.length} клиентов`);
      }
      
      // ✅ ПРИНУДИТЕЛЬНО РЕГИСТРИРУЕМ SUPERADMIN
      if (superAdmin && !window.fitAccessDebug.superAdmin) {
        window.fitAccessDebug.superAdmin = {
          trainers: superAdmin.trainers,
          clients: superAdmin.clients,
          loading: superAdmin.loading,
          error: superAdmin.error,
          refreshData: superAdmin.refreshData,
          getStats: () => ({
            totalTrainers: superAdmin.trainers.length,
            totalClients: superAdmin.clients.length,
            loading: superAdmin.loading
          })
        };
        console.log('✅ SuperAdmin контекст принудительно зарегистрирован');
        console.log(`📊 SuperAdmin: ${superAdmin.trainers.length} тренеров, ${superAdmin.clients.length} клиентов`);
      }
      
      // ✅ ЛОГИРУЕМ ФИНАЛЬНОЕ СОСТОЯНИЕ
      const finalState = {
        schedule: !!window.fitAccessDebug.schedule,
        dashboard: !!window.fitAccessDebug.dashboard,
        superAdmin: !!window.fitAccessDebug.superAdmin,
        scheduleEvents: window.fitAccessDebug.schedule?.events?.length || 0,
        dashboardEvents: window.fitAccessDebug.dashboard?.events?.length || 0,
        superAdminTrainers: window.fitAccessDebug.superAdmin?.trainers?.length || 0
      };
      
      console.log('📊 Финальное состояние fitAccessDebug:', finalState);
      
      // ✅ ПРОВЕРЯЕМ ЧТО ВСЕ КОНТЕКСТЫ ЗАРЕГИСТРИРОВАНЫ
      const allRegistered = finalState.schedule && finalState.dashboard && finalState.superAdmin;
      if (allRegistered) {
        console.log('🎉 Все контексты успешно зарегистрированы!');
        console.log('💡 Попробуйте: fitAccessDebug.help()');
      } else {
        console.warn('⚠️ Не все контексты зарегистрированы:', {
          missing: {
            schedule: !finalState.schedule,
            dashboard: !finalState.dashboard,
            superAdmin: !finalState.superAdmin
          }
        });
      }
    }
  }, [schedule, dashboard, superAdmin]);

  return null; // Невидимый компонент
}
