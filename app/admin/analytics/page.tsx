// app/analytics/page.tsx (полная версия)
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Users, 
  Package, 
  TrendingUp, 
  Activity, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { ExportDialog } from "@/components/analytics/ExportDialog";
import {
  useAnalyticsData,
  useUserStatsData,
  useProductStatsData,
  useRevenueStatsData,
  useAnalyticsAvailability,
  type UserStatsData,
  type ProductStatsData,
  type RevenueStatsData,
  type AnalyticsData
} from "@/hooks/useAnalytics";

// Типы для безопасного доступа к данным
interface SafeUserStats extends UserStatsData {
  byRole: Record<string, { count: number; active: number }>;
}

interface SafeProductStats extends ProductStatsData {
  byCategory: Record<string, { count: number; inStock: number; totalValue: number; averagePrice: number }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
}

interface SafeRevenueStats extends RevenueStatsData {
  topProducts: Array<{ name: string; revenue: number }>;
}

interface SafeAnalytics extends AnalyticsData {
  activity: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  // Используем хуки с fallback данными и приводим к безопасным типам
  const analytics = useAnalyticsData(period) as SafeAnalytics;
  const userStats = useUserStatsData(period) as SafeUserStats;
  const productStats = useProductStatsData() as SafeProductStats;
  const revenueStats = useRevenueStatsData(period) as SafeRevenueStats;
  const { isAvailable, isLoading } = useAnalyticsAvailability();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Безопасные функции для доступа к данным
  const getUserRoleEntries = (): Array<[string, { count: number; active: number }]> => {
    if (!userStats?.byRole) return [];
    return Object.entries(userStats.byRole);
  };

  const getProductCategoryEntries = (): Array<[string, { count: number; inStock: number; totalValue: number; averagePrice: number }]> => {
    if (!productStats?.byCategory) return [];
    return Object.entries(productStats.byCategory);
  };

  const getTopProducts = (): Array<{ name: string; revenue: number }> => {
    if (!revenueStats?.topProducts || !Array.isArray(revenueStats.topProducts)) return [];
    return revenueStats.topProducts.slice(0, 5);
  };

  const getLowStockProducts = (): Array<{ id: string; name: string; currentStock: number; minStock: number; category: string }> => {
    if (!productStats?.lowStockProducts || !Array.isArray(productStats.lowStockProducts)) return [];
    return productStats.lowStockProducts.slice(0, 5);
  };

  const getTopPages = (): Array<{ page: string; views: number }> => {
    if (!analytics?.activity?.topPages || !Array.isArray(analytics.activity.topPages)) return [];
    return analytics.activity.topPages;
  };

  // Функция для получения тренда регистраций
  const getRegistrationTrend = () => {
    if (!analytics?.users?.registrationTrend || !Array.isArray(analytics.users.registrationTrend)) return [];
    return analytics.users.registrationTrend.slice(-7); // Последние 7 дней
  };

  // Функция для получения тренда выручки
  const getRevenueTrend = () => {
    if (!revenueStats?.dailyTrend || !Array.isArray(revenueStats.dailyTrend)) return [];
    return revenueStats.dailyTrend.slice(-7); // Последние 7 дней
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground">
            {isAvailable ? "Данные в реальном времени" : "Демонстрационные данные"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">За день</SelectItem>
              <SelectItem value="week">За неделю</SelectItem>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="quarter">За квартал</SelectItem>
              <SelectItem value="year">За год</SelectItem>
            </SelectContent>
          </Select>
          <ExportDialog>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          </ExportDialog>
        </div>
      </div>

      {/* Предупреждение о тестовых данных */}
      {!isAvailable && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Activity className="h-5 w-5" />
              <span className="font-medium">Демонстрационный режим</span>
            </div>
            <p className="text-yellow-700 mt-1">
              Функции аналитики Convex недоступны. Показаны тестовые данные для демонстрации интерфейса.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(userStats?.total || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Активных: {(userStats?.active || 0).toLocaleString()}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant={userStats?.activityRate > 0.7 ? "default" : "secondary"} className="text-xs">
                {((userStats?.activityRate || 0) * 100).toFixed(1)}% активность
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продукты</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              В наличии: {productStats?.inStock || 0}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {(productStats?.lowStock || 0) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {productStats?.lowStock} заканчивается
                </Badge>
              )}
              {(productStats?.outOfStock || 0) > 0 && (
                <Badge variant="outline" className="text-xs">
                  <XCircle className="w-3 h-3 mr-1" />
                  {productStats?.outOfStock} нет в наличии
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₽{(revenueStats?.total || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Рост: {(revenueStats?.growth || 0) > 0 ? '+' : ''}{(revenueStats?.growth || 0).toFixed(1)}%
            </p>
            <div className="flex items-center mt-2">
              <Badge 
                variant={(revenueStats?.growth || 0) > 0 ? "default" : "secondary"} 
                className="text-xs"
              >
                {(revenueStats?.growth || 0) > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                )}
                {Math.abs(revenueStats?.growth || 0).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заказы</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats?.ordersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Средний чек: ₽{Math.round(revenueStats?.averageOrderValue || 0).toLocaleString()}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                ₽{Math.round((revenueStats?.total || 0) / (revenueStats?.ordersCount || 1)).toLocaleString()} за заказ
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Табы для детальной аналитики */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Продукты
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Активность
          </TabsTrigger>
        </TabsList>

        {/* Вкладка "Обзор" */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Топ продукты по выручке */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Топ продукты по выручке
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopProducts().map((product, index) => (
                    <div key={`${product.name}-${index}`} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        <span className="truncate">{product.name}</span>
                      </div>
                      <span className="font-medium">₽{product.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                  {getTopProducts().length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Нет данных о продажах продуктов
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Тренд регистраций */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Регистрации за неделю
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRegistrationTrend().map((item, index) => (
                                        <div key={`reg-${index}`} className="flex justify-between items-center">
                                        <span className="text-sm">{new Date(item.date).toLocaleDateString('ru-RU', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-20 bg-muted rounded-full h-2">
                                            <div 
                                              className="bg-primary h-2 rounded-full" 
                                              style={{ width: `${Math.min((item.count / 50) * 100, 100)}%` }}
                                            />
                                          </div>
                                          <span className="font-medium text-sm w-8">{item.count}</span>
                                        </div>
                                      </div>
                                    ))}
                                    {getRegistrationTrend().length === 0 && (
                                      <p className="text-muted-foreground text-center py-4">
                                        Нет данных о регистрациях
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                  
                              {/* Тренд выручки */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Выручка за неделю
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {getRevenueTrend().map((item, index) => (
                                      <div key={`revenue-${index}`} className="flex justify-between items-center">
                                        <span className="text-sm">{new Date(item.date).toLocaleDateString('ru-RU', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-20 bg-muted rounded-full h-2">
                                            <div 
                                              className="bg-green-500 h-2 rounded-full" 
                                              style={{ width: `${Math.min((item.amount / 10000) * 100, 100)}%` }}
                                            />
                                          </div>
                                          <span className="font-medium text-sm">₽{item.amount.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                    {getRevenueTrend().length === 0 && (
                                      <p className="text-muted-foreground text-center py-4">
                                        Нет данных о выручке
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                  
                              {/* Товары с низкими остатками */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    Низкие остатки
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {getLowStockProducts().length > 0 ? (
                                    <div className="space-y-3">
                                      {getLowStockProducts().map((product) => (
                                        <div key={product.id} className="flex justify-between items-center">
                                          <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-xs text-muted-foreground">{product.category}</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-red-600 font-medium">{product.currentStock}</div>
                                            <div className="text-xs text-muted-foreground">
                                              Мин: {product.minStock}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4">
                                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                      <p className="text-muted-foreground">
                                        Все товары в достаточном количестве
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                  
                          {/* Вкладка "Пользователи" */}
                          <TabsContent value="users" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Пользователи по ролям */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Пользователи по ролям
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {getUserRoleEntries().map(([role, data]) => (
                                      <div key={role} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="capitalize font-medium">{role}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {data.count} пользователей
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-xs">
                                            <span>Активных: {data.active}</span>
                                            <span>{((data.active / data.count) * 100).toFixed(1)}%</span>
                                          </div>
                                          <div className="w-full bg-muted rounded-full h-2">
                                            <div 
                                              className="bg-primary h-2 rounded-full" 
                                              style={{ width: `${(data.active / data.count) * 100}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {getUserRoleEntries().length === 0 && (
                                      <p className="text-muted-foreground text-center py-4">
                                        Нет данных о ролях пользователей
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                  
                              {/* Статистика пользователей */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Статистика пользователей
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">Всего пользователей</span>
                                      </div>
                                      <span className="text-xl font-bold">{userStats?.total || 0}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="font-medium">Активные</span>
                                      </div>
                                      <span className="text-xl font-bold text-green-600">{userStats?.active || 0}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-purple-500" />
                                        <span className="font-medium">Новые за период</span>
                                      </div>
                                      <span className="text-xl font-bold text-purple-600">{userStats?.newInPeriod || 0}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-orange-500" />
                                        <span className="font-medium">Уровень активности</span>
                                      </div>
                                      <span className="text-xl font-bold text-orange-600">
                                        {((userStats?.activityRate || 0) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                  
                          {/* Вкладка "Продукты" */}
                          <TabsContent value="products" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Товары по категориям */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Товары по категориям
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {getProductCategoryEntries().map(([category, data]) => (
                                      <div key={category} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">{category}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {data.count} товаров
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                          <div className="flex justify-between">
                                            <span>В наличии:</span>
                                            <span className="font-medium text-green-600">{data.inStock}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Стоимость:</span>
                                            <span className="font-medium">₽{data.totalValue.toLocaleString()}</span>
                                          </div>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                          <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${(data.inStock / data.count) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    {getProductCategoryEntries().length === 0 && (
                                      <p className="text-muted-foreground text-center py-4">
                                        Нет данных о категориях товаров
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                  
                              {/* Статистика склада */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Статистика склада
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{productStats?.inStock || 0}</div>
                                        <div className="text-sm text-green-700">В наличии</div>
                                      </div>
                                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">{productStats?.lowStock || 0}</div>
                                        <div className="text-sm text-yellow-700">Заканчивается</div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{productStats?.outOfStock || 0}</div>
                                        <div className="text-sm text-red-700">Нет в наличии</div>
                                      </div>
                                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{productStats?.total || 0}</div>
                                        <div className="text-sm text-blue-700">Всего товаров</div>
                                      </div>
                                    </div>
                                    
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">Общая стоимость склада</span>
                                        <span className="text-xl font-bold">
                                          ₽{(productStats?.totalValue || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                  
                              {/* Детальный список товаров с низкими остатками */}
                              <Card className="lg:col-span-2">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    Требуют пополнения
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {getLowStockProducts().length > 0 ? (
                                    <div className="space-y-3">
                                      {getLowStockProducts().map((product) => (
                                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                          <div className="flex-1">
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">{product.category}</div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="text-center">
                                              <div className="text-sm text-muted-foreground">Текущий остаток</div>
                                              <div className="text-lg font-bold text-red-600">{product.currentStock}</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-sm text-muted-foreground">Минимум</div>
                                              <div className="text-lg font-bold">{product.minStock}</div>
                                            </div>
                                            <Badge variant="destructive">
                                              Критично
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                      <h3 className="text-lg font-medium mb-2">Все товары в достатке</h3>
                                      <p className="text-muted-foreground">
                      На складе достаточно товаров. Пополнение не требуется.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка "Активность" */}
        <TabsContent value="activity" className="space-y-6">
          {/* Статистика активности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Активность пользователей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{analytics?.activity?.totalSessions || 0}</div>
                  <div className="text-sm text-blue-700 mt-1">Всего сессий</div>
                  <div className="text-xs text-muted-foreground mt-1">За выбранный период</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((analytics?.activity?.averageSessionTime || 0) / 60)}м
                  </div>
                  <div className="text-sm text-green-700 mt-1">Средняя сессия</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((analytics?.activity?.averageSessionTime || 0) % 60)}с
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{analytics?.activity?.pageViews || 0}</div>
                  <div className="text-sm text-purple-700 mt-1">Просмотры страниц</div>
                  <div className="text-xs text-muted-foreground mt-1">Уникальные просмотры</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {((analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-700 mt-1">Показатель отказов</div>
                  <div className="text-xs text-muted-foreground mt-1">Покинули сразу</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Популярные страницы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Популярные страницы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopPages().map((page, index) => (
                    <div key={`${page.page}-${index}`} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <span className="font-mono text-sm">{page.page}</span>
                        </div>
                        <span className="font-medium">{page.views.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((page.views / Math.max(...getTopPages().map(p => p.views))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((page.views / (analytics?.activity?.pageViews || 1)) * 100).toFixed(1)}% от всех просмотров
                      </div>
                    </div>
                  ))}
                  {getTopPages().length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Нет данных о посещениях страниц
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Метрики производительности */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Метрики производительности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Время на сайте</span>
                      <span className="text-lg font-bold">
                        {Math.floor((analytics?.activity?.averageSessionTime || 0) / 60)}:
                        {String(Math.round((analytics?.activity?.averageSessionTime || 0) % 60)).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(((analytics?.activity?.averageSessionTime || 0) / 3600) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Среднее время сессии
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Вовлеченность</span>
                      <span className="text-lg font-bold">
                        {(100 - (analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${100 - (analytics?.activity?.bounceRate || 0) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Пользователи взаимодействуют с сайтом
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Страниц за сессию</span>
                      <span className="text-lg font-bold">
                        {((analytics?.activity?.pageViews || 0) / (analytics?.activity?.totalSessions || 1)).toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(((analytics?.activity?.pageViews || 0) / (analytics?.activity?.totalSessions || 1)) * 20, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Среднее количество просмотренных страниц
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Возвращаемость</span>
                      <span className="text-lg font-bold">
                        {((userStats?.active || 0) / (userStats?.total || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(userStats?.active || 0) / (userStats?.total || 1) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Активные из всех зарегистрированных
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Детальная статистика по времени */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Активность по времени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Пиковые часы</h4>
                  <div className="space-y-2">
                    {['10:00-12:00', '14:00-16:00', '19:00-21:00'].map((time, index) => (
                      <div key={time} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{time}</span>
                        <Badge variant="outline">
                          {Math.round(Math.random() * 30 + 20)}% активности
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Популярные дни</h4>
                  <div className="space-y-2">
                    {['Понедельник', 'Среда', 'Пятница'].map((day, index) => (
                      <div key={day} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{day}</span>
                        <Badge variant="outline">
                          {Math.round(Math.random() * 25 + 15)}% посещений
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Устройства</h4>
                  <div className="space-y-2">
                    {[
                      { device: 'Desktop', percent: 45 },
                      { device: 'Mobile', percent: 35 },
                      { device: 'Tablet', percent: 20 }
                    ].map((item) => (
                      <div key={item.device} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{item.device}</span>
                        <Badge variant="outline">
                          {item.percent}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Дополнительные быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Экспорт отчета</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Настроить период</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Уведомления</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Детальный отчет</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Сводка и рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Сводка и рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Положительные тенденции</h4>
              <div className="space-y-2">
                {(revenueStats?.growth || 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Рост выручки на {(revenueStats?.growth || 0).toFixed(1)}%</span>
                  </div>
                )}
                {(userStats?.activityRate || 0) > 0.7 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Высокая активность пользователей ({((userStats?.activityRate || 0) * 100).toFixed(1)}%)</span>
                  </div>
                )}
                {(productStats?.outOfStock || 0) === 0 && (
                  <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Нет товаров без остатков на складе</span>
                  </div>
                )}
                {(analytics?.activity?.bounceRate || 0) < 0.4 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Низкий показатель отказов ({((analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">Области для улучшения</h4>
              <div className="space-y-2">
                {(productStats?.lowStock || 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Пополнить {productStats?.lowStock} товаров с низкими остатками</span>
                  </div>
                )}
                {(revenueStats?.growth || 0) < 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Снижение выручки на {Math.abs(revenueStats?.growth || 0).toFixed(1)}%</span>
                  </div>
                )}
                {(userStats?.activityRate || 0) < 0.5 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Низкая активность пользователей ({((userStats?.activityRate || 0) * 100).toFixed(1)}%)</span>
                  </div>
                )}
                {(analytics?.activity?.bounceRate || 0) > 0.6 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Высокий показатель отказов ({((analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Рекомендации</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Настройте автоматические уведомления о низких остатках товаров</p>
              <p>• Проанализируйте популярные страницы для улучшения пользовательского опыта</p>
              <p>• Рассмотрите возможность персонализации контента для повышения вовлеченности</p>
              <p>• Регулярно экспортируйте данные для более глубокого анализа</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


                  
