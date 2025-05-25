// components/admin/analytics/MetricsGrid.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  Activity,
  Eye,
  Clock
} from "lucide-react";
import { AnalyticsData } from "./types";

interface MetricsGridProps {
  data: AnalyticsData;
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      title: "Всего пользователей",
      value: data.users.total.toLocaleString(),
      change: data.users.growth,
      trend: data.users.growth > 0 ? 'up' : data.users.growth < 0 ? 'down' : 'neutral',
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Активные пользователи",
      value: data.users.active.toLocaleString(),
      change: 12.5,
      trend: 'up' as const,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Продуктов в каталоге",
      value: data.products.total,
      change: 8.3,
      trend: 'up' as const,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Общая выручка",
      value: `${data.revenue.total.toLocaleString()} ₽`,
      change: data.revenue.growth,
      trend: data.revenue.growth > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    {
      title: "Просмотры страниц",
      value: data.activity.pageViews.toLocaleString(),
      change: 15.2,
      trend: 'up' as const,
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Среднее время сессии",
      value: `${Math.round(data.activity.averageSessionTime / 60)}м`,
      change: -2.1,
      trend: 'down' as const,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.title} className={`${metric.bgColor} ${metric.borderColor} border-l-4`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color} mb-2`}>{metric.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-4 w-4 ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-sm text-gray-500">за месяц</span>
                  </div>
                </div>
                <Icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
