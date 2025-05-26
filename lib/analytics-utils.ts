// lib/analytics-utils.ts
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';
import { UserRole } from '@/lib/permissions';

// Интерфейсы для аналитики
export interface AnalyticsFilters {
  trainerId?: string;
  clientId?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface PeriodConfig {
  type: 'day' | 'week' | 'month' | 'quarter' | 'year';
  start: Date;
  end: Date;
}

export interface BasicMetrics {
  total: number;
  completed: number;
  cancelled: number;
  scheduled: number;
  noShow: number;
  completionRate: number;
  cancellationRate: number;
  revenue: number;
  uniqueClients: number;
}

export interface AnalyticsResponse<T = any> {
  success: boolean;
  data: T;
  meta: {
    generatedAt: string;
    [key: string]: any;
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Утилиты для работы с аналитикой
export class AnalyticsService {
  
  static filterSessionsByUser(userRole: UserRole, userId: string) {
    let sessions = [...mockSessions];
    let trainers = [...mockTrainers];
    let clients = [...mockClients];

    if (userRole === 'trainer') {
      sessions = sessions.filter(s => s.trainerId === userId);
      trainers = trainers.filter(t => t.id === userId);
      clients = clients.filter(c => c.trainerId === userId);
    }

    return { sessions, trainers, clients };
  }

  static filterSessionsByPeriod(sessions: any[], period: PeriodConfig): any[] {
    return sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= period.start && sessionDate <= period.end;
    });
  }

  static applyFilters(sessions: any[], filters: AnalyticsFilters): any[] {
    let filtered = [...sessions];

    if (filters.trainerId) {
      filtered = filtered.filter(s => s.trainerId === filters.trainerId);
    }

    if (filters.clientId) {
      filtered = filtered.filter(s => s.clientId === filters.clientId);
    }

    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(s => s.type === filters.type);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate >= start;
      });
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate <= end;
      });
    }

    return filtered;
  }

  static calculateBasicMetrics(sessions: any[]): BasicMetrics {
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
      cancellationRate: sessions.length > 0 ? Math.round((cancelled.length / sessions.length) * 100) : 0,
      revenue: completed.length * 2000,
      uniqueClients: new Set(sessions.map(s => s.clientId)).size
    };
  }

  static calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  static generatePeriodConfig(periodType: string): PeriodConfig {
    const now = new Date();
    let start: Date;

    switch (periodType) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      type: periodType as PeriodConfig['type'],
      start,
      end: now
    };
  }

  static formatAnalyticsResponse<T = any>(data: T, meta: Record<string, any> = {}): AnalyticsResponse<T> {
    return {
      success: true,
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        ...meta
      }
    };
  }

  static validateDateRange(startDate: string, endDate: string): ValidationResult {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: 'Некорректный формат даты' };
    }

    if (start >= end) {
      return { valid: false, error: 'Дата начала должна быть раньше даты окончания' };
    }

    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 год
    if (end.getTime() - start.getTime() > maxRange) {
      return { valid: false, error: 'Максимальный период для анализа - 1 год' };
    }

    return { valid: true };
  }

  static validatePeriodType(period: string): period is PeriodConfig['type'] {
    const validPeriods: PeriodConfig['type'][] = ['day', 'week', 'month', 'quarter', 'year'];
    return validPeriods.includes(period as PeriodConfig['type']);
  }

  static calculateSessionPrice(sessionType: string): number {
    const prices: Record<string, number> = {
      personal: 2000,
      group: 1500,
      consultation: 1000
    };
    
    return prices[sessionType] || 2000;
  }

  static calculateRevenueByType(sessions: any[]): Record<string, number> {
    const revenue: Record<string, number> = {};
    
    sessions
      .filter(s => s.status === 'completed')
      .forEach(session => {
        const price = this.calculateSessionPrice(session.type);
        revenue[session.type] = (revenue[session.type] || 0) + price;
      });

    return revenue;
  }

  static groupSessionsByDate(sessions: any[], groupBy: 'day' | 'week' | 'month' = 'day'): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    sessions.forEach(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      let groupKey: string;

      switch (groupBy) {
        case 'week':
          const weekStart = new Date(sessionDate);
          weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          groupKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          groupKey = session.date;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(session);
    });

    return grouped;
  }

  static calculateUtilizationRate(sessions: any[], maxSessionsPerDay: number = 8): number {
    if (sessions.length === 0) return 0;

    const dates = new Set(sessions.map(s => s.date));
    const totalPossibleSessions = dates.size * maxSessionsPerDay;
    
    return Math.round((sessions.length / totalPossibleSessions) * 100);
  }

  static getTopClients(sessions: any[], clients: any[], limit: number = 5): Array<{
    id: string;
    name: string;
    sessionsCount: number;
    completedSessions: number;
    revenue: number;
    lastSessionDate: string | null;
  }> {
    const clientStats = clients.map(client => {
      const clientSessions = sessions.filter(s => s.clientId === client.id);
      const completedSessions = clientSessions.filter(s => s.status === 'completed');
      
      const lastSession = clientSessions.length > 0 
        ? clientSessions
            .sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime())[0]
        : null;

      return {
        id: client.id,
        name: client.name,
        sessionsCount: clientSessions.length,
        completedSessions: completedSessions.length,
        revenue: completedSessions.reduce((sum, session) => sum + this.calculateSessionPrice(session.type), 0),
        lastSessionDate: lastSession ? lastSession.date : null
      };
    });

    return clientStats
      .sort((a, b) => b.completedSessions - a.completedSessions)
      .slice(0, limit);
  }

  static calculateClientRetention(currentSessions: any[], previousSessions: any[]): {
    total: number;
    returning: number;
    new: number;
    retentionRate: number;
  } {
    const currentClients = new Set(currentSessions.map(s => s.clientId));
    const previousClients = new Set(previousSessions.map(s => s.clientId));

    const returningClients = [...currentClients].filter(id => previousClients.has(id));
    const newClients = [...currentClients].filter(id => !previousClients.has(id));

    return {
      total: currentClients.size,
      returning: returningClients.length,
      new: newClients.length,
      retentionRate: previousClients.size > 0 
        ? Math.round((returningClients.length / previousClients.size) * 100)
        : 0
    };
  }

  static generateTimeSlots(startHour: number = 8, endHour: number = 22): string[] {
    const slots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    
    return slots;
  }

  static calculatePeakHours(sessions: any[]): Array<{
    hour: number;
    count: number;
    percentage: number;
  }> {
    const hourCounts: Record<number, number> = {};
    
    sessions.forEach(session => {
      const hour = parseInt(session.startTime.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const totalSessions = sessions.length;
    
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  static formatErrorResponse(error: string, statusCode: number = 400): {
    success: false;
    error: string;
    statusCode: number;
  } {
    return {
      success: false,
      error,
      statusCode
    };
  }

  static isValidSessionStatus(status: string): boolean {
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    return validStatuses.includes(status);
  }

  static isValidSessionType(type: string): boolean {
    const validTypes = ['personal', 'group', 'consultation'];
    return validTypes.includes(type);
  }
}

// Константы для аналитики
export const ANALYTICS_CONSTANTS = {
  SESSION_PRICES: {
    personal: 2000,
    group: 1500,
    consultation: 1000
  },
  
  SESSION_STATUSES: ['scheduled', 'completed', 'cancelled', 'no-show'] as const,
  
  SESSION_TYPES: ['personal', 'group', 'consultation'] as const,
  
  PERIOD_TYPES: ['day', 'week', 'month', 'quarter', 'year'] as const,
  
  DEFAULT_WORKING_HOURS: {
    start: 8,
    end: 22
  },
  
  MAX_SESSIONS_PER_DAY: 8,
  
  PERFORMANCE_THRESHOLDS: {
    excellent: 90,
    good: 75,
    average: 60,
    poor: 0
  }
} as const;

// Типы на основе констант
export type SessionStatus = typeof ANALYTICS_CONSTANTS.SESSION_STATUSES[number];
export type SessionType = typeof ANALYTICS_CONSTANTS.SESSION_TYPES[number];
export type PeriodType = typeof ANALYTICS_CONSTANTS.PERIOD_TYPES[number];
