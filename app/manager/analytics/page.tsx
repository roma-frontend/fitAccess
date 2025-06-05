// app/manager/analytics/page.tsx (финальная версия)
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import { AnalyticsErrorBoundary } from '@/components/manager/analytics/AnalyticsErrorBoundary';
import AnalyticsContent from '@/components/manager/analytics/AnalyticsContent';

export default function ManagerAnalytics() {
  return (
    <ProtectedRoute allowedRoles={['manager', 'admin', 'super-admin']} redirectTo="/staff-login">
      <ManagerProvider>
        <AnalyticsProvider>
          <AnalyticsErrorBoundary>
            <div className="min-h-screen bg-gray-50">
              <ManagerHeader />
              <AnalyticsContent />
            </div>
          </AnalyticsErrorBoundary>
        </AnalyticsProvider>
      </ManagerProvider>
    </ProtectedRoute>
  );
}
