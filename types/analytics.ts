export interface UserStats {
  total: number;
  active: number;
  activityRate: number;
  newInPeriod: number;
  byRole: Record<string, { count: number; active: number }>;
  registrationTrend: Array<{ date: string; count: number }>;
}

export interface ProductStats {
  total: number;
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

export interface RevenueStats {
  total: number;
  growth: number;
  ordersCount: number;
  averageOrderValue: number;
  dailyTrend: Array<{ date: string; amount: number }>;
  topProducts: Array<{ name: string; revenue: number }>;
}

export interface ActivityStats {
  totalSessions: number;
  averageSessionTime: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
}

export interface AnalyticsData {
  users: UserStats;
  products: ProductStats;
  revenue: RevenueStats;
  activity: ActivityStats;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type AnalyticsTab = 'overview' | 'users' | 'products' | 'activity';

// Интерфейсы для компонентов
export interface BaseComponentProps {
  loading?: boolean;
}

export interface MetricsOverviewProps extends BaseComponentProps {
  userStats: UserStats | undefined;
  productStats: ProductStats | undefined;
  revenueStats: RevenueStats | undefined;
}

export interface ActivityTabProps extends BaseComponentProps {
  analytics: AnalyticsData | undefined;
  userStats: UserStats | undefined;
}

export interface ProductsTabProps extends BaseComponentProps {
  productStats: ProductStats | undefined;
}

export interface UsersTabProps extends BaseComponentProps {
  userStats: UserStats | undefined;
}

export interface OverviewTabProps extends BaseComponentProps {
  revenueStats: RevenueStats | undefined;
  analytics: AnalyticsData | undefined;
}
