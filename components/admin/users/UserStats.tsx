// components/admin/users/UserStats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Shield, Settings, Dumbbell, User, TrendingUp } from "lucide-react";
import { User as UserType } from "./UserCard";

interface UserStatsProps {
  users: UserType[];
}

export function UserStats({ users }: UserStatsProps) {
  const stats = [
    {
      title: "Супер Админы",
      count: users.filter(u => u.role === 'super-admin').length,
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Администраторы", 
      count: users.filter(u => u.role === 'admin').length,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Менеджеры",
      count: users.filter(u => u.role === 'manager').length,
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Тренеры",
      count: users.filter(u => u.role === 'trainer').length,
      icon: Dumbbell,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Участники",
      count: users.filter(u => u.role === 'member').length,
      icon: User,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    },
    {
      title: "Активные",
      count: users.filter(u => u.isActive).length,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`${stat.bgColor} ${stat.borderColor} border-l-4`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
