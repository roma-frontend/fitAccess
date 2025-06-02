// app/manager/analytics/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider, useManager } from '@/contexts/ManagerContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Star,
  Download,
  RefreshCw,
  Target,
  Activity,
  Clock,
  Award,
  Loader2
} from "lucide-react";

function AnalyticsContent() {
  const router = useRouter();
  const { stats, trainers, loading } = useManager();
  const [timeRange, setTimeRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  // Мок данные для графиков и аналитики
  const analyticsData = {
    revenue: {
      current: 1250000,
      previous: 1100000,
      growth: 13.6
    },
    bookings: {
      current: 456,
      previous: 398,
      growth: 14.6
    },
    newClients: {
      current: 67,
      previous: 52,
      growth: 28.8
    },
    satisfaction: {
      current: 4.8,
      previous: 4.6,
      growth: 4.3
    },
    topTrainers: trainers.slice(0, 5).sort((a, b) => b.monthlyEarnings - a.monthlyEarnings),
    monthlyData: [
      { month: 'Янв', revenue: 980000, bookings: 342, clients: 45 },
      { month: 'Фев', revenue: 1050000, bookings: 378, clients: 52 },
      { month: 'Мар', revenue: 1120000, bookings: 401, clients: 48 },
      { month: 'Апр', revenue: 1180000, bookings: 423, clients: 61 },
      { month: 'Май', revenue: 1250000, bookings: 456, clients: 67 }
    ]
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Имитация обновления данных
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ManagerHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Загрузка аналитики...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Аналитика и отчеты
            </h1>
            <p className="text-gray-600">
              Подробная статистика работы фитнес-центра
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Последняя неделя</SelectItem>
                <SelectItem value="month">Последний месяц</SelectItem>
                <SelectItem value="quarter">Последний квартал</SelectItem>
                <SelectItem value="year">Последний год</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
          </div>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Доход',
              value: formatCurrency(analyticsData.revenue.current),
              change: analyticsData.revenue.growth,
              icon: DollarSign,
              color: 'green'
            },
            {
              title: 'Записи',
              value: analyticsData.bookings.current.toString(),
              change: analyticsData.bookings.growth,
              icon: Calendar,
              color: 'blue'
            },
            {
              title: 'Новые клиенты',
              value: analyticsData.newClients.current.toString(),
              change: analyticsData.newClients.growth,
              icon: Users,
              color: 'purple'
            },
            {
              title: 'Удовлетворенность',
              value: analyticsData.satisfaction.current.toFixed(1),
              change: analyticsData.satisfaction.growth,
              icon: Star,
              color: 'orange'
            }
          ].map((metric, index) => {
            const IconComponent = metric.icon;
            const GrowthIcon = getGrowthIcon(metric.change);
            
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1">
                        <GrowthIcon className={`h-4 w-4 ${getGrowthColor(metric.change)}`} />
                        <span className={`text-sm font-medium ${getGrowthColor(metric.change)}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          vs прошлый период
                        </span>
                      </div>
                    </div>
                    
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      metric.color === 'green' ? 'bg-green-100' :
                      metric.color === 'blue' ? 'bg-blue-100' :
                      metric.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        metric.color === 'green' ? 'text-green-600' :
                        metric.color === 'blue' ? 'text-blue-600' :
                        metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Графики */}
          <div className="lg:col-span-2 space-y-6">
            {/* График доходов */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Динамика доходов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4">
                  {analyticsData.monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ 
                          height: `${(data.revenue / 1250000) * 200}px`,
                          minHeight: '20px'
                        }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600 mt-4">
                  Доход по месяцам (₽)
                </div>
              </CardContent>
            </Card>

            {/* График записей */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Количество записей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4">
                  {analyticsData.monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                        style={{ 
                          height: `${(data.bookings / 456) * 200}px`,
                          minHeight: '20px'
                        }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600 mt-4">
                  Количество записей по месяцам
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Дополнительная аналитика */}
          <div className="space-y-6">
            {/* Топ тренеры */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Топ тренеры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topTrainers.map((trainer, index) => (
                    <div key={trainer.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                                                {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {trainer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(trainer.monthlyEarnings)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">{trainer.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Эффективность тренеров */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Эффективность
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Средняя загрузка</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Выполнение плана</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Удержание клиентов</span>
                    <span className="text-sm font-medium">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Активность по времени */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Пиковые часы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '08:00-10:00', load: 45, label: 'Утро' },
                    { time: '12:00-14:00', load: 30, label: 'Обед' },
                    { time: '18:00-20:00', load: 95, label: 'Вечер' },
                    { time: '20:00-22:00', load: 75, label: 'Поздний вечер' }
                  ].map((slot, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {slot.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {slot.time}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            slot.load > 80 ? 'bg-red-500' :
                            slot.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${slot.load}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Загрузка: {slot.load}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Отчеты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/manager/reports/financial')}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Финансовый отчет
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/manager/reports/trainers')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Отчет по тренерам
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/manager/reports/clients')}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Отчет по клиентам
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/manager/reports/custom')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Настроить отчет
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Дополнительная статистика */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Средний чек
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(2740)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+8.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Отмены записей
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    12%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">-2.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Время отклика
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    1.2ч
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">-15min</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Повторные записи
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    78%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+5.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ManagerAnalytics() {
  return (
    <ProtectedRoute allowedRoles={['manager', 'admin', 'super-admin']} redirectTo="/staff-login">
      <ManagerProvider>
        <AnalyticsContent />
      </ManagerProvider>
    </ProtectedRoute>
  );
}

