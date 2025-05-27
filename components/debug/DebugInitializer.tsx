// components/debug/DebugInitializer.tsx
"use client";

import { useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useManager } from '@/contexts/ManagerContext';
import { useTrainer } from '@/contexts/TrainerContext';
import { initDebugCommands } from '@/utils/debugCommands';

export default function DebugInitializer() {
  const dashboard = useDashboard();
  const schedule = useSchedule();
  const superAdmin = useSuperAdmin();
  const admin = useAdmin();
  const manager = useManager();
  const trainer = useTrainer();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Инициализируем debug команды
      const debugCommands = initDebugCommands({
        dashboard,
        schedule,
        superAdmin,
        admin,
        manager,
        trainer,
      });

      // Добавляем в глобальную область
      (window as any).fitAccessDebug = debugCommands;

      console.log('🎯 FitAccess Debug Commands инициализированы:');
      console.log('• fitAccessDebug.addEvents(count) - добавить события');
      console.log('• fitAccessDebug.checkSync() - проверить синхронизацию');
      console.log('• fitAccessDebug.refreshAll() - обновить все данные');
      console.log('• fitAccessDebug.stressTest(count) - стресс-тест');
      console.log('• fitAccessDebug.getStats() - получить статистику');
      console.log('• fitAccessDebug.clearEvents() - очистить события');

      // Показываем доступные методы в контекстах
      console.log('📋 Доступные методы Schedule:', Object.keys(schedule));
      console.log('📋 Доступные методы Dashboard:', Object.keys(dashboard));
    }
  }, [dashboard, schedule, superAdmin, admin, manager, trainer]);

  return null; // Этот компонент ничего не рендерит
}
