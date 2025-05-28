// app/admin/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  ArrowLeft,
} from "lucide-react";

// Импорт компонентов
import { MetricsGrid } from "@/components/admin/analytics/MetricsGrid";
import { Charts } from "@/components/admin/analytics/Charts";
import { AnalyticsTables } from "@/components/admin/analytics/AnalyticsTables";
import { AnalyticsData } from "@/components/admin/analytics/types";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const router = useRouter()

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Имитация API запроса - замените на реальный запрос
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: AnalyticsData = {
        users: {
          total: 1234,
          active: 856,
          new: 45,
          growth: 12.5,
          byRole: {
            "super-admin": 2,
            admin: 5,
            manager: 12,
            trainer: 34,
            member: 1181,
          },
          registrationTrend: [
            { date: "2024-05-01", count: 23 },
            { date: "2024-05-02", count: 31 },
            { date: "2024-05-03", count: 28 },
            { date: "2024-05-04", count: 42 },
            { date: "2024-05-05", count: 38 },
            { date: "2024-05-06", count: 45 },
            { date: "2024-05-07", count: 52 },
          ],
        },
        products: {
          total: 156,
          inStock: 134,
          lowStock: 18,
          outOfStock: 4,
          totalValue: 2456780,
          byCategory: {
            supplements: 45,
            drinks: 38,
            snacks: 42,
            merchandise: 31,
          },
          salesTrend: [
            { date: "2024-05-01", sales: 23, revenue: 45600 },
            { date: "2024-05-02", sales: 31, revenue: 62300 },
            { date: "2024-05-03", sales: 28, revenue: 56800 },
            { date: "2024-05-04", sales: 42, revenue: 84200 },
            { date: "2024-05-05", sales: 38, revenue: 76400 },
            { date: "2024-05-06", sales: 45, revenue: 90500 },
            { date: "2024-05-07", sales: 52, revenue: 104600 },
          ],
        },
        activity: {
          totalSessions: 142,
          averageSessionTime: 1847, // в секундах
          pageViews: 15678,
          bounceRate: 23.4,
          topPages: [
            { page: "/dashboard", views: 3456 },
            { page: "/products", views: 2789 },
            { page: "/profile", views: 2134 },
            { page: "/training", views: 1876 },
            { page: "/nutrition", views: 1543 },
          ],
        },
        revenue: {
          total: 5678900,
          monthly: 456780,
          growth: 18.7,
          byProduct: [
            { name: "Протеиновый коктейль", revenue: 125600 },
            { name: "BCAA комплекс", revenue: 98400 },
            { name: "Энергетический напиток", revenue: 87300 },
            { name: "Протеиновый батончик", revenue: 76200 },
            { name: "Футболка FitAccess", revenue: 69100 },
          ],
          trend: [
            { date: "2024-05-01", amount: 45600 },
            { date: "2024-05-02", amount: 62300 },
            { date: "2024-05-03", amount: 56800 },
            { date: "2024-05-04", amount: 84200 },
            { date: "2024-05-05", amount: 76400 },
            { date: "2024-05-06", amount: 90500 },
            { date: "2024-05-07", amount: 104600 },
          ],
        },
      };

      setData(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Ошибка загрузки аналитики:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;

    // Простой экспорт в JSON
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка аналитики...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Данные недоступны
          </h3>
          <p className="text-gray-500 mb-4">
            Не удалось загрузить данные аналитики
          </p>
          <Button onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}

      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Аналитика
                  </h1>
                  <p className="text-gray-600">
                    Подробная статистика и отчеты системы
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={exportData}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Summary */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {data.users.total.toLocaleString()}
                </div>
                <div className="text-blue-100">Всего пользователей</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {data.products.total}
                </div>
                <div className="text-blue-100">Продуктов</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {(data.revenue.total / 1000000).toFixed(1)}М
                </div>
                <div className="text-blue-100">Выручка (₽)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {data.activity.totalSessions}
                </div>
                <div className="text-blue-100">Активных сессий</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Продукты
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Выручка
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <MetricsGrid data={data} />
          <Charts data={data} />
          <AnalyticsTables data={data} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Всего пользователей
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.users.total.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Активные пользователи
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.users.active.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Новые за месяц
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {data.users.new}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Registration Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика регистраций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 40}
                      x2="400"
                      y2={i * 40}
                      stroke="#f3f4f6"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={data.users.registrationTrend
                      .map((point, index) => {
                        const x =
                          (index / (data.users.registrationTrend.length - 1)) *
                          400;
                        const maxValue = Math.max(
                          ...data.users.registrationTrend.map((d) => d.count)
                        );
                        const y = 200 - (point.count / maxValue) * 180;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {/* Points */}
                  {data.users.registrationTrend.map((point, index) => {
                    const x =
                      (index / (data.users.registrationTrend.length - 1)) * 400;
                    const maxValue = Math.max(
                      ...data.users.registrationTrend.map((d) => d.count)
                    );
                    const y = 200 - (point.count / maxValue) * 180;
                    return (
                      <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" />
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* User Roles Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение по ролям</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.users.byRole).map(([role, count]) => {
                  const roleNames = {
                    "super-admin": "Супер Администраторы",
                    admin: "Администраторы",
                    manager: "Менеджеры",
                    trainer: "Тренеры",
                    member: "Участники",
                  };

                  const percentage = ((count / data.users.total) * 100).toFixed(
                    1
                  );

                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {roleNames[role as keyof typeof roleNames]}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {count}
                        </span>
                        <span className="text-sm text-gray-500 w-12">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.products.total}
                </div>
                <div className="text-sm text-gray-600">Всего продуктов</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.products.inStock}
                </div>
                <div className="text-sm text-gray-600">В наличии</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {data.products.lowStock}
                </div>
                <div className="text-sm text-gray-600">Заканчивается</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.products.outOfStock}
                </div>
                <div className="text-sm text-gray-600">Нет в наличии</div>
              </CardContent>
            </Card>
          </div>

          {/* Products by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Продукты по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.products.byCategory).map(
                  ([category, count]) => {
                    const categoryNames = {
                      supplements: "Добавки",
                      drinks: "Напитки",
                      snacks: "Снеки",
                      merchandise: "Мерч",
                    };

                    const percentage = (
                      (count / data.products.total) *
                      100
                    ).toFixed(1);

                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {
                            categoryNames[
                              category as keyof typeof categoryNames
                            ]
                          }
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">
                            {count}
                          </span>
                          <span className="text-sm text-gray-500 w-12">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Общая выручка
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {(data.revenue.total / 1000000).toFixed(1)}М ₽
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      За месяц
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.revenue.monthly.toLocaleString()} ₽
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Рост</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{data.revenue.growth}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Топ продукты по выручке</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.revenue.byProduct.map((product, index) => {
                  const maxRevenue = Math.max(
                    ...data.revenue.byProduct.map((p) => p.revenue)
                  );
                  const percentage = (
                    (product.revenue / maxRevenue) *
                    100
                  ).toFixed(1);

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-emerald-600">
                          {product.revenue.toLocaleString()} ₽
                        </div>
                        <div className="text-sm text-gray-500">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика выручки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 40}
                      x2="400"
                      y2={i * 40}
                      stroke="#f3f4f6"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Area fill */}
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <polygon
                    fill="url(#revenueGradient)"
                    points={`0,200 ${data.revenue.trend
                      .map((point, index) => {
                        const x =
                          (index / (data.revenue.trend.length - 1)) * 400;
                        const maxValue = Math.max(
                          ...data.revenue.trend.map((d) => d.amount)
                        );
                        const y = 200 - (point.amount / maxValue) * 180;
                        return `${x},${y}`;
                      })
                      .join(" ")} 400,200`}
                  />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points={data.revenue.trend
                      .map((point, index) => {
                        const x =
                          (index / (data.revenue.trend.length - 1)) * 400;
                        const maxValue = Math.max(
                          ...data.revenue.trend.map((d) => d.amount)
                        );
                        const y = 200 - (point.amount / maxValue) * 180;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {/* Points */}
                  {data.revenue.trend.map((point, index) => {
                    const x = (index / (data.revenue.trend.length - 1)) * 400;
                    const maxValue = Math.max(
                      ...data.revenue.trend.map((d) => d.amount)
                    );
                    const y = 200 - (point.amount / maxValue) * 180;
                    return (
                      <circle key={index} cx={x} cy={y} r="4" fill="#10b981" />
                    );
                  })}
                </svg>

                {/* Labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 -mb-6">
                  {data.revenue.trend.map(
                    (point, index) =>
                      index % 2 === 0 && (
                        <span key={index}>
                          {new Date(point.date).toLocaleDateString("ru", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Экспорт данных</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // CSV экспорт пользователей
                const csvData = Object.entries(data.users.byRole).map(
                  ([role, count]) => [role, count]
                );
                const csv = [["Role", "Count"], ...csvData]
                  .map((row) => row.join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "users-analytics.csv";
                link.click();
              }}
              className="justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт пользователей (CSV)
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // CSV экспорт продуктов
                const csvData = Object.entries(data.products.byCategory).map(
                  ([category, count]) => [category, count]
                );
                const csv = [["Category", "Count"], ...csvData]
                  .map((row) => row.join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "products-analytics.csv";
                link.click();
              }}
              className="justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт продуктов (CSV)
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // CSV экспорт выручки
                const csvData = data.revenue.byProduct.map((product) => [
                  product.name,
                  product.revenue,
                ]);
                const csv = [["Product", "Revenue"], ...csvData]
                  .map((row) => row.join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "revenue-analytics.csv";
                link.click();
              }}
              className="justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт выручки (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
