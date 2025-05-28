// components/debug/ContextRegistrar.tsx (исправленная версия)
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
      
      // ✅ ПРИНУДИТЕЛЬНО РЕГИСТРИРУЕМ DASHBOARD (ИСПРАВЛЕНО)
      if (dashboard && !window.fitAccessDebug.dashboard) {
        window.fitAccessDebug.dashboard = {
          // Основные данные
          events: dashboard.events,
          trainers: dashboard.trainers,
          clients: dashboard.clients,
          notifications: dashboard.notifications, // ✅ ДОБАВЛЕНО
          stats: dashboard.stats,
          analytics: dashboard.analytics,
          
          // Состояние
          loading: dashboard.loading,
          error: dashboard.error,
          
          // Действия (используем правильные методы)
          syncAllData: dashboard.syncAllData,
          refreshStats: dashboard.refreshStats,
          markNotificationAsRead: dashboard.markNotificationAsRead, // ✅ ПРАВИЛЬНЫЙ МЕТОД
          clearAllNotifications: dashboard.clearAllNotifications, // ✅ ПРАВИЛЬНЫЙ МЕТОД
          subscribeToUpdates: dashboard.subscribeToUpdates,
          
          // Дополнительные методы для debug
          getStats: () => ({
            totalEvents: dashboard.events.length,
            totalTrainers: dashboard.trainers.length,
            totalClients: dashboard.clients.length,
            totalNotifications: dashboard.notifications.length,
            unreadNotifications: dashboard.notifications.filter(n => !n.read).length,
            lastUpdate: new Date().toISOString()
          }),
          
          // Методы для работы с уведомлениями
          getNotificationsSummary: () => ({
            total: dashboard.notifications.length,
            unread: dashboard.notifications.filter(n => !n.read).length,
            byPriority: {
              high: dashboard.notifications.filter(n => n.priority === 'high').length,
              medium: dashboard.notifications.filter(n => n.priority === 'medium').length,
              low: dashboard.notifications.filter(n => n.priority === 'low').length
            }
          }),
          
          // Методы для аналитики
          getAnalyticsSummary: () => ({
            clientGrowthPoints: dashboard.analytics.clientGrowth.length,
            trainersTracked: dashboard.analytics.trainerPerformance.length,
            equipmentItems: dashboard.analytics.equipmentUsage.length,
            revenueStreams: dashboard.analytics.revenueByService.length
          })
        };
        
        console.log('✅ Dashboard контекст принудительно зарегистрирован');
        console.log(`📊 Dashboard: ${dashboard.events.length} событий, ${dashboard.trainers.length} тренеров, ${dashboard.clients.length} клиентов, ${dashboard.notifications.length} уведомлений`);
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
      
      // ✅ ДОБАВЛЯЕМ ГЛОБАЛЬНЫЕ HELPER ФУНКЦИИ
      if (!window.fitAccessDebug.help) {
        window.fitAccessDebug.help = () => {
          console.log(`
🔧 FitAccess Debug System - Доступные команды:

📊 ОБЩАЯ ИНФОРМАЦИЯ:
• fitAccessDebug.getOverview() - общий обзор системы
• fitAccessDebug.help() - эта справка

📅 SCHEDULE КОНТЕКСТ:
• fitAccessDebug.schedule.events - все события
• fitAccessDebug.schedule.trainers - все тренеры
• fitAccessDebug.schedule.getStats() - статистика событий
• fitAccessDebug.schedule.createEvent(data) - создать событие
• fitAccessDebug.schedule.refreshData() - обновить данные

📈 DASHBOARD КОНТЕКСТ:
• fitAccessDebug.dashboard.stats - статистика дашборда
• fitAccessDebug.dashboard.notifications - уведомления
• fitAccessDebug.dashboard.analytics - аналитика
• fitAccessDebug.dashboard.getStats() - общая статистика
• fitAccessDebug.dashboard.getNotificationsSummary() - сводка уведомлений
• fitAccessDebug.dashboard.syncAllData() - полная синхронизация

👑 SUPERADMIN КОНТЕКСТ:
• fitAccessDebug.superAdmin.trainers - все тренеры
• fitAccessDebug.superAdmin.clients - все клиенты
• fitAccessDebug.superAdmin.getStats() - статистика админки

🔄 СИНХРОНИЗАЦИЯ:
• fitAccessDebug.syncAll() - синхронизировать все контексты
• fitAccessDebug.clearAll() - очистить все данные
          `);
        };
        
        window.fitAccessDebug.getOverview = () => {
          const overview = {
            schedule: {
              registered: !!window.fitAccessDebug.schedule,
              events: window.fitAccessDebug.schedule?.events?.length || 0,
              trainers: window.fitAccessDebug.schedule?.trainers?.length || 0,
              loading: window.fitAccessDebug.schedule?.loading || false
            },
            dashboard: {
              registered: !!window.fitAccessDebug.dashboard,
              events: window.fitAccessDebug.dashboard?.events?.length || 0,
              clients: window.fitAccessDebug.dashboard?.clients?.length || 0,
              notifications: window.fitAccessDebug.dashboard?.notifications?.length || 0,
              loading: window.fitAccessDebug.dashboard?.loading || false
            },
            superAdmin: {
              registered: !!window.fitAccessDebug.superAdmin,
              trainers: window.fitAccessDebug.superAdmin?.trainers?.length || 0,
              clients: window.fitAccessDebug.superAdmin?.clients?.length || 0,
              loading: window.fitAccessDebug.superAdmin?.loading || false
            },
            timestamp: new Date().toISOString()
          };
          
          console.table(overview);
          return overview;
        };
        
        window.fitAccessDebug.syncAll = async () => {
          console.log('🔄 Синхронизация всех контекстов...');
          
          const promises = [];
          
          if (window.fitAccessDebug.schedule?.refreshData) {
            promises.push(window.fitAccessDebug.schedule.refreshData());
          }
          
          if (window.fitAccessDebug.dashboard?.syncAllData) {
            promises.push(window.fitAccessDebug.dashboard.syncAllData());
          }
          
          if (window.fitAccessDebug.superAdmin?.refreshData) {
            promises.push(window.fitAccessDebug.superAdmin.refreshData());
          }
          
          try {
            await Promise.all(promises);
            console.log('✅ Все контексты синхронизированы');
            return window.fitAccessDebug.getOverview();
          } catch (error) {
            console.error('❌ Ошибка синхронизации:', error);
            throw error;
          }
        };
        
        window.fitAccessDebug.clearAll = () => {
          console.log('🧹 Очистка всех debug данных...');
          
          if (window.fitAccessDebug.schedule?.clearAllEvents) {
            window.fitAccessDebug.schedule.clearAllEvents();
          }
          
          if (window.fitAccessDebug.dashboard?.clearAllNotifications) {
            window.fitAccessDebug.dashboard.clearAllNotifications();
          }
          
          console.log('✅ Все данные очищены');
        };
      }
      
      // ✅ ЛОГИРУЕМ ФИНАЛЬНОЕ СОСТОЯНИЕ
      const finalState = {
        schedule: !!window.fitAccessDebug.schedule,
        dashboard: !!window.fitAccessDebug.dashboard,
        superAdmin: !!window.fitAccessDebug.superAdmin,
        scheduleEvents: window.fitAccessDebug.schedule?.events?.length || 0,
        dashboardEvents: window.fitAccessDebug.dashboard?.events?.length || 0,
        dashboardNotifications: window.fitAccessDebug.dashboard?.notifications?.length || 0,
        superAdminTrainers: window.fitAccessDebug.superAdmin?.trainers?.length || 0
      };
      
      console.log('📊 Финальное состояние fitAccessDebug:', finalState);
      
      // ✅ ПРОВЕРЯЕМ ЧТО ВСЕ КОНТЕКСТЫ ЗАРЕГИСТРИРОВАНЫ
      const allRegistered = finalState.schedule && finalState.dashboard && finalState.superAdmin;
      if (allRegistered) {
        console.log('🎉 Все контексты успешно зарегистрированы!');
        console.log('💡 Попробуйте: fitAccessDebug.help()');
        console.log('📊 Обзор системы: fitAccessDebug.getOverview()');
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
