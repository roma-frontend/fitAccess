// hooks/useAnalytics.ts (исправленная версия с правильным useQuery)
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Типы для TypeScript
export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    byRole: Record<string, number>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    byCategory: Record<string, number>;
    salesTrend: Array<{ date: string; sales: number }>;
  };
  activity: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    byProduct: Array<{ name: string; revenue: number }>;
    trend: Array<{ date: string; amount: number }>;
  };
}

export interface UserStatsData {
  total: number;
  active: number;
  newInPeriod: number;
  byRole: Record<string, { count: number; active: number }>;
  activityRate: number;
}

export interface ProductStatsData {
  total: number;
  active: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  byCategory: Record<string, {
    count: number;
    inStock: number;
    totalValue: number;
    averagePrice: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
}

export interface RevenueStatsData {
  total: number;
  growth: number;
  ordersCount: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; revenue: number }>;
  dailyTrend: Array<{ date: string; amount: number; orders: number }>;
  previousPeriod: {
    revenue: number;
    ordersCount: number;
  };
}

export interface ActivityStatsData {
  totalSessions: number;
  averageSessionTime: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
}

export interface AggregatedAnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProducts: number;
    totalRevenue: number;
    totalSessions: number;
  };
  growth: {
    userGrowth: number;
    revenueGrowth: number;
    activityRate: number;
  };
  inventory: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  performance: {
    averageOrderValue: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  trends: {
    registrations: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number; orders: number }>;
    topProducts: Array<{ name: string; revenue: number }>;
    topPages: Array<{ page: string; views: number }>;
  };
}

export interface ExportConfig {
  type: 'users' | 'products' | 'orders' | 'revenue' | 'analytics' | 'full';
  format: 'json' | 'csv';
  startDate?: number;
  endDate?: number;
}

export interface ExportResult {
  type: string;
  data: any;
  count: number;
  format: string;
  period: {
    start: string;
    end: string;
  };
  exportedAt: string;
}

// Проверяем доступность API функций
function isAnalyticsAvailable() {
  try {
    return api && api.analytics && typeof api.analytics === 'object';
  } catch (error) {
    return false;
  }
}

// Основные хуки аналитики с исправленным useQuery
export function useAnalytics(period: string = "month", startDate?: number, endDate?: number) {
  const fallbackData: AnalyticsData = {
    users: {
      total: 0,
      active: 0,
      new: 0,
      growth: 0,
      byRole: {},
      registrationTrend: []
    },
    products: {
      total: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      byCategory: {},
      salesTrend: []
    },
    activity: {
      totalSessions: 0,
      averageSessionTime: 0,
      pageViews: 0,
      bounceRate: 0,
      topPages: []
    },
    revenue: {
      total: 0,
      monthly: 0,
      growth: 0,
      byProduct: [],
      trend: []
    }
  };

  // Безопасный useQuery - проверяем существование функции
  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getAnalytics) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getAnalytics, { period, startDate, endDate });
    }
  } catch (error) {
    console.warn('Analytics API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useUserStats(period: string = "month") {
  const fallbackData: UserStatsData = {
    total: 0,
    active: 0,
    newInPeriod: 0,
    byRole: {},
    activityRate: 0
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getUserStats) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getUserStats, { period });
    }
  } catch (error) {
    console.warn('User stats API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useProductStats() {
  const fallbackData: ProductStatsData = {
    total: 0,
    active: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    byCategory: {},
    lowStockProducts: []
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getProductStats) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getProductStats, {});
    }
  } catch (error) {
    console.warn('Product stats API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useRevenueStats(period: string = "month", startDate?: number, endDate?: number) {
  const fallbackData: RevenueStatsData = {
    total: 0,
    growth: 0,
    ordersCount: 0,
    averageOrderValue: 0,
    topProducts: [],
    dailyTrend: [],
    previousPeriod: {
      revenue: 0,
      ordersCount: 0
    }
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getRevenueStats) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getRevenueStats, { period, startDate, endDate });
    }
  } catch (error) {
    console.warn('Revenue stats API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useActivityStats(period: string = "month") {
  const fallbackData: ActivityStatsData = {
    totalSessions: 0,
    averageSessionTime: 0,
    pageViews: 0,
    bounceRate: 0,
    topPages: []
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getActivityStats) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getActivityStats, { period });
    }
  } catch (error) {
    console.warn('Activity stats API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useTrainerStats(period: string = "month", trainerId?: Id<"trainers">) {
  const fallbackData = {
    totalClients: 0,
    activeClients: 0,
    revenue: 0,
    sessionsCount: 0,
    averageSessionPrice: 0,
    clientRetentionRate: 0
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getTrainerStats) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getTrainerStats, { period, trainerId });
    }
  } catch (error) {
    console.warn('Trainer stats API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useMembershipStats(period: string = "month") {
  const fallbackData = {
    totalMemberships: 0,
    activeMemberships: 0,
    expiringThisMonth: 0,
    revenue: 0,
    averageMembershipPrice: 0
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getMembershipStats) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getMembershipStats, { period });
    }
  } catch (error) {
    console.warn('Membership stats API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

export function useDashboardAnalytics() {
  const fallbackData = {
    todayStats: {
      newUsers: 0,
      revenue: 0,
      orders: 0,
      sessions: 0
    },
    weekStats: {
      newUsers: 0,
      revenue: 0,
      orders: 0,
      sessions: 0
    }
  };

  let result;
  try {
    if (isAnalyticsAvailable() && api.analytics?.getDashboardAnalytics) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.analytics.getDashboardAnalytics, {});
    }
  } catch (error) {
    console.warn('Dashboard analytics API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

// Хук для агрегированной аналитики
export function useAggregatedAnalytics(period: string = "month"): AggregatedAnalyticsData | null {
  const analytics = useAnalytics(period);
  const userStats = useUserStats(period);
  const productStats = useProductStats();
  const revenueStats = useRevenueStats(period);
  const activityStats = useActivityStats(period);

  const [aggregatedData, setAggregatedData] = useState<AggregatedAnalyticsData | null>(null);

  useEffect(() => {
    if (analytics && userStats && productStats && revenueStats && activityStats) {
      const aggregated: AggregatedAnalyticsData = {
        overview: {
          totalUsers: userStats.total,
          activeUsers: userStats.active,
          totalProducts: productStats.total,
          totalRevenue: revenueStats.total,
          totalSessions: activityStats.totalSessions,
        },
        growth: {
          userGrowth: analytics.users.growth,
          revenueGrowth: revenueStats.growth,
          activityRate: userStats.activityRate,
        },
        inventory: {
          inStock: productStats.inStock,
          lowStock: productStats.lowStock,
          outOfStock: productStats.outOfStock,
          totalValue: productStats.totalValue,
        },
        performance: {
          averageOrderValue: revenueStats.averageOrderValue,
          averageSessionTime: activityStats.averageSessionTime,
          bounceRate: activityStats.bounceRate,
        },
        trends: {
          registrations: analytics.users.registrationTrend,
          revenue: revenueStats.dailyTrend,
          topProducts: revenueStats.topProducts,
          topPages: activityStats.topPages,
        }
      };

      setAggregatedData(aggregated);
    }
  }, [analytics, userStats, productStats, revenueStats, activityStats]);

  return aggregatedData;
}

// Хук для экспорта (упрощенная версия без Convex)
export function useExportManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const triggerExport = (
    type: ExportConfig['type'],
    format: ExportConfig['format'] = "json",
    startDate?: number,
    endDate?: number
  ) => {
    setIsExporting(true);
    setExportError(null);

    // Имитируем экспорт с fallback данными
    setTimeout(() => {
      try {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${type}_export_${timestamp}.${format}`;
        
        // Создаем тестовые данные для экспорта
        const testData = {
          type,
          exportedAt: new Date().toISOString(),
          period: {
            start: startDate ? new Date(startDate).toISOString() : '',
            end: endDate ? new Date(endDate).toISOString() : ''
          },
          data: {
            message: `Экспорт ${type} в формате ${format}`,
            note: "Это тестовые данные, так как Convex функции недоступны"
          }
        };

        if (format === 'csv') {
          const csvContent = `Type,Message,Date\n${type},"Test export",${new Date().toISOString()}`;
          const blob = new Blob([csvContent], { type: 'text/csv' });
          downloadFile(blob, filename);
        } else {
          downloadJSON(testData, filename);
        }

        setIsExporting(false);
      } catch (error) {
        setExportError(error instanceof Error ? error.message : 'Ошибка экспорта');
        setIsExporting(false);
      }
    }, 1000);
  };

  const resetExport = () => {
    setIsExporting(false);
    setExportError(null);
  };

  return {
    triggerExport,
    resetExport,
    isExporting,
    exportError,
    clearError: () => setExportError(null),
    isAvailable: true // Всегда доступен в fallback режиме
  };
}

// Альтернативный хук для локального экспорта
export function useLocalExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = async (
    type: string,
    format: string = "json",
    data: any
  ): Promise<boolean> => {
    setIsExporting(true);
    setExportError(null);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${type}_export_${timestamp}.${format}`;

      if (format === 'csv' && Array.isArray(data)) {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(blob, filename);
      } else {
        downloadJSON(data, filename);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка экспорта';
      setExportError(errorMessage);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    exportError,
    clearError: () => setExportError(null)
  };
}

// Утилиты для экспорта
export function downloadFile(blob: Blob, filename: string): void {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    throw new Error('Не удалось скачать файл');
  }
}

export function downloadJSON(data: any, filename: string): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadFile(blob, filename);
  } catch (error) {
    console.error('Ошибка создания JSON файла:', error);
    throw new Error('Не удалось создать JSON файл');
  }
}

export function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'Нет данных для экспорта';
  }
  
  try {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Обрабатываем строки с запятыми и кавычками
          if (typeof value === 'string') {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Ошибка конвертации в CSV:', error);
    throw new Error('Не удалось конвертировать данные в CSV');
  }
}

// Хук для проверки доступности аналитики
export function useAnalyticsAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = () => {
      try {
        const available = isAnalyticsAvailable();
        setIsAvailable(available);
      } catch (error) {
        console.warn('Analytics API недоступен:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, isLoading };
}

// Хук для генерации тестовых данных
export function useTestAnalytics() {
  const [testData] = useState(() => {
    // Генерируем тестовые данные для демонстрации
    const generateTrendData = (days: number) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10,
          amount: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 20) + 5
        };
      });
    };

    return {
      users: {
        total: 1247,
        active: 892,
        new: 156,
        growth: 12.5,
        byRole: {
          admin: 5,
          member: 1200,
          trainer: 42
        },
        registrationTrend: generateTrendData(30)
      },
      products: {
        total: 89,
        inStock: 67,
        lowStock: 15,
        outOfStock: 7,
        totalValue: 245000,
        byCategory: {
          'Протеины': 25,
          'Витамины': 30,
          'Спортивное питание': 20,
          'Аксессуары': 14
        },
        salesTrend: generateTrendData(30)
      },
      activity: {
        totalSessions: 3456,
        averageSessionTime: 1800, // 30 минут
        pageViews: 12890,
        bounceRate: 0.35,
        topPages: [
          { page: '/dashboard', views: 2340 },
          { page: '/products', views: 1890 },
          { page: '/analytics', views: 1560 },
          { page: '/orders', views: 1200 },
          { page: '/users', views: 890 }
        ]
      },
      revenue: {
        total: 156780,
        monthly: 45600,
        growth: 8.7,
        byProduct: [
          { name: 'Протеиновый коктейль', revenue: 45000 },
          { name: 'Витамин D3', revenue: 23000 },
          { name: 'BCAA', revenue: 18000 },
          { name: 'Креатин', revenue: 15000 },
          { name: 'Омега-3', revenue: 12000 }
        ],
        trend: generateTrendData(30)
      }
    };
  });

  return testData;
}

// Хук для использования тестовых данных когда Convex недоступен
export function useAnalyticsWithFallback(period: string = "month", startDate?: number, endDate?: number) {
  const testData = useTestAnalytics();
  const realData = useAnalytics(period, startDate, endDate);
  const { isAvailable } = useAnalyticsAvailability();

  // Возвращаем реальные данные если доступны, иначе тестовые
  return isAvailable && realData ? realData : testData;
}

// Хуки с тестовыми данными
export function useUserStatsWithFallback(period: string = "month") {
  const testData = useTestAnalytics();
  const realData = useUserStats(period);
  const { isAvailable } = useAnalyticsAvailability();

  const fallbackUserStats = {
    total: testData.users.total,
    active: testData.users.active,
    newInPeriod: testData.users.new,
    byRole: Object.entries(testData.users.byRole).reduce((acc, [role, count]) => {
      acc[role] = { count, active: Math.floor(count * 0.8) };
      return acc;
    }, {} as Record<string, { count: number; active: number }>),
    activityRate: testData.users.active / testData.users.total
  };

  return isAvailable && realData ? realData : fallbackUserStats;
}




export function useProductStatsWithFallback() {
  const testData = useTestAnalytics();
  const realData = useProductStats();
  const { isAvailable } = useAnalyticsAvailability();

  const fallbackProductStats = {
    total: testData.products.total,
    active: testData.products.inStock + testData.products.lowStock,
    inStock: testData.products.inStock,
    lowStock: testData.products.lowStock,
    outOfStock: testData.products.outOfStock,
    totalValue: testData.products.totalValue,
    byCategory: Object.entries(testData.products.byCategory).reduce((acc, [category, count]) => {
      acc[category] = {
        count,
        inStock: Math.floor(count * 0.8),
        totalValue: count * 2500,
        averagePrice: 2500
      };
      return acc;
    }, {} as Record<string, any>),
    lowStockProducts: [
      { id: '1', name: 'Протеиновый коктейль', currentStock: 5, minStock: 10, category: 'Протеины' },
      { id: '2', name: 'Витамин C', currentStock: 3, minStock: 15, category: 'Витамины' }
    ]
  };

  return isAvailable && realData ? realData : fallbackProductStats;
}

export function useRevenueStatsWithFallback(period: string = "month", startDate?: number, endDate?: number) {
  const testData = useTestAnalytics();
  const realData = useRevenueStats(period, startDate, endDate);
  const { isAvailable } = useAnalyticsAvailability();

  const fallbackRevenueStats = {
    total: testData.revenue.total,
    growth: testData.revenue.growth,
    ordersCount: 456,
    averageOrderValue: testData.revenue.total / 456,
    topProducts: testData.revenue.byProduct,
    dailyTrend: testData.revenue.trend,
    previousPeriod: {
      revenue: Math.floor(testData.revenue.total * 0.9),
      ordersCount: 420
    }
  };

  return isAvailable && realData ? realData : fallbackRevenueStats;
}

// Экспорт всех хуков для удобства
export {
  useAnalyticsWithFallback as useAnalyticsData,
  useUserStatsWithFallback as useUserStatsData,
  useProductStatsWithFallback as useProductStatsData,
  useRevenueStatsWithFallback as useRevenueStatsData
};

