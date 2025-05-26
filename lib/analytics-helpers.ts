// lib/analytics-helpers.ts
import { UserRole } from '@/lib/permissions';

// Типы для аналитических данных
export interface SessionMetrics {
  total: number;
  completed: number;
  cancelled: number;
  scheduled: number;
  noShow: number;
  completionRate: number;
  cancellationRate: number;
}

export interface RevenueMetrics {
  total: number;
  bySessionType: Record<string, number>;
  avgPerSession: number;
  growth: number;
}

export interface ClientMetrics {
  total: number;
  active: number;
  new: number;
  returning: number;
  retentionRate: number;
}

export interface TrainerMetrics {
  id: string;
  name: string;
  sessions: SessionMetrics;
  revenue: RevenueMetrics;
  clients: ClientMetrics;
  efficiency: number;
  rating: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  prediction: number;
}

export interface PerformanceLevel {
  level: 'excellent' | 'good' | 'average' | 'poor';
  color: string;
  description: string;
}

export interface GrowthMetrics {
  value: number;
  formatted: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface EfficiencyMetrics {
  completionRate: number;
  utilizationRate: number;
  clientSatisfaction: number;
}

// Утилиты для расчетов
export class AnalyticsCalculator {
  
  static calculateSessionMetrics(sessions: any[]): SessionMetrics {
    const completed = sessions.filter(s => s.status === 'completed');
    const cancelled = sessions.filter(s => s.status === 'cancelled');
    const scheduled = sessions.filter(s => s.status === 'scheduled');
    const noShow = sessions.filter(s => s.status === 'no-show');

    return {
      total: sessions.length,
      completed: completed.length,
      cancelled: cancelled.length,
      scheduled: scheduled.length,
      noShow: noShow.length,
      completionRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
      cancellationRate: sessions.length > 0 ? Math.round((cancelled.length / sessions.length) * 100) : 0
    };
  }

  static calculateRevenueMetrics(sessions: any[], previousSessions: any[] = []): RevenueMetrics {
    const completed = sessions.filter(s => s.status === 'completed');
    const prevCompleted = previousSessions.filter(s => s.status === 'completed');
    
    const sessionPrices: Record<string, number> = {
      personal: 2000,
      group: 1500,
      consultation: 1000
    };

    const bySessionType: Record<string, number> = {};
    let totalRevenue = 0;

    completed.forEach(session => {
      const price = sessionPrices[session.type] || 2000;
      totalRevenue += price;
      bySessionType[session.type] = (bySessionType[session.type] || 0) + price;
    });

    const prevRevenue = prevCompleted.reduce((sum, session) => {
      return sum + (sessionPrices[session.type] || 2000);
    }, 0);

    const growth = prevRevenue > 0 
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : totalRevenue > 0 ? 100 : 0;

    return {
      total: totalRevenue,
      bySessionType,
      avgPerSession: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
      growth
    };
  }

  static calculateClientMetrics(sessions: any[], clients: any[], previousSessions: any[] = []): ClientMetrics {
    const currentClientIds = new Set(sessions.map(s => s.clientId));
    const prevClientIds = new Set(previousSessions.map(s => s.clientId));
    
    const newClients = [...currentClientIds].filter(id => !prevClientIds.has(id));
    const returningClients = [...currentClientIds].filter(id => prevClientIds.has(id));
    
    const activeClients = clients.filter(c => c.status === 'active');

    return {
      total: clients.length,
      active: activeClients.length,
      new: newClients.length,
      returning: returningClients.length,
      retentionRate: prevClientIds.size > 0 
        ? Math.round((returningClients.length / prevClientIds.size) * 100)
        : 0
    };
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  static calculateEfficiencyScore(metrics: EfficiencyMetrics): number {
    const weights = {
      completionRate: 0.4,
      utilizationRate: 0.3,
      clientSatisfaction: 0.3
    };

    return Math.round(
      metrics.completionRate * weights.completionRate +
      metrics.utilizationRate * weights.utilizationRate +
      metrics.clientSatisfaction * weights.clientSatisfaction
    );
  }

  static getPerformanceLevel(score: number): PerformanceLevel {
    if (score >= 90) {
      return {
        level: 'excellent',
        color: '#10B981',
        description: 'Превосходные результаты'
      };
    } else if (score >= 75) {
      return {
        level: 'good',
        color: '#3B82F6',
        description: 'Хорошие результаты'
      };
    } else if (score >= 60) {
      return {
        level: 'average',
        color: '#F59E0B',
        description: 'Средние результаты'
      };
    } else {
      return {
        level: 'poor',
        color: '#EF4444',
        description: 'Требует улучшения'
      };
    }
  }

  static generateTrendAnalysis(data: number[]): TrendAnalysis {
    if (data.length < 3) {
      return { trend: 'stable', strength: 'weak', prediction: data[data.length - 1] || 0 };
    }

    // Простая линейная регрессия для определения тренда
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Определение тренда
    let trend: 'increasing' | 'decreasing' | 'stable';
    let strength: 'strong' | 'moderate' | 'weak';

    const absSlope = Math.abs(slope);
    const avgValue = sumY / n;
    const relativeSlope = avgValue > 0 ? (absSlope / avgValue) * 100 : 0;

    if (slope > 0.1) {
      trend = 'increasing';
    } else if (slope < -0.1) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    if (relativeSlope > 10) {
      strength = 'strong';
    } else if (relativeSlope > 5) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }

    // Прогноз на следующий период
    const prediction = Math.max(0, Math.round(slope * n + intercept));

    return { trend, strength, prediction };
  }

  static calculateUtilizationRate(sessions: any[], totalAvailableSlots: number): number {
    if (totalAvailableSlots === 0) return 0;
    return Math.round((sessions.length / totalAvailableSlots) * 100);
  }

  static calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  static calculateSessionDuration(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // в минутах
  }
}

// Утилиты для форматирования
export class AnalyticsFormatter {
  
  static formatCurrency(amount: number, currency: string = 'RUB'): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static formatPercentage(value: number, showSign: boolean = false): string {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value}%`;
  }

  static formatNumber(value: number): string {
    return new Intl.NumberFormat('ru-RU').format(value);
  }

  static formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'long') {
      return dateObj.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return dateObj.toLocaleDateString('ru-RU');
  }

  static formatTime(time: string): string {
    return time.slice(0, 5); // Убираем секунды
  }

  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  }

  static formatGrowth(current: number, previous: number): GrowthMetrics {
    const growth = AnalyticsCalculator.calculateGrowthRate(current, previous);
    
    let trend: 'up' | 'down' | 'stable';
    let color: string;
    
    if (growth > 0) {
      trend = 'up';
      color = '#10B981';
    } else if (growth < 0) {
      trend = 'down';
      color = '#EF4444';
    } else {
      trend = 'stable';
      color = '#6B7280';
    }

    return {
      value: growth,
      formatted: this.formatPercentage(growth, true),
      trend,
      color
    };
  }

  static formatCompactNumber(value: number): string {
    if (value >= 1000000) {
      return `${Math.round(value / 100000) / 10}М`;
    } else if (value >= 1000) {
      return `${Math.round(value / 100) / 10}К`;
    }
    return value.toString();
  }

  static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
    return `${Math.floor(diffDays / 365)} г. назад`;
  }
}

// Утилиты для фильтрации данных
export class AnalyticsFilter {
  
  static filterByUserRole(
    sessions: any[], 
    trainers: any[], 
    clients: any[], 
    userRole: UserRole, 
    userId: string
  ): { sessions: any[]; trainers: any[]; clients: any[] } {
    if (userRole === 'trainer') {
      return {
        sessions: sessions.filter(s => s.trainerId === userId),
        trainers: trainers.filter(t => t.id === userId),
        clients: clients.filter(c => c.trainerId === userId)
      };
    }
    
    // Админы и менеджеры видят все данные
    return { sessions, trainers, clients };
  }

  static filterByDateRange(sessions: any[], startDate: Date, endDate: Date): any[] {
    return sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  static filterByStatus(sessions: any[], statuses: string[]): any[] {
    return sessions.filter(session => statuses.includes(session.status));
  }

  static filterBySessionType(sessions: any[], types: string[]): any[] {
    return sessions.filter(session => types.includes(session.type));
  }

  static filterByTrainer(sessions: any[], trainerIds: string[]): any[] {
    return sessions.filter(session => trainerIds.includes(session.trainerId));
  }

  static filterByClient(sessions: any[], clientIds: string[]): any[] {
    return sessions.filter(session => clientIds.includes(session.clientId));
  }

  static filterByTimeRange(sessions: any[], startTime: string, endTime: string): any[] {
    return sessions.filter(session => {
      const sessionTime = session.startTime;
      return sessionTime >= startTime && sessionTime <= endTime;
    });
  }

  static filterByWeekday(sessions: any[], weekdays: number[]): any[] {
    return sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return weekdays.includes(sessionDate.getDay());
    });
  }

  static filterActiveOnly<T extends { status: string }>(items: T[]): T[] {
    return items.filter(item => item.status === 'active');
  }
}

// Утилиты
