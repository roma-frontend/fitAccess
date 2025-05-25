// components/MyWorkouts.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Dumbbell, 
  Plus,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface Workout {
  id: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  price: number;
  notes?: string;
  category?: 'trainer' | 'program';
  trainerName?: string;
  trainerSpecializations?: string[];
  programTitle?: string;
  instructor?: string;
  createdAt: string;
}

interface MyWorkoutsProps {
  showHeader?: boolean;
  maxItems?: number;
  showFilters?: boolean;
}

export default function MyWorkouts({ 
  showHeader = true, 
  maxItems, 
  showFilters = true 
}: MyWorkoutsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Запрашиваем тренировки...');
      
      const response = await fetch('/api/my-workouts');
      console.log('📡 Ответ сервера:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Данные ответа:', data);
      
      if (data.success) {
        setWorkouts(data.workouts);
        console.log('✅ Тренировки загружены:', data.workouts.length);
      } else {
        setError(data.error || 'Ошибка получения тренировок');
      }
    } catch (error) {
      console.error('❌ Ошибка запроса:', error);
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтверждено';
      case 'pending':
        return 'Ожидает подтверждения';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return new Date(workout.date) > new Date() && workout.status !== 'cancelled';
    }
    if (filter === 'completed') return workout.status === 'completed';
    if (filter === 'cancelled') return workout.status === 'cancelled';
    return true;
  });

  const displayWorkouts = maxItems ? filteredWorkouts.slice(0, maxItems) : filteredWorkouts;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка тренировок...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button 
          onClick={fetchWorkouts}
          variant="outline"
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Мои тренировки</h2>
          <div className="text-sm text-gray-600">
            Всего: {workouts.length}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Все ({workouts.length})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Предстоящие ({workouts.filter(w => new Date(w.date) > new Date() && w.status !== 'cancelled').length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Завершенные ({workouts.filter(w => w.status === 'completed').length})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Отмененные ({workouts.filter(w => w.status === 'cancelled').length})
          </Button>
        </div>
      )}

      {displayWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'У вас пока нет тренировок' : `Нет тренировок в категории "${filter}"`}
          </h3>
          <p className="text-gray-600 mb-6">
            Запишитесь на тренировку с тренером или групповую программу
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/trainers'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Записаться к тренеру
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/programs'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Выбрать программу
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-medium line-clamp-2">
                    {workout.type}
                  </CardTitle>
                  <Badge className={getStatusColor(workout.status)}>
                    {getStatusText(workout.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(workout.date).toLocaleDateString('ru-RU', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{workout.time} ({workout.duration} мин)</span>
                </div>

                {workout.category === 'trainer' && workout.trainerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{workout.trainerName}</div>
                      {workout.trainerSpecializations && workout.trainerSpecializations.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {workout.trainerSpecializations.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {workout.category === 'program' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Dumbbell className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{workout.programTitle}</div>
                      {workout.instructor && (
                        <div className="text-xs text-gray-500">
                          Инструктор: {workout.instructor}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {workout.price > 0 && (
                  <div className="text-sm font-medium text-gray-900">
                    {workout.price} ₽
                  </div>
                )}

                {workout.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {workout.notes}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {workout.status === 'pending' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                      Отменить
                    </Button>
                  )}
                  {workout.status === 'confirmed' && new Date(workout.date) > new Date() && (
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800">
                      Перенести
                    </Button>
                  )}
                  {workout.status === 'completed' && (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800">
                      Оставить отзыв
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {maxItems && filteredWorkouts.length > maxItems && (
        <div className="text-center pt-6">
          <Button 
            onClick={() => window.location.href = '/member-dashboard/my-bookings'}
            variant="outline"
          >
            Показать все тренировки ({filteredWorkouts.length})
          </Button>
        </div>
      )}
    </div>
  );
}
