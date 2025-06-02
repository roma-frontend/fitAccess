"use client";

import { useMemo } from "react";
import { 
  useUserStatsWithFallback, 
  useProductStatsWithFallback, 
  useRevenueStatsWithFallback,
  useActivityStats,
  useAnalyticsAvailability
} from "@/hooks/useAnalytics";

export function useAnalyticsData(period: string) {
  // Используем ваши рабочие хуки
  const userStats = useUserStatsWithFallback(period);
  const productStats = useProductStatsWithFallback();
  const revenueStats = useRevenueStatsWithFallback(period);
  const activityStats = useActivityStats(period);
  const { isAvailable } = useAnalyticsAvailability();

  // Проверяем загрузку - если данные undefined, значит еще загружаются
  const isLoading = userStats === undefined || productStats === undefined || 
                   revenueStats === undefined || activityStats === undefined;

  // Обрабатываем данные
  const processedData = useMemo(() => {
    if (isLoading) return null;

    // Адаптируем данные под ожидаемую структуру
    return {
      users: {
        total: userStats?.total || 0,
        active: userStats?.active || 0,
        activityRate: userStats?.activityRate || 0,
        newInPeriod: userStats?.newInPeriod || 0,
        byRole: userStats?.byRole || {},
        registrationTrend: [] // Добавим если нужно
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
        topProducts: revenueStats?.topProducts || []
      },
      activity: {
        totalSessions: activityStats?.totalSessions || 0,
        averageSessionTime: activityStats?.averageSessionTime || 0,
        pageViews: activityStats?.pageViews || 0,
        bounceRate: activityStats?.bounceRate || 0,
        topPages: activityStats?.topPages || []
      }
    };
  }, [userStats, productStats, revenueStats, activityStats, isLoading]);

  return {
    data: processedData,
    loading: isLoading,
    users: userStats,
    products: productStats,
    revenue: revenueStats,
    activity: activityStats,
    isAvailable
  };
}
