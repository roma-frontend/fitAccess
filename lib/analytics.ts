// lib/analytics.ts
import { Client, Session } from '@/lib/mock-data';

export interface ExtendedClient extends Client {
  // добавьте дополнительные поля если нужно
}

export interface ClientSegment {
  name: string;
  count: number;
  percentage: number;
  characteristics: string[];
  averageSessions: number;
  revenue: number;
}

export interface ClientInsight {
  type: 'trend' | 'warning' | 'opportunity';
  title: string;
  description: string;
  value?: number;
  change?: number;
}

export const analyzeClientSegments = (
  clients: ExtendedClient[], 
  sessions: Session[]
): {
  segments: ClientSegment[];
  insights: ClientInsight[];
} => {
  // Анализ по типу членства
  const membershipSegments = analyzeMembershipSegments(clients, sessions);
  
  // Анализ по активности
  const activitySegments = analyzeActivitySegments(clients, sessions);
  
  // Анализ по тренерам
  const trainerSegments = analyzeTrainerSegments(clients, sessions);
  
  // Генерация инсайтов
  const insights = generateInsights(clients, sessions);
  
  return {
    segments: [...membershipSegments, ...activitySegments, ...trainerSegments],
    insights
  };
};

const analyzeMembershipSegments = (
  clients: ExtendedClient[], 
  sessions: Session[]
): ClientSegment[] => {
  const membershipTypes = ['basic', 'premium', 'vip'] as const;
  
  return membershipTypes.map(type => {
    const typeClients = clients.filter(c => c.membershipType === type);
    const typeSessions = sessions.filter(s => 
      typeClients.some(c => c.id === s.clientId)
    );
    
    const completedSessions = typeSessions.filter(s => s.status === 'completed');
    const averageSessions = typeClients.length > 0 
      ? completedSessions.length / typeClients.length 
      : 0;
    
    // Примерный расчет дохода (нужно адаптировать под вашу логику)
    const revenue = completedSessions.reduce((sum, session) => {
      // Здесь должна быть ваша логика расчета дохода
      return sum + 1500; // примерная стоимость сессии
    }, 0);
    
    return {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} членство`,
      count: typeClients.length,
      percentage: Math.round((typeClients.length / clients.length) * 100),
      characteristics: getCharacteristics(type),
      averageSessions: Math.round(averageSessions * 10) / 10,
      revenue
    };
  });
};

const analyzeActivitySegments = (
  clients: ExtendedClient[], 
  sessions: Session[]
): ClientSegment[] => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const activeClients = clients.filter(client => {
    const clientSessions = sessions.filter(s => 
      s.clientId === client.id && 
      s.status === 'completed' &&
      new Date(s.date) >= thirtyDaysAgo
    );
    return clientSessions.length > 0;
  });
  
  const inactiveClients = clients.filter(client => 
    !activeClients.some(ac => ac.id === client.id)
  );
  
  return [
    {
      name: 'Активные клиенты',
      count: activeClients.length,
      percentage: Math.round((activeClients.length / clients.length) * 100),
      characteristics: ['Регулярные тренировки', 'Высокая мотивация'],
      averageSessions: calculateAverageSessions(activeClients, sessions),
      revenue: calculateRevenue(activeClients, sessions)
    },
    {
      name: 'Неактивные клиенты',
      count: inactiveClients.length,
      percentage: Math.round((inactiveClients.length / clients.length) * 100),
      characteristics: ['Требуют внимания', 'Риск оттока'],
      averageSessions: 0,
      revenue: 0
    }
  ];
};

const analyzeTrainerSegments = (
  clients: ExtendedClient[], 
  sessions: Session[]
): ClientSegment[] => {
  const trainers = [...new Set(clients.map(c => c.trainerId).filter(Boolean))];
  
  return trainers.map(trainerId => {
    const trainerClients = clients.filter(c => c.trainerId === trainerId);
    const trainerSessions = sessions.filter(s => s.trainerId === trainerId);
    
    return {
      name: `Клиенты тренера ${trainerId}`,
      count: trainerClients.length,
      percentage: Math.round((trainerClients.length / clients.length) * 100),
      characteristics: ['Персональный подход'],
      averageSessions: calculateAverageSessions(trainerClients, trainerSessions),
      revenue: calculateRevenue(trainerClients, trainerSessions)
    };
  });
};

const generateInsights = (
  clients: ExtendedClient[], 
  sessions: Session[]
): ClientInsight[] => {
  const insights: ClientInsight[] = [];
  
  // Анализ роста клиентской базы
  const thisMonth = new Date();
  const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);
  
  const thisMonthClients = clients.filter(c => 
    new Date(c.joinDate) >= lastMonth
  ).length;
  
  if (thisMonthClients > 0) {
    insights.push({
      type: 'trend',
      title: 'Рост клиентской базы',
      description: `Привлечено ${thisMonthClients} новых клиентов в этом месяце`,
      value: thisMonthClients
    });
  }
  
  // Анализ отмен
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
  const totalSessions = sessions.length;
  const cancellationRate = (cancelledSessions / totalSessions) * 100;
  
  if (cancellationRate > 15) {
    insights.push({
      type: 'warning',
      title: 'Высокий уровень отмен',
      description: `${cancellationRate.toFixed(1)}% сессий отменяется`,
      value: cancellationRate
    });
  }
  
  // Анализ популярных времен
  const timeSlots = sessions.reduce((acc, session) => {
    const hour = session.startTime.split(':')[0];
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularHour = Object.entries(timeSlots)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (popularHour) {
    insights.push({
      type: 'opportunity',
      title: 'Популярное время',
      description: `Наиболее востребованное время: ${popularHour[0]}:00`,
      value: parseInt(popularHour[0])
    });
  }
  
  return insights;
};

const getCharacteristics = (membershipType: string): string[] => {
  switch (membershipType) {
    case 'basic':
      return ['Ограниченный доступ', 'Базовые услуги'];
    case 'premium':
      return ['Расширенный доступ', 'Персональные тренировки'];
    case 'vip':
      return ['Полный доступ', 'Премиум услуги', 'Приоритетное обслуживание'];
    default:
      return [];
  }
};

const calculateAverageSessions = (
  clients: ExtendedClient[], 
  sessions: Session[]
): number => {
  if (clients.length === 0) return 0;
  
  const completedSessions = sessions.filter(s => 
    s.status === 'completed' && 
    clients.some(c => c.id === s.clientId)
  );
  
  return Math.round((completedSessions.length / clients.length) * 10) / 10;
};

const calculateRevenue = (
  clients: ExtendedClient[], 
  sessions: Session[]
): number => {
  const completedSessions = sessions.filter(s => 
    s.status === 'completed' && 
    clients.some(c => c.id === s.clientId)
  );
  
  // Примерный расчет дохода (адаптируйте под свою логику)
  return completedSessions.length * 1500; // 1500 рублей за сессию
};

// Дополнительные аналитические функции
export const getClientRetentionRate = (
  clients: ExtendedClient[], 
  sessions: Session[]
): number => {
  const activeClients = clients.filter(client => {
    const clientSessions = sessions.filter(s => 
      s.clientId === client.id && s.status === 'completed'
    );
    return clientSessions.length > 0;
  });
  
  return clients.length > 0 ? (activeClients.length / clients.length) * 100 : 0;
};

export const getAverageSessionsPerClient = (
  clients: ExtendedClient[], 
  sessions: Session[]
): number => {
  if (clients.length === 0) return 0;
  
  const completedSessions = sessions.filter(s => s.status === 'completed');
  return completedSessions.length / clients.length;
};

export const getRevenueByPeriod = (
  sessions: Session[], 
  startDate: string, 
  endDate: string
): number => {
  const periodSessions = sessions.filter(s => 
    s.status === 'completed' &&
    s.date >= startDate && 
    s.date <= endDate
  );
  
  return periodSessions.length * 1500; // примерная стоимость
};

export const getTopPerformingTrainers = (
  sessions: Session[], 
  limit: number = 5
): Array<{ trainerId: string; sessionCount: number; revenue: number }> => {
  const trainerStats = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, session) => {
      if (!acc[session.trainerId]) {
        acc[session.trainerId] = { sessionCount: 0, revenue: 0 };
      }
      acc[session.trainerId].sessionCount++;
      acc[session.trainerId].revenue += 1500; // примерная стоимость
      return acc;
    }, {} as Record<string, { sessionCount: number; revenue: number }>);
  
  return Object.entries(trainerStats)
    .map(([trainerId, stats]) => ({ trainerId, ...stats }))
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, limit);
};
