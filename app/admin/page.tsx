// app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRoleTexts } from '@/lib/roleTexts';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PersonalizedStats } from '@/components/admin/PersonalizedStats';
import { PersonalizedProgress } from '@/components/admin/PersonalizedProgress';
import { QuickActions } from '@/components/admin/QuickActions';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Bell,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Shield,
  DollarSign,
  Target,
  Award,
  MessageSquare
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const userRole = user?.role;
  const roleTexts = useRoleTexts(userRole);

  // Получаем время суток для персонализированного приветствия
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 17) return 'Добрый день';
    return 'Добрый вечер';
  };

  // Персонализированные советы в зависимости от роли
  const getRoleTips = () => {
    switch (userRole) {
      case 'super-admin':
        return [
          'Проверьте системные логи на наличие ошибок',
          'Обновите резервные копии данных',
          'Мониторьте производительность серверов'
        ];
      case 'admin':
        return [
          'Проанализируйте финансовые показатели за месяц',
          'Проверьте отзывы клиентов',
          'Оцените эффективность маркетинговых кампаний'
        ];
      case 'manager':
        return [
          'Проведите встречу с командой тренеров',
          'Оптимизируйте расписание на следующую неделю',
          'Проверьте состояние оборудования'
        ];
      case 'trainer':
        return [
          'Подготовьте программы для новых клиентов',
          'Обновите планы тренировок',
          'Свяжитесь с клиентами для обратной связи'
        ];
      case 'member':
        return [
          'Запишитесь на новые групповые занятия',
          'Отследите свой прогресс',
          'Попробуйте новый вид активности'
        ];
      case 'client':
        return [
          'Обсудите цели с персональным тренером',
          'Ведите дневник тренировок',
          'Следите за питанием и восстановлением'
        ];
      default:
        return [];
    }
  };

  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader />
      
      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Персонализированное приветствие */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {getGreeting()}, {user?.name || 'Пользователь'}! 
                    <Sparkles className="inline h-6 w-6 ml-2 text-yellow-300" />
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {roleTexts.dashboardSubtitle}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {roleTexts.roleDisplayName}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-yellow-300" />
                    <div>
                      <p className="text-sm text-blue-100">Статус</p>
                      <p className="font-semibold">Активен</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-green-300" />
                    <div>
                      <p className="text-sm text-blue-100">Последний вход</p>
                      <p className="font-semibold">Сегодня</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-purple-300" />
                    <div>
                      <p className="text-sm text-blue-100">Уровень доступа</p>
                      <p className="font-semibold">
                        {userRole === 'super-admin' ? 'Максимальный' :
                         userRole === 'admin' ? 'Административный' :
                         userRole === 'manager' ? 'Управленческий' :
                         userRole === 'trainer' ? 'Тренерский' :
                         'Пользовательский'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Персонализированная статистика */}
          <PersonalizedStats />

          {/* Основной контент в зависимости от роли */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Быстрые действия */}
            <QuickActions variant="expanded" />
            
            {/* Прогресс и цели */}
            <PersonalizedProgress />
          </div>

          {/* Дополнительные секции */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Последняя активность */}
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>

            {/* Советы и рекомендации */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  Рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRoleTips().map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{tip}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-4 group">
                    Все рекомендации
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Персонализированные виджеты в зависимости от роли */}
          {userRole === 'super-admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Системный мониторинг
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <Badge variant="outline" className="text-green-700 bg-green-100">
                        23%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <Badge variant="outline" className="text-blue-700 bg-blue-100">
                        67%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Database Load</span>
                      <Badge variant="outline" className="text-purple-700 bg-purple-100">
                        45%
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      Подробная диагностика
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Активность пользователей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">1,247</div>
                      <div className="text-sm text-gray-600">Активных пользователей</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">89</div>
                        <div className="text-xs text-gray-600">Онлайн сейчас</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-semibold text-orange-600">156</div>
                        <div className="text-xs text-gray-600">За последний час</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(userRole === 'admin' || userRole === 'manager') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Финансовая сводка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Выручка сегодня</span>
                      <span className="font-semibold text-green-600">₽28,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Выручка за неделю</span>
                      <span className="font-semibold text-blue-600">₽187,230</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Выручка за месяц</span>
                      <span className="font-semibold text-purple-600">₽847,230</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Рост к прошлому месяцу</span>
                        <Badge variant="outline" className="text-green-700 bg-green-100">
                          +18%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Загрузка на сегодня
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">87%</div>
                      <div className="text-sm text-gray-600">Средняя загрузка залов</div>
                                        </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Зал №1</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Зал №2</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Групповые занятия</span>
                        <span className="font-medium">89%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {userRole === 'trainer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Мои клиенты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">23</div>
                      <div className="text-sm text-gray-600">Активных клиентов</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">5</div>
                        <div className="text-xs text-gray-600">Тренировок сегодня</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">4.9</div>
                        <div className="text-xs text-gray-600">Средний рейтинг</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Управление клиентами
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Расписание на сегодня
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-8 bg-blue-500 rounded"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">09:00 - Анна Петрова</div>
                        <div className="text-xs text-gray-600">Персональная тренировка</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                      <div className="w-2 h-8 bg-green-500 rounded"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">11:00 - Михаил Иванов</div>
                        <div className="text-xs text-gray-600">Силовая тренировка</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                      <div className="w-2 h-8 bg-purple-500 rounded"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">15:00 - Елена Сидорова</div>
                        <div className="text-xs text-gray-600">Кардио тренировка</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Полное расписание
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(userRole === 'member' || userRole === 'client') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Моя активность
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">7</div>
                      <div className="text-sm text-gray-600">Дней подряд</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">12</div>
                        <div className="text-xs text-gray-600">Тренировок в месяце</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">85%</div>
                        <div className="text-xs text-gray-600">Прогресс к цели</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Подробная статистика
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Ближайшие тренировки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userRole === 'client' ? (
                      <>
                        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                          <div className="w-2 h-8 bg-green-500 rounded"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Завтра 10:00</div>
                            <div className="text-xs text-gray-600">С тренером Еленой</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                          <div className="w-2 h-8 bg-blue-500 rounded"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Пятница 15:00</div>
                            <div className="text-xs text-gray-600">Персональная тренировка</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                          <div className="w-2 h-8 bg-orange-500 rounded"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Сегодня 19:00</div>
                            <div className="text-xs text-gray-600">Йога для начинающих</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                          <div className="w-2 h-8 bg-purple-500 rounded"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Завтра 18:00</div>
                            <div className="text-xs text-gray-600">Функциональная тренировка</div>
                          </div>
                        </div>
                      </>
                    )}
                    <Button variant="outline" className="w-full">
                      {userRole === 'client' ? 'Записаться на тренировку' : 'Все групповые занятия'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Дополнительные виджеты для всех ролей */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Быстрая статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Быстрая статистика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRole === 'super-admin' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Общее время работы</span>
                        <span className="font-semibold text-green-600">99.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Активные сессии</span>
                        <span className="font-semibold text-blue-600">89</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ошибки за день</span>
                        <span className="font-semibold text-red-600">2</span>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'admin' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Активные абонементы</span>
                        <span className="font-semibold text-green-600">456</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Истекают в этом месяце</span>
                        <span className="font-semibold text-orange-600">23</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Средний чек</span>
                        <span className="font-semibold text-blue-600">₽2,500</span>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'manager' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Тренеров в смене</span>
                        <span className="font-semibold text-green-600">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Свободных залов</span>
                        <span className="font-semibold text-blue-600">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Заявки на сегодня</span>
                        <span className="font-semibold text-purple-600">15</span>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'trainer' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Тренировок на неделе</span>
                        <span className="font-semibold text-green-600">28</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Новых клиентов</span>
                        <span className="font-semibold text-blue-600">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Доход за неделю</span>
                        <span className="font-semibold text-purple-600">₽42,000</span>
                      </div>
                    </>
                  )}
                  
                  {(userRole === 'member' || userRole === 'client') && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Дней до окончания</span>
                        <span className="font-semibold text-green-600">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Калорий сожжено</span>
                        <span className="font-semibold text-red-600">4,200</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Достижений</span>
                        <span className="font-semibold text-yellow-600">12</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Уведомления */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Уведомления
                  <Badge variant="destructive" className="ml-auto">3</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRole === 'super-admin' && (
                    <>
                      <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-xs font-medium text-red-800">Критическое</div>
                        <div className="text-sm text-red-700">Высокая нагрузка на сервер</div>
                      </div>
                      <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-xs font-medium text-yellow-800">Предупреждение</div>
                        <div className="text-sm text-yellow-700">Резервная копия устарела</div>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'admin' && (
                    <>
                                            <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs font-medium text-green-800">Успех</div>
                        <div className="text-sm text-green-700">Цель по выручке достигнута</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs font-medium text-blue-800">Информация</div>
                        <div className="text-sm text-blue-700">Новая заявка от тренера</div>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'manager' && (
                    <>
                      <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-xs font-medium text-orange-800">Внимание</div>
                        <div className="text-sm text-orange-700">Конфликт в расписании</div>
                      </div>
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-xs font-medium text-purple-800">Напоминание</div>
                        <div className="text-sm text-purple-700">Собрание команды завтра</div>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'trainer' && (
                    <>
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs font-medium text-green-800">Отзыв</div>
                        <div className="text-sm text-green-700">Новый отзыв от клиента</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs font-medium text-blue-800">Напоминание</div>
                        <div className="text-sm text-blue-700">Тренировка через 30 минут</div>
                      </div>
                    </>
                  )}
                  
                  {(userRole === 'member' || userRole === 'client') && (
                    <>
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs font-medium text-green-800">Достижение</div>
                        <div className="text-sm text-green-700">Новое достижение разблокировано!</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs font-medium text-blue-800">Напоминание</div>
                        <div className="text-sm text-blue-700">Тренировка завтра в 10:00</div>
                      </div>
                    </>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Все уведомления
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые ссылки */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Быстрые ссылки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userRole === 'super-admin' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Настройки безопасности
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Системная аналитика
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Управление пользователями
                      </Button>
                    </>
                  )}
                  
                  {userRole === 'admin' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Финансовые отчеты
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Управление тренерами
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Маркетинг и продажи
                      </Button>
                    </>
                  )}
                  
                  {userRole === 'manager' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Управление расписанием
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Команда тренеров
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Отчеты по залам
                      </Button>
                    </>
                  )}
                  
                  {userRole === 'trainer' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Мои клиенты
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Расписание тренировок
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Программы тренировок
                      </Button>
                    </>
                  )}
                  
                  {userRole === 'member' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Записаться на занятие
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Activity className="h-4 w-4 mr-2" />
                        Мой прогресс
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Сообщество
                      </Button>
                    </>
                  )}
                  
                  {userRole === 'client' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Записаться к тренеру
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Мои цели
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Award className="h-4 w-4 mr-2" />
                        Достижения
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Персонализированные метрики в зависимости от роли */}
          {(userRole === 'admin' || userRole === 'super-admin') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Ключевые метрики
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">₽847,230</div>
                    <div className="text-sm text-gray-600">Выручка за месяц</div>
                    <div className="text-xs text-green-600 mt-1">+18% к прошлому месяцу</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">456</div>
                    <div className="text-sm text-gray-600">Активные клиенты</div>
                    <div className="text-xs text-blue-600 mt-1">+12 за неделю</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
                    <div className="text-sm text-gray-600">Удержание клиентов</div>
                    <div className="text-xs text-purple-600 mt-1">+3% к цели</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">4.8</div>
                    <div className="text-sm text-gray-600">Средний рейтинг</div>
                    <div className="text-xs text-orange-600 mt-1">+0.2 за месяц</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Календарь событий для менеджеров */}
          {userRole === 'manager' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Важные события на неделе
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">ПН</div>
                      <div className="text-xs text-gray-600">15</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Собрание команды</div>
                      <div className="text-sm text-gray-600">10:00 - Планерка с тренерами</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">СР</div>
                      <div className="text-xs text-gray-600">17</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Инвентаризация</div>
                      <div className="text-sm text-gray-600">14:00 - Проверка оборудования</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">ПТ</div>
                      <div className="text-xs text-gray-600">19</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Отчет по неделе</div>
                      <div className="text-sm text-gray-600">16:00 - Подготовка отчета</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Прогресс тренировок для клиентов */}
          {(userRole === 'client' || userRole === 'member') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Мой прогресс в тренировках
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">75%</div>
                    <div className="text-sm text-gray-600">Прогресс к цели</div>
                    <div className="text-xs text-green-600 mt-1">-5 кг из -7 кг</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Тренировок в месяце</div>
                    <div className="text-xs text-blue-600 mt-1">Цель: 16 тренировок</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
                                        <div className="text-sm text-gray-600">Достижений</div>
                    <div className="text-xs text-purple-600 mt-1">+2 за месяц</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Дополнительный футер с общей информацией */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Добро пожаловать в панель управления!
                </h3>
                <p className="text-gray-600 mb-4">
                  Здесь вы можете управлять всеми аспектами вашей деятельности в фитнес-центре
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {userRole === 'super-admin' ? '24/7' :
                       userRole === 'admin' ? '100%' :
                       userRole === 'manager' ? '365' :
                       userRole === 'trainer' ? '5★' :
                       '24/7'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userRole === 'super-admin' ? 'Поддержка системы' :
                       userRole === 'admin' ? 'Удовлетворенность' :
                       userRole === 'manager' ? 'Дней в году' :
                       userRole === 'trainer' ? 'Средний рейтинг' :
                       'Доступность'}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {userRole === 'super-admin' ? '99.9%' :
                       userRole === 'admin' ? '₽2M+' :
                       userRole === 'manager' ? '50+' :
                       userRole === 'trainer' ? '200+' :
                       '1000+'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userRole === 'super-admin' ? 'Время работы' :
                       userRole === 'admin' ? 'Годовая выручка' :
                       userRole === 'manager' ? 'Сотрудников' :
                       userRole === 'trainer' ? 'Тренировок' :
                       'Участников'}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      {userRole === 'super-admin' ? '5' :
                       userRole === 'admin' ? '15' :
                       userRole === 'manager' ? '10' :
                       userRole === 'trainer' ? '25' :
                       '12'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userRole === 'super-admin' ? 'Лет опыта' :
                       userRole === 'admin' ? 'Филиалов' :
                       userRole === 'manager' ? 'Залов' :
                       userRole === 'trainer' ? 'Клиентов' :
                       'Месяцев занятий'}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">
                      {userRole === 'super-admin' ? '∞' :
                       userRole === 'admin' ? '95%' :
                       userRole === 'manager' ? '98%' :
                       userRole === 'trainer' ? '4.9' :
                       '85%'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userRole === 'super-admin' ? 'Возможности' :
                       userRole === 'admin' ? 'Рост продаж' :
                       userRole === 'manager' ? 'Эффективность' :
                       userRole === 'trainer' ? 'Рейтинг' :
                       'Прогресс'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Последнее обновление: {new Date().toLocaleString('ru-RU')}</span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Система работает нормально
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}



