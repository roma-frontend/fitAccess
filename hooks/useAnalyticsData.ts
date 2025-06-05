// hooks/useAnalyticsData.ts (обновленная версия)
"use client";

import { useMemo } from "react";
import { 
  useUserStatsWithFallback, 
  useProductStatsWithFallback, 
  useRevenueStatsWithFallback,
  useActivityStats,
  useAnalyticsAvailability
} from "@/hooks/useAnalytics";
import { useAnalyticsCache } from "@/hooks/useAnalyticsCache";
import { 
  fetchTrainerStats,
  fetchBookingStats,
  fetchSatisfactionStats,
  fetchPeakHoursStats,
  fetchPerformanceMetrics
} from "@/services/analyticsService";

export function useAnalyticsData(period: string) {
  // Ваши существующие хуки
  const userStats = useUserStatsWithFallback(period);
  const productStats = useProductStatsWithFallback();
  const revenueStats = useRevenueStatsWithFallback(period);
  const activityStats = useActivityStats(period);
  const { isAvailable } = useAnalyticsAvailability();

  // Кэшированные фитнес-данные
  const { data: trainerStats, loading: trainersLoading } = useAnalyticsCache(
    'trainers', fetchTrainerStats, period
  );
  const { data: bookingStats, loading: bookingsLoading } = useAnalyticsCache(
    'bookings', fetchBookingStats, period
  );
  const { data: satisfactionStats, loading: satisfactionLoading } = useAnalyticsCache(
    'satisfaction', fetchSatisfactionStats, period
  );
  const { data: peakHoursStats, loading: peakHoursLoading } = useAnalyticsCache(
    'peakHours', fetchPeakHoursStats, period
  );
  const { data: performanceMetrics, loading: performanceLoading } = useAnalyticsCache(
    'performance', fetchPerformanceMetrics, period
  );

  // Проверяем загрузку всех данных
  const isLoading = userStats === undefined || productStats === undefined || 
                   revenueStats === undefined || activityStats === undefined ||
                   trainersLoading || bookingsLoading || satisfactionLoading ||
                   peakHoursLoading || performanceLoading;

  // Обрабатываем данные с мемоизацией
  const processedData = useMemo(() => {
    if (isLoading) return null;

    return {
      // Существующие данные
      users: {
        total: userStats?.total || 0,
        active: userStats?.active || 0,
        activityRate: userStats?.activityRate || 0,
        newInPeriod: userStats?.newInPeriod || 0,
        byRole: userStats?.byRole || {},
        registrationTrend: userStats?.registrationTrend || []
      },
      products: {
        total: productStats?.total || 0,
        inStock: productStats?.inStock || 0,
        lowStock: productStats?.lowStock || 0,
        outOfStock: productStats?.outOfStock || 0,
        totalValue: productStats?.totalValue || 0,
        byCategory: productStats?.byCategory || {},
        lowStockProducts: productStats?.lowStockProducts || []
      },
      revenue: {
        total: revenueStats?.total || 0,
        growth: revenueStats?.growth || 0,
        ordersCount: revenueStats?.ordersCount || 0,
        averageOrderValue: revenueStats?.averageOrderValue || 0,
        dailyTrend: revenueStats?.dailyTrend || [],
        topProducts: revenueStats?.topProducts || [],
        current: revenueStats?.total || 0,
        previous: revenueStats?.previous || 0
      },
      activity: {
        totalSessions: activityStats?.totalSessions || 0,
        averageSessionTime: activityStats?.averageSessionTime || 0,
        pageViews: activityStats?.pageViews || 0,
        bounceRate: activityStats?.bounceRate || 0,
        topPages: activityStats?.topPages || []
      },
      
      // Фитнес-данные
      bookings: {
        current: bookingStats?.current || 0,
        previous: bookingStats?.previous || 0,
        growth: bookingStats?.growth || 0,
        cancellationRate: bookingStats?.cancellationRate || 0,
        repeatBookings: bookingStats?.repeatBookings || 0,
        monthlyData: bookingStats?.monthlyData || []
      },
      newClients: {
        current: userStats?.newInPeriod || 0,
        previous: userStats?.previousPeriodNew || 0,
        growth: userStats?.newClientsGrowth || 0
      },
      satisfaction: {
        current: satisfactionStats?.current || 0,
        previous: satisfactionStats?.previous || 0,
        growth: satisfactionStats?.growth || 0,
        averageRating: satisfactionStats?.averageRating || 0
      },
      trainers: {
        topTrainers: trainerStats?.topTrainers || [],
        totalTrainers: trainerStats?.total || 0,
        averageRating: trainerStats?.averageRating || 0,
        totalEarnings: trainerStats?.totalEarnings || 0
      },
      performance: {
        averageLoad: performanceMetrics?.averageLoad || 0,
        planCompletion: performanceMetrics?.planCompletion || 0,
        clientRetention: performanceMetrics?.clientRetention || 0
      },
      peakHours: {
        timeSlots: peakHoursStats?.timeSlots || [],
        busiestHour: peakHoursStats?.busiestHour || '',
        averageLoad: peakHoursStats?.averageLoad || 0
      },
      additionalStats: {
        averageCheck: revenueStats?.averageOrderValue || 0,
        cancellationRate: bookingStats?.cancellationRate || 0,
        responseTime: performanceMetrics?.responseTime || '0ч',
        repeatBookings: bookingStats?.repeatBookings || 0
      }
    };
  }, [
    userStats, productStats, revenueStats, activityStats, 
    trainerStats, bookingStats, satisfactionStats, 
    peakHoursStats, performanceMetrics, isLoading
  ]);

  return {
    data: processedData,
    loading: isLoading,
    users: userStats,
    products: productStats,
    revenue: revenueStats,
    activity: activityStats,
    trainers: trainerStats,
    bookings: bookingStats,
    satisfaction: satisfactionStats,
    peakHours: peakHoursStats,
    performance: performanceMetrics,
    isAvailable,
    // Методы для управления кэшем
    refreshAll: () => {
      // Здесь можно добавить логику обновления всех данных
    }
  };
}
