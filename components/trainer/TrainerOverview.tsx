// components/trainer/TrainerOverview.tsx (финальная версия с уведомлениями)
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainer } from '@/contexts/TrainerContext';
import { BarChart3, Activity, TrendingUp } from "lucide-react";
import TrainerStats from './TrainerStats';
import QuickActions from './QuickActions';
import TrainerNotifications from './TrainerNotifications';

export default function TrainerOverview() {
  const { clients, workouts, messages } = useTrainer();

  // Аналитика по дням недели
  const getWeeklyAnalytics = () => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWorkouts = workouts.filter(w => w.date === dateStr);
      const hours = dayWorkouts.reduce((sum, w) => sum + (w.duration || 60), 0) / 60;
      
      return {
        day,
        workouts: dayWorkouts.length,
        hours: Math.round(hours * 10) / 10,
        date: dateStr
      };
    });
  };

  const weeklyData = getWeeklyAnalytics();
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 1);

  // Статистика клиентов по статусам
  const clientStats = {
    active: clients.filter(c => c.status === 'active').length,
    trial: clients.filter(c => c.status === 'trial').length,
    inactive: clients.filter(c => c.status === 'inactive').length
  };

  return (
    <div className="space-y-8">
      {/* Основная статистика */}
      <TrainerStats />

      {/* Основной контент в три колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Левая колонка - Быстрые действия и сегодняшние тренировки (2/4) */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        {/* Правая колонка - Аналитика и уведомления (2/4) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Уведомления */}
          <TrainerNotifications />

          {/* Статистика клиентов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Клиенты по статусам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Активные</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${clients.length > 0 ? (clientStats.active / clients.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{clientStats.active}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Пробные</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${clients.length > 0 ? (clientStats.trial / clients.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{clientStats.trial}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Неактивные</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${clients.length > 0 ? (clientStats.inactive / clients.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{clientStats.inactive}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Загруженность по дням недели */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Загруженность недели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {weeklyData.map((dayData, index) => {
                  const percentage = maxHours > 0 ? (dayData.hours / maxHours) * 100 : 0;
                  const isToday = dayData.date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div key={index} className="text-center">
                      <div className="mb-2">
                        <div className={`h-16 bg-gray-200 rounded-lg relative overflow-hidden ${
                          isToday ? 'ring-2 ring-blue-500' : ''
                        }`}>
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ height: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {dayData.day}
                      </p>
                      <p className="text-xs text-gray-600">{dayData.hours}ч</p>
                      <p className="text-xs text-gray-500">{dayData.workouts}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Прогресс месяца */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Прогресс месяца
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Тренировок проведено</span>
                    <span>{workouts.filter(w => w.status === 'completed').length}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((workouts.filter(w => w.status === 'completed').length / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Новых клиентов</span>
                    <span>{clientStats.trial}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((clientStats.trial / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Рейтинг</span>
                    <span>4.8/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '96%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Дополнительные советы и информация */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Советы для эффективной работы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Планирование:</strong> Составляйте расписание на неделю вперед для лучшей организации времени
            </div>
            <div>
              <strong>Клиенты:</strong> Ведите заметки о прогрессе каждого клиента после тренировок
            </div>
            <div>
              <strong>Общение:</strong> Регулярно связывайтесь с клиентами для поддержания мотивации
            </div>
            <div>
              <strong>Развитие:</strong> Изучайте новые методики и подходы к тренировкам
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

