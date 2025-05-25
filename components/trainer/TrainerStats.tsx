// components/trainer/TrainerStats.tsx (новый компонент для статистики)
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainer } from '@/contexts/TrainerContext';
import { 
  Users, 
  Activity, 
  Target, 
  Star, 
  Clock, 
  TrendingUp,
  Calendar,
  MessageSquare
} from "lucide-react";

export default function TrainerStats() {
  const { stats, clients, workouts, messages } = useTrainer();

  // Вычисляем дополнительную статистику
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = getThisWeekDates();
  
  const todayWorkouts = workouts.filter(w => w.date === today).length;
  const weekWorkouts = workouts.filter(w => thisWeek.includes(w.date)).length;
  const completedWorkouts = workouts.filter(w => w.status === 'completed').length;
  const unreadMessages = messages.filter(m => !m.read && !m.isFromTrainer).length;

  function getThisWeekDates() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Понедельник
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  const statsData = [
    {
      title: "Всего клиентов",
      value: stats.totalClients,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-100"
    },
    {
      title: "Активные клиенты", 
      value: stats.activeClients,
      icon: Activity,
      color: "from-green-500 to-green-600",
      textColor: "text-green-100"
    },
    {
      title: "Тренировок сегодня",
      value: todayWorkouts,
      icon: Target,
      color: "from-purple-500 to-purple-600", 
      textColor: "text-purple-100"
    },
    {
      title: "Рейтинг",
      value: stats.avgRating,
      icon: Star,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-100"
    },
    {
      title: "На этой неделе",
      value: weekWorkouts,
      icon: Calendar,
      color: "from-teal-500 to-teal-600",
      textColor: "text-teal-100"
    },
    {
      title: "Завершено всего",
      value: completedWorkouts,
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-100"
    },
    {
      title: "Новых сообщений",
      value: unreadMessages,
      icon: MessageSquare,
      color: "from-pink-500 to-pink-600",
      textColor: "text-pink-100"
    },
    {
      title: "Часов в неделю",
      value: Math.round(weekWorkouts * 1.2), // Примерная оценка
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      textColor: "text-amber-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${stat.color} text-white hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} text-sm font-medium`}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <IconComponent className={`h-8 w-8 ${stat.textColor.replace('text-', 'text-').replace('-100', '-200')}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
