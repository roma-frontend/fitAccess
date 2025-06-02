// components/admin/users/UserAnalytics.tsx (обновленная версия)
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar, Activity, Sparkles, BarChart3 } from "lucide-react";
import { User } from "./UserCard";

interface UserAnalyticsProps {
  users: User[];
}

export function UserAnalytics({ users }: UserAnalyticsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const activePercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  // Calculate growth (mock data for demonstration)
  const lastWeekUsers = users.filter(u => 
    Date.now() - u.createdAt < 7 * 24 * 60 * 60 * 1000
  ).length;
  
  const lastMonthUsers = users.filter(u => 
    Date.now() - u.createdAt < 30 * 24 * 60 * 60 * 1000
  ).length;

  const roleDistribution = {
    'super-admin': users.filter(u => u.role === 'super-admin').length,
    'admin': users.filter(u => u.role === 'admin').length,
    'manager': users.filter(u => u.role === 'manager').length,
    'trainer': users.filter(u => u.role === 'trainer').length,
    'member': users.filter(u => u.role === 'member').length,
  };

  const analytics = [
    {
      title: "Активность пользователей",
      value: `${activePercentage.toFixed(1)}%`,
      description: `${activeUsers} из ${totalUsers} активны`,
      icon: Activity,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      trend: activePercentage > 80 ? 'up' : 'down'
    },
    {
      title: "Рост за неделю",
      value: `+${lastWeekUsers}`,
      description: "новых пользователей",
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      trend: 'up'
    },
    {
      title: "Рост за месяц",
      value: `+${lastMonthUsers}`,
      description: "новых пользователей",
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      trend: 'up'
    }
  ];

  const roleConfigs = {
    'super-admin': {
      name: 'Супер Администраторы',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100'
    },
    'admin': {
      name: 'Администраторы',
      gradient: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-100'
    },
    'manager': {
      name: 'Менеджеры',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100'
    },
    'trainer': {
      name: 'Тренеры',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100'
    },
    'member': {
      name: 'Участники',
      gradient: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-100'
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Аналитика пользователей
        </h2>
        <p className="text-gray-600">Детальная статистика и тренды активности</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analytics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={metric.title} className={`group bg-gradient-to-br ${metric.bgGradient} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden`}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${metric.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                      <div className={`relative p-3 bg-gradient-to-r ${metric.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend === 'up' ? 'Рост' : 'Снижение'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sparkle effect */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Sparkles className="h-4 w-4 text-gray-400 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Распределение по ролям
            </span>
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Анализ структуры пользователей по ролям и уровням доступа
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(roleDistribution).map(([role, count]) => {
              const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              const config = roleConfigs[role as keyof typeof roleConfigs];
              
              return (
                <div key={role} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${config.gradient} shadow-md`}></div>
                      <span className="font-semibold text-gray-900">{config.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-600 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-3 bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300" 
                    />
                    <div 
                      className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200/50 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                <div className="text-sm text-gray-600">Всего пользователей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
                <div className="text-sm text-gray-600">Активных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activePercentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Активность</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth Chart Placeholder */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Динамика роста
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-600">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">График роста пользователей</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Heatmap Placeholder */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-purple-600" />
              Карта активности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Тепловая карта активности</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

