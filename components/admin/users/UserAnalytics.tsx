// components/admin/users/UserAnalytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar, Activity } from "lucide-react";
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
      color: "text-green-600",
      trend: activePercentage > 80 ? 'up' : 'down'
    },
    {
      title: "Рост за неделю",
      value: `+${lastWeekUsers}`,
      description: "новых пользователей",
      icon: TrendingUp,
      color: "text-blue-600",
      trend: 'up'
    },
    {
      title: "Рост за месяц",
      value: `+${lastMonthUsers}`,
      description: "новых пользователей",
      icon: Calendar,
      color: "text-purple-600",
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analytics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                    <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение по ролям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(roleDistribution).map(([role, count]) => {
              const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              const roleNames = {
                'super-admin': 'Супер Администраторы',
                'admin': 'Администраторы',
                'manager': 'Менеджеры',
                'trainer': 'Тренеры',
                'member': 'Участники'
              };
              
              return (
                <div key={role} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{roleNames[role as keyof typeof roleNames]}</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
