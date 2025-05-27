// components/debug/ContextTester.tsx
"use client";

import { useEffect } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';

export default function ContextTester() {
  const schedule = useSchedule();
  const dashboard = useDashboard();
  const superAdmin = useSuperAdmin();

  useEffect(() => {
    console.log('🧪 ContextTester: проверяем контексты');
    console.log('Schedule:', {
      available: !!schedule,
      events: schedule?.events?.length || 0,
      trainers: schedule?.trainers?.length || 0,
      loading: schedule?.loading,
      error: schedule?.error
    });
    console.log('Dashboard:', {
      available: !!dashboard,
      events: dashboard?.events?.length || 0,
      trainers: dashboard?.trainers?.length || 0,
      clients: dashboard?.clients?.length || 0,
      loading: dashboard?.loading,
      error: dashboard?.error
    });
    console.log('SuperAdmin:', {
      available: !!superAdmin,
      trainers: superAdmin?.trainers?.length || 0,
      clients: superAdmin?.clients?.length || 0,
      loading: superAdmin?.loading,
      error: superAdmin?.error
    });
  }, [schedule, dashboard, superAdmin]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return null; // Невидимый компонент для тестирования
}
