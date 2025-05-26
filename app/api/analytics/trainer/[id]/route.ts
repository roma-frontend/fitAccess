// app/api/analytics/trainer/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';
import { canManageUser, UserRole, isValidRole } from '@/lib/permissions';

// Интерфейсы для аналитики тренера
interface TrainerAnalytics {
  trainer: {
    id: string;
    name: string;
    email: string;
    specialization: string[];
    rating: number;
    experience: number;
  };
  period: {
    type: string;
    start: string;
    end: string;
  };
  summary: {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    scheduledSessions: number;
    noShowSessions: number;
    totalRevenue: number;
    uniqueClients: number;
    activeClients: number;
  };
  growth: {
    sessions: number;
    revenue: number;
    clients: number;
  };
  efficiency: {
    completionRate: number;
    cancellationRate: number;
    noShowRate: number;
    avgSessionsPerDay: number;
    avgRevenuePerSession: number;
  };
  distribution: {
    sessionTypes: Record<string, number>;
    weekdayStats: Array<{
      day: string;
      sessions: number;
      completed: number;
      revenue: number;
    }>;
    hourlyStats: Array<{
      hour: number;
      sessions: number;
      completed: number;
    }>;
  };
  topClients: Array<{
    id: string;
    name: string;
    totalSessions: number;
    completedSessions: number;
    revenue: number;
    lastSession: string | null;
  }>;
  recommendations: string[];
}

// GET /api/analytics/trainer/[id] - Получение аналитики по конкретному тренеру
export const GET = withPermissions(
  { resource: 'analytics', action: 'read' },
  async (req: AuthenticatedRequest, context?: { params: any }) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { success: false, error: 'ID тренера не указан' },
          { status: 400 }
        );
      }

      const { id: trainerId } = context.params;
      const { user } = req;
      const url = new URL(req.url);
      const period = url.searchParams.get('period') || 'month';

      console.log(`📊 API: получение аналитики тренера ${trainerId}`);

      // Проверка прав доступа
      if (user.role === 'trainer' && user.id !== trainerId) {
        return NextResponse.json(
          { success: false, error: 'Нет доступа к аналитике другого тренера' },
          { status: 403 }
        );
      }

      // Поиск тренера
      const trainer = mockTrainers.find(t => t.id === trainerId);
      if (!trainer) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      // Проверка и валидация роли тренера
      const trainerRole = trainer.role;
      if (!isValidRole(trainerRole)) {
        console.error(`Некорректная роль тренера: ${trainerRole}`);
        return NextResponse.json(
          { success: false, error: 'Некорректная роль пользователя' },
          { status: 400 }
        );
      }

      // Проверка прав управления пользователем
      if (!canManageUser(user.role, trainerRole as UserRole) && user.id !== trainerId) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для просмотра данных этого тренера' },
          { status: 403 }
        );
      }

      // Дополнительная проверка - убеждаемся, что это действительно тренер
      if (trainerRole !== 'trainer') {
        return NextResponse.json(
          { success: false, error: 'Указанный пользователь не является тренером' },
          { status: 400 }
        );
      }

      // Фильтрация данных тренера
      const trainerSessions = mockSessions.filter(s => s.trainerId === trainerId);
      const trainerClients = mockClients.filter(c => c.trainerId === trainerId);

      // Определение временного периода
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Фильтрация сессий по периоду
      const periodSessions = trainerSessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate >= startDate && sessionDate <= now;
      });

      // Расчет основных метрик
      const completedSessions = periodSessions.filter(s => s.status === 'completed');
      const cancelledSessions = periodSessions.filter(s => s.status === 'cancelled');
      const scheduledSessions = periodSessions.filter(s => s.status === 'scheduled');
      const noShowSessions = periodSessions.filter(s => s.status === 'no-show');

      const avgSessionPrice = 2000; // рублей за тренировку
      const totalRevenue = completedSessions.length * avgSessionPrice;
      const uniqueClients = new Set(periodSessions.map(s => s.clientId)).size;

      // Статистика по типам сессий
      const sessionTypes = {
        personal: periodSessions.filter(s => s.type === 'personal').length,
        group: periodSessions.filter(s => s.type === 'group').length,
        consultation: periodSessions.filter(s => s.type === 'consultation').length
      };

      // Статистика по дням недели
      const weekdayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const weekdayStats = Array.from({ length: 7 }, (_, day) => {
        const daySessions = periodSessions.filter(session => {
          const sessionDate = new Date(`${session.date}T${session.startTime}`);
          return sessionDate.getDay() === day;
        });
        
        const dayCompleted = daySessions.filter(s => s.status === 'completed');
        
        return {
          day: weekdayNames[day],
          sessions: daySessions.length,
          completed: dayCompleted.length,
          revenue: dayCompleted.length * avgSessionPrice
        };
      });

      // Статистика по часам
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
        const hourSessions = periodSessions.filter(session => {
          const startHour = parseInt(session.startTime.split(':')[0]);
          return startHour === hour;
        });

        return {
          hour,
          sessions: hourSessions.length,
          completed: hourSessions.filter(s => s.status === 'completed').length
        };
      }).filter(h => h.sessions > 0);

      // Топ клиенты тренера
      const clientStats = trainerClients.map(client => {
        const clientSessions = periodSessions.filter(s => s.clientId === client.id);
        const completedClientSessions = clientSessions.filter(s => s.status === 'completed');
        
        const lastSessionTime = clientSessions.length > 0 
          ? Math.max(...clientSessions.map(s => new Date(`${s.date}T${s.startTime}`).getTime()))
          : null;
        
        return {
          id: client.id,
          name: client.name,
          totalSessions: clientSessions.length,
          completedSessions: completedClientSessions.length,
          revenue: completedClientSessions.length * avgSessionPrice,
          lastSession: lastSessionTime ? new Date(lastSessionTime).toISOString() : null
        };
      });

      const topClients = clientStats
        .sort((a, b) => b.completedSessions - a.completedSessions)
        .slice(0, 5);

      // Сравнение с предыдущим периодом
      const prevStartDate = new Date(startDate);
      switch (period) {
        case 'day':
          prevStartDate.setDate(prevStartDate.getDate() - 1);
          break;
        case 'week':
          prevStartDate.setDate(prevStartDate.getDate() - 7);
          break;
        case 'month':
          prevStartDate.setMonth(prevStartDate.getMonth() - 1);
          break;
        case 'quarter':
          prevStartDate.setMonth(prevStartDate.getMonth() - 3);
          break;
        case 'year':
          prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
          break;
      }

      const prevPeriodEnd = new Date(startDate);
      const prevPeriodSessions = trainerSessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate >= prevStartDate && sessionDate < prevPeriodEnd;
      });

      const prevCompletedSessions = prevPeriodSessions.filter(s => s.status === 'completed');
      const prevRevenue = prevCompletedSessions.length * avgSessionPrice;
      const prevUniqueClients = new Set(prevPeriodSessions.map(s => s.clientId)).size;

      // Расчет роста
      const calculateGrowth = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const growth = {
        sessions: calculateGrowth(completedSessions.length, prevCompletedSessions.length),
        revenue: calculateGrowth(totalRevenue, prevRevenue),
        clients: calculateGrowth(uniqueClients, prevUniqueClients)
      };

      // Показатели эффективности
      const totalDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      const efficiency = {
        completionRate: periodSessions.length > 0 
          ? Math.round((completedSessions.length / periodSessions.length) * 100)
          : 0,
        cancellationRate: periodSessions.length > 0
          ? Math.round((cancelledSessions.length / periodSessions.length) * 100)
          : 0,
        noShowRate: periodSessions.length > 0
          ? Math.round((noShowSessions.length / periodSessions.length) * 100)
          : 0,
        avgSessionsPerDay: period !== 'day' 
          ? Math.round(completedSessions.length / totalDays * 10) / 10 // Округление до 1 знака
          : completedSessions.length,
        avgRevenuePerSession: completedSessions.length > 0 
          ? avgSessionPrice
          : 0
      };

      const trainerAnalytics: TrainerAnalytics = {
        trainer: {
          id: trainer.id,
          name: trainer.name,
          email: trainer.email,
          specialization: trainer.specialization || [],
          rating: trainer.rating || 0,
          experience: trainer.experience || 0
        },
        period: {
          type: period,
          start: startDate.toISOString(),
          end: now.toISOString()
        },
        summary: {
          totalSessions: periodSessions.length,
          completedSessions: completedSessions.length,
          cancelledSessions: cancelledSessions.length,
          scheduledSessions: scheduledSessions.length,
          noShowSessions: noShowSessions.length,
          totalRevenue,
          uniqueClients,
          activeClients: trainerClients.filter(c => c.status === 'active').length
        },
        growth,
        efficiency,
        distribution: {
          sessionTypes,
          weekdayStats: weekdayStats.filter(w => w.sessions > 0),
          hourlyStats
        },
        topClients,
        recommendations: generateRecommendations(efficiency, growth, sessionTypes)
      };

      console.log(`✅ API: аналитика тренера ${trainer.name} сформирована за период ${period}`);

      return NextResponse.json({
        success: true,
        data: trainerAnalytics,
        meta: {
          generatedAt: now.toISOString(),
          requestedBy: user.email,
          scope: 'trainer',
          trainerId: trainerId,
          period: period
        }
      });

    } catch (error: any) {
      console.error('💥 API: ошибка получения аналитики тренера:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения аналитики тренера' },
        { status: 500 }
      );
    }
  }
);

// Функция для генерации рекомендаций
function generateRecommendations(
  efficiency: TrainerAnalytics['efficiency'], 
  growth: TrainerAnalytics['growth'], 
  sessionTypes: Record<string, number>
): string[] {
  const recommendations: string[] = [];

  // Рекомендации по эффективности
  if (efficiency.completionRate < 80) {
    recommendations.push('Рассмотрите возможность улучшения планирования сессий для повышения процента завершения');
  }

  if (efficiency.cancellationRate > 15) {
    recommendations.push('Высокий процент отмен. Рекомендуется проанализировать причины и улучшить коммуникацию с клиентами');
  }

  if (efficiency.noShowRate > 10) {
    recommendations.push('Внедрите систему напоминаний для снижения количества неявок');
  }

  // Рекомендации по росту
    if (growth.sessions < -10) {
    recommendations.push('Количество сессий снижается. Рассмотрите возможность привлечения новых клиентов');
  }

  if (growth.revenue < -15) {
    recommendations.push('Доходы снижаются. Проанализируйте ценообразование и качество услуг');
  }

  if (growth.clients < -5) {
    recommendations.push('Количество клиентов уменьшается. Сосредоточьтесь на удержании существующих клиентов');
  }

  // Позитивные рекомендации по росту
  if (growth.sessions > 20) {
    recommendations.push('Отличный рост количества сессий! Рассмотрите возможность расширения расписания');
  }

  if (growth.revenue > 25) {
    recommendations.push('Превосходный рост доходов! Продолжайте применять успешные стратегии');
  }

  // Рекомендации по типам сессий
  const totalSessions = sessionTypes.personal + sessionTypes.group + sessionTypes.consultation;
  if (totalSessions > 0) {
    const groupPercentage = (sessionTypes.group / totalSessions) * 100;
    const consultationPercentage = (sessionTypes.consultation / totalSessions) * 100;
    const personalPercentage = (sessionTypes.personal / totalSessions) * 100;

    if (groupPercentage < 20 && totalSessions > 10) {
      recommendations.push('Рассмотрите возможность увеличения количества групповых тренировок для повышения эффективности');
    }

    if (consultationPercentage < 10 && totalSessions > 5) {
      recommendations.push('Добавьте больше консультационных сессий для лучшего понимания потребностей клиентов');
    }

    if (personalPercentage > 80) {
      recommendations.push('Высокая доля персональных тренировок. Рассмотрите диверсификацию услуг');
    }
  }

  // Рекомендации по загрузке
  if (efficiency.avgSessionsPerDay < 2) {
    recommendations.push('Низкая ежедневная загрузка. Рассмотрите возможность увеличения количества сессий');
  } else if (efficiency.avgSessionsPerDay > 8) {
    recommendations.push('Очень высокая загрузка. Убедитесь, что качество сервиса не страдает');
  }

  // Рекомендации по эффективности
  if (efficiency.completionRate > 95) {
    recommendations.push('Отличный показатель завершения сессий! Поделитесь опытом с коллегами');
  }

  if (efficiency.cancellationRate < 5) {
    recommendations.push('Низкий процент отмен - отличная работа с клиентами!');
  }

  // Общие рекомендации
  if (recommendations.length === 0) {
    recommendations.push('Отличная работа! Все показатели в норме. Продолжайте в том же духе!');
  }

  // Ограничиваем количество рекомендаций
  return recommendations.slice(0, 6);
}

// Дополнительные утилитарные функции для аналитики тренера
export function validatePeriod(period: string): boolean {
  const validPeriods = ['day', 'week', 'month', 'quarter', 'year'];
  return validPeriods.includes(period);
}

export function calculateSessionPrice(sessionType: string): number {
  const prices: Record<string, number> = {
    personal: 2000,
    group: 1500,
    consultation: 1000
  };
  
  return prices[sessionType] || 2000;
}

export function getSessionTypeColor(sessionType: string): string {
  const colors: Record<string, string> = {
    personal: '#3B82F6',
    group: '#10B981',
    consultation: '#F59E0B'
  };
  
  return colors[sessionType] || '#6B7280';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value}%`;
}

export function getGrowthTrend(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 5) return 'positive';
  if (value < -5) return 'negative';
  return 'neutral';
}

export function getEfficiencyLevel(rate: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (rate >= 90) return 'excellent';
  if (rate >= 80) return 'good';
  if (rate >= 70) return 'average';
  return 'poor';
}

// Функция для генерации цветовой схемы графиков
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}

// Функция для расчета рейтинга тренера на основе метрик
export function calculateTrainerScore(analytics: TrainerAnalytics): number {
  const weights = {
    completionRate: 0.3,
    clientRetention: 0.25,
    growth: 0.2,
    efficiency: 0.15,
    diversity: 0.1
  };

  const completionScore = Math.min(analytics.efficiency.completionRate / 100, 1);
  const growthScore = Math.max(0, Math.min((analytics.growth.sessions + 50) / 100, 1));
  const efficiencyScore = Math.min(analytics.efficiency.avgSessionsPerDay / 6, 1);
  
  const totalSessionTypes = Object.values(analytics.distribution.sessionTypes).reduce((a, b) => a + b, 0);
  const diversityScore = totalSessionTypes > 0 ? 
    Math.min(Object.values(analytics.distribution.sessionTypes).filter(v => v > 0).length / 3, 1) : 0;

  const clientRetentionScore = analytics.topClients.length > 0 ? 
    analytics.topClients.filter(c => c.totalSessions > 1).length / analytics.topClients.length : 0;

  const totalScore = (
    completionScore * weights.completionRate +
    clientRetentionScore * weights.clientRetention +
    growthScore * weights.growth +
    efficiencyScore * weights.efficiency +
    diversityScore * weights.diversity
  ) * 100;

  return Math.round(totalScore);
}

// Экспорт типов для использования в других файлах
export type { TrainerAnalytics };

