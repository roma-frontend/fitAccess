// app/api/clients/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockSessions, Client, Session } from '@/lib/mock-data';

// Исправленный интерфейс для расширенного клиента
interface ExtendedClient extends Omit<Client, 'status'> {
  status: 'active' | 'inactive' | 'suspended' | 'trial';
}

interface ClientActivityStats {
  clientId: string;
  clientName: string;
  totalSessions: number;
  completedSessions: number;
  lastSession: string | null;
}

interface DailyClientStats {
  date: string;
  newClients: number;
  activeClients: number;
  trialClients: number;
}

interface ClientStatusStats {
  active: number;
  inactive: number;
  trial: number;
  suspended: number;
}

interface MembershipStats {
  basic: number;
  premium: number;
  vip: number;
}

interface ClientOverviewStats {
  total: number;
  newThisPeriod: number;
  activeClients: number;
  inactiveClients: number;
  avgSessionsPerClient: number;
}

interface ActivityStatsData {
  topActive: ClientActivityStats[];
  inactive: number;
  totalSessions: number;
  completedSessions: number;
}

interface TrendsData {
  daily: DailyClientStats[];
  period: string;
  startDate: string;
  endDate: string;
}

interface ClientStatsResponse {
  overview: ClientOverviewStats;
  status: ClientStatusStats;
  membership: MembershipStats;
  activity: ActivityStatsData;
  trends: TrendsData;
}

// GET /api/clients/stats - Получение статистики по клиентам
export const GET = withPermissions(
  { resource: 'clients', action: 'read' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('📊 API: получение статистики клиентов');
      
      const { user } = req;
      const url = new URL(req.url);
      const period = url.searchParams.get('period') || 'month';
      const trainerId = url.searchParams.get('trainerId');

      // Проверяем, что mockClients - это массив
      if (!Array.isArray(mockClients)) {
        console.error('mockClients is not an array:', mockClients);
        return NextResponse.json(
          { success: false, error: 'Ошибка данных клиентов' },
          { status: 500 }
        );
      }

      // Проверяем, что mockSessions - это массив
      if (!Array.isArray(mockSessions)) {
        console.error('mockSessions is not an array:', mockSessions);
        return NextResponse.json(
          { success: false, error: 'Ошибка данных сессий' },
          { status: 500 }
        );
      }

      // Приведение типов с добавлением поддержки 'trial' статуса
      let clients: ExtendedClient[] = [...mockClients].map(client => ({
        ...client,
        status: (client.status === 'inactive' && Math.random() > 0.8) ? 'trial' as const : client.status as 'active' | 'inactive' | 'suspended' | 'trial'
      }));
      
      let sessions: Session[] = [...mockSessions];

      // Фильтрация по правам доступа
      if (user.role === 'trainer') {
        clients = clients.filter((client: ExtendedClient) => client.trainerId === user.id);
        sessions = sessions.filter((session: Session) => session.trainerId === user.id);
      } else if (trainerId && (user.role === 'admin' || user.role === 'manager')) {
        clients = clients.filter((client: ExtendedClient) => client.trainerId === trainerId);
        sessions = sessions.filter((session: Session) => session.trainerId === trainerId);
      }

      const now = new Date();
      let startDate: Date;

      // Определение периода
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          startDate = weekStart;
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Фильтрация клиентов по периоду
      const periodClients = clients.filter((client: ExtendedClient) => 
        new Date(client.createdAt) >= startDate
      );

      // Статистика по статусам
      const statusStats: ClientStatusStats = {
        active: clients.filter((c: ExtendedClient) => c.status === 'active').length,
        inactive: clients.filter((c: ExtendedClient) => c.status === 'inactive').length,
        trial: clients.filter((c: ExtendedClient) => c.status === 'trial').length,
        suspended: clients.filter((c: ExtendedClient) => c.status === 'suspended').length
      };

      // Статистика по типам членства
      const membershipStats: MembershipStats = {
        basic: clients.filter((c: ExtendedClient) => c.membershipType === 'basic').length,
        premium: clients.filter((c: ExtendedClient) => c.membershipType === 'premium').length,
        vip: clients.filter((c: ExtendedClient) => c.membershipType === 'vip').length
      };

      // Статистика по активности
      const activityStats: ClientActivityStats[] = clients.map((client: ExtendedClient) => {
        const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
        const completedSessions = clientSessions.filter((s: Session) => s.status === 'completed');
        
        return {
          clientId: client.id,
          clientName: client.name,
          totalSessions: clientSessions.length,
          completedSessions: completedSessions.length,
          lastSession: completedSessions.length > 0 
            ? completedSessions
                .sort((a: Session, b: Session) => 
                  new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
                )[0].date
            : null
        };
      });

      // Топ активных клиентов
      const topActiveClients = activityStats
        .sort((a, b) => b.completedSessions - a.completedSessions)
        .slice(0, 10);

      // Клиенты без активности
      const inactiveClientsCount = activityStats
        .filter(client => client.completedSessions === 0)
        .length;

      // Новые клиенты за период
      const newClientsCount = periodClients.length;

      // Динамика по дням (для графика)
      const dailyStats = getDailyClientStats(clients, startDate, now);

      // Средние показатели
      const avgSessionsPerClient = clients.length > 0 
        ? Math.round(sessions.length / clients.length * 100) / 100
        : 0;

      // Дополнительные метрики
      const additionalMetrics = calculateAdditionalMetrics(clients, sessions, startDate, now);

      const stats: ClientStatsResponse = {
        overview: {
          total: clients.length,
          newThisPeriod: newClientsCount,
          activeClients: statusStats.active,
          inactiveClients: inactiveClientsCount,
          avgSessionsPerClient
        },
        status: statusStats,
        membership: membershipStats,
        activity: {
          topActive: topActiveClients,
          inactive: inactiveClientsCount,
          totalSessions: sessions.length,
          completedSessions: sessions.filter((s: Session) => s.status === 'completed').length
        },
        trends: {
          daily: dailyStats,
          period: period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      };

      console.log(`✅ API: статистика для ${clients.length} клиентов получена`);

      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          additional: additionalMetrics
        },
        meta: {
          generatedAt: now.toISOString(),
          requestedBy: user.email,
          period: period,
          trainerId: trainerId || null,
          clientsCount: clients.length
        }
      });

    } catch (error: any) {
      console.error('💥 API: ошибка получения статистики клиентов:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения статистики клиентов' },
        { status: 500 }
      );
    }
  }
);

// Вспомогательная функция для получения ежедневной статистики
function getDailyClientStats(clients: ExtendedClient[], startDate: Date, endDate: Date): DailyClientStats[] {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('getDailyClientStats: clients is not an array:', clients);
    return [];
  }

  const dailyStats: DailyClientStats[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayStr = currentDate.toISOString().split('T')[0];
    const dayClients = clients.filter((client: ExtendedClient) => 
      client.createdAt.split('T')[0] === dayStr
    );

    dailyStats.push({
      date: dayStr,
      newClients: dayClients.length,
      activeClients: dayClients.filter((c: ExtendedClient) => c.status === 'active').length,
      trialClients: dayClients.filter((c: ExtendedClient) => c.status === 'trial').length
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyStats;
}

// Функция для расчета дополнительных метрик
function calculateAdditionalMetrics(
  clients: ExtendedClient[], 
  sessions: Session[], 
  startDate: Date, 
  endDate: Date
): {
  retention: {
    rate: number;
    byMembership: Record<string, number>;
  };
  engagement: {
    averageSessionsPerActiveClient: number;
    clientsWithRecentActivity: number;
    clientsWithoutRecentActivity: number;
  };
  conversion: {
    trialToActive: number;
    trialToActiveRate: number;
  };
  churn: {
    rate: number;
    suspendedClients: number;
    inactiveClients: number;
  };
  revenue: {
    estimatedMonthlyRevenue: number;
    revenueByMembership: Record<string, number>;
  };
  demographics: {
    byMembership: Record<string, number>;
    averageClientAge: number;
    newVsReturning: {
      new: number;
      returning: number;
    };
  };
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('calculateAdditionalMetrics: clients is not an array:', clients);
    return {
      retention: { rate: 0, byMembership: {} },
      engagement: { averageSessionsPerActiveClient: 0, clientsWithRecentActivity: 0, clientsWithoutRecentActivity: 0 },
      conversion: { trialToActive: 0, trialToActiveRate: 0 },
      churn: { rate: 0, suspendedClients: 0, inactiveClients: 0 },
      revenue: { estimatedMonthlyRevenue: 0, revenueByMembership: {} },
      demographics: { byMembership: {}, averageClientAge: 0, newVsReturning: { new: 0, returning: 0 } }
    };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('calculateAdditionalMetrics: sessions is not an array:', sessions);
    sessions = [];
  }

  const activeClients = clients.filter(c => c.status === 'active');
  const trialClients = clients.filter(c => c.status === 'trial');
  const suspendedClients = clients.filter(c => c.status === 'suspended');
  const inactiveClients = clients.filter(c => c.status === 'inactive');

  // Расчет retention rate
  const totalClients = clients.length;
  const retainedClients = activeClients.length;
  const retentionRate = totalClients > 0 ? Math.round((retainedClients / totalClients) * 100) : 0;

  // Retention по типам членства
  const retentionByMembership: Record<string, number> = {};
  ['basic', 'premium', 'vip'].forEach(membershipType => {
    const membershipClients = clients.filter(c => c.membershipType === membershipType);
    const activeMembershipClients = membershipClients.filter(c => c.status === 'active');
    retentionByMembership[membershipType] = membershipClients.length > 0 
      ? Math.round((activeMembershipClients.length / membershipClients.length) * 100)
      : 0;
  });

  // Engagement метрики
  const recentActivityThreshold = new Date();
  recentActivityThreshold.setDate(recentActivityThreshold.getDate() - 30);

  const clientsWithRecentActivity = clients.filter(client => {
    const clientSessions = sessions.filter(s => s.clientId === client.id);
    const recentSessions = clientSessions.filter(s => 
      new Date(`${s.date}T${s.startTime}`) >= recentActivityThreshold
    );
    return recentSessions.length > 0;
  }).length;

  const averageSessionsPerActiveClient = activeClients.length > 0
    ? Math.round((sessions.filter(s => s.status === 'completed').length / activeClients.length) * 100) / 100
    : 0;

  // Conversion метрики
  const trialToActiveConversions = clients.filter(c => 
    c.status === 'active' && 
    new Date(c.createdAt) >= startDate &&
    new Date(c.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const trialToActiveRate = trialClients.length > 0 
    ? Math.round((trialToActiveConversions / trialClients.length) * 100)
    : 0;

  // Churn rate
  const churnedClients = suspendedClients.length + inactiveClients.length;
  const churnRate = totalClients > 0 ? Math.round((churnedClients / totalClients) * 100) : 0;

  // Revenue estimation
  const membershipPrices = { basic: 2000, premium: 4000, vip: 8000 };
  const estimatedMonthlyRevenue = activeClients.reduce((total: number, client: ExtendedClient) => {
    const price = membershipPrices[client.membershipType as keyof typeof membershipPrices] || 0;
    return total + price;
  }, 0);

  const revenueByMembership: Record<string, number> = {};
  Object.keys(membershipPrices).forEach(membershipType => {
    const membershipActiveClients = activeClients.filter(c => c.membershipType === membershipType);
    const price = membershipPrices[membershipType as keyof typeof membershipPrices];
    revenueByMembership[membershipType] = membershipActiveClients.length * price;
  });

  // Demographics
  const membershipDistribution: Record<string, number> = {};
  ['basic', 'premium', 'vip'].forEach(membershipType => {
    membershipDistribution[membershipType] = clients.filter(c => c.membershipType === membershipType).length;
  });

  // Новые vs возвращающиеся клиенты
  const periodStart = new Date(startDate);
  const newClients = clients.filter(c => new Date(c.createdAt) >= periodStart).length;
  const returningClients = clients.length - newClients;

  // Средний "возраст" клиента
  const now = new Date();
  const averageClientAge = clients.length > 0
    ? Math.round(clients.reduce((sum: number, client: ExtendedClient) => {
        const clientAge = (now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + clientAge;
      }, 0) / clients.length)
    : 0;

  return {
    retention: {
      rate: retentionRate,
      byMembership: retentionByMembership
    },
    engagement: {
      averageSessionsPerActiveClient,
      clientsWithRecentActivity,
      clientsWithoutRecentActivity: clients.length - clientsWithRecentActivity
    },
    conversion: {
      trialToActive: trialToActiveConversions,
      trialToActiveRate
    },
    churn: {
      rate: churnRate,
      suspendedClients: suspendedClients.length,
      inactiveClients: inactiveClients.length
    },
    revenue: {
      estimatedMonthlyRevenue,
      revenueByMembership
    },
    demographics: {
      byMembership: membershipDistribution,
      averageClientAge,
      newVsReturning: {
        new: newClients,
        returning: returningClients
      }
    }
  };
}

// Функция для анализа клиентских сегментов - ИСПРАВЛЕНО
export function analyzeClientSegments(clients: ExtendedClient[], sessions: Session[]): {
  segments: Array<{
    name: string;
    count: number;
    percentage: number;
    characteristics: string[];
    averageSessions: number;
    revenue: number;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    segment: string;
  }>;
} {
  const segments = [];
  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    segment: string;
  }> = [];

  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('analyzeClientSegments: clients is not an array:', clients);
    return { segments: [], insights: [] };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('analyzeClientSegments: sessions is not an array:', sessions);
    sessions = [];
  }

  // Сегмент "VIP клиенты"
  const vipClients = clients.filter((c: ExtendedClient) => c.membershipType === 'vip' && c.status === 'active');
  const vipSessions = sessions.filter((s: Session) => vipClients.some((c: ExtendedClient) => c.id === s.clientId));
  
  segments.push({
    name: 'VIP клиенты',
    count: vipClients.length,
    percentage: clients.length > 0 ? Math.round((vipClients.length / clients.length) * 100) : 0,
    characteristics: ['Премиум членство', 'Высокая лояльность', 'Максимальный доход'],
    averageSessions: vipClients.length > 0 ? Math.round(vipSessions.length / vipClients.length * 10) / 10 : 0,
    revenue: vipClients.length * 8000
  });

  // Сегмент "Активные пользователи"
  const activeUsers = clients.filter((c: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === c.id && s.status === 'completed');
    return clientSessions.length >= 4;
  });
  
  segments.push({
    name: 'Активные пользователи',
    count: activeUsers.length,
    percentage: clients.length > 0 ? Math.round((activeUsers.length / clients.length) * 100) : 0,
    characteristics: ['Регулярные тренировки', 'Высокая вовлеченность'],
    averageSessions: activeUsers.length > 0 ? 
      Math.round(sessions.filter((s: Session) => activeUsers.some((c: ExtendedClient) => c.id === s.clientId)).length / activeUsers.length * 10) / 10 : 0,
    revenue: activeUsers.reduce((sum: number, client: ExtendedClient) => {
      const price = client.membershipType === 'vip' ? 8000 : client.membershipType === 'premium' ? 4000 : 2000;
      return sum + price;
    }, 0)
  });

  // Сегмент "Новички"
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newbies = clients.filter((c: ExtendedClient) => new Date(c.createdAt) >= thirtyDaysAgo);
  
  segments.push({
    name: 'Новички',
    count: newbies.length,
    percentage: clients.length > 0 ? Math.round((newbies.length / clients.length) * 100) : 0,
    characteristics: ['Недавняя регистрация', 'Период адаптации'],
    averageSessions: newbies.length > 0 ? 
      Math.round(sessions.filter((s: Session) => newbies.some((c: ExtendedClient) => c.id === s.clientId)).length / newbies.length * 10) / 10 : 0,
    revenue: newbies.reduce((sum: number, client: ExtendedClient) => {
      const price = client.membershipType === 'vip' ? 8000 : client.membershipType === 'premium' ? 4000 : 2000;
      return sum + price;
    }, 0)
  });

  // Сегмент "Группа риска"
  const riskClients = clients.filter((c: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === c.id);
    const recentSessions = clientSessions.filter((s: Session) => {
      const sessionDate = new Date(`${s.date}T${s.startTime}`);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return sessionDate >= twoWeeksAgo;
    });
    return recentSessions.length === 0 && c.status === 'active';
  });

  segments.push({
    name: 'Группа риска',
    count: riskClients.length,
    percentage: clients.length > 0 ? Math.round((riskClients.length / clients.length) * 100) : 0,
    characteristics: ['Нет активности 2+ недели', 'Риск оттока'],
    averageSessions: 0,
    revenue: riskClients.reduce((sum: number, client: ExtendedClient) => {
      const price = client.membershipType === 'vip' ? 8000 : client.membershipType === 'premium' ? 4000 : 2000;
      return sum + price;
    }, 0)
  });

  // Сегмент "Пробные клиенты"
  const trialClients = clients.filter((c: ExtendedClient) => c.status === 'trial');
  
  segments.push({
    name: 'Пробные клиенты',
    count: trialClients.length,
    percentage: clients.length > 0 ? Math.round((trialClients.length / clients.length) * 100) : 0,
    characteristics: ['Пробный период', 'Потенциал конверсии'],
    averageSessions: trialClients.length > 0 ? 
      Math.round(sessions.filter((s: Session) => trialClients.some((c: ExtendedClient) => c.id === s.clientId)).length / trialClients.length * 10) / 10 : 0,
    revenue: trialClients.length * 1000 // предполагаем сниженную стоимость для пробного периода
  });

  // Генерация инсайтов
  if (vipClients.length > 0) {
    insights.push({
      type: 'success',
      title: 'VIP сегмент',
      description: `${vipClients.length} VIP клиентов приносят ${(vipClients.length * 8000).toLocaleString('ru-RU')} ₽ в месяц`,
      segment: 'VIP клиенты'
    });
  }

  if (riskClients.length > clients.length * 0.2) {
    insights.push({
      type: 'warning',
      title: 'Высокий риск оттока',
      description: `${riskClients.length} клиентов (${Math.round((riskClients.length / clients.length) * 100)}%) не проявляют активность`,
      segment: 'Группа риска'
    });
  }

  if (newbies.length > clients.length * 0.3) {
    insights.push({
      type: 'info',
      title: 'Приток новых клиентов',
      description: `${newbies.length} новых клиентов за последний месяц - хороший показатель роста`,
      segment: 'Новички'
    });
  }

  if (trialClients.length > 0) {
    insights.push({
      type: 'info',
      title: 'Пробные клиенты',
      description: `${trialClients.length} клиентов в пробном периоде - возможность для конверсии`,
      segment: 'Пробные клиенты'
    });
  }

  if (activeUsers.length > clients.length * 0.4) {
    insights.push({
      type: 'success',
      title: 'Высокая активность',
      description: `${Math.round((activeUsers.length / clients.length) * 100)}% клиентов показывают высокую активность`,
      segment: 'Активные пользователи'
    });
  }

  return { segments, insights };
}

// Функция для прогнозирования оттока клиентов
export function predictClientChurn(clients: ExtendedClient[], sessions: Session[]): {
  churnPrediction: Array<{
    clientId: string;
    clientName: string;
    churnRisk: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: string[];
    recommendations: string[];
  }>;
  summary: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    totalRevenueAtRisk: number;
  };
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('predictClientChurn: clients is not an array:', clients);
    return {
      churnPrediction: [],
      summary: { highRisk: 0, mediumRisk: 0, lowRisk: 0, totalRevenueAtRisk: 0 }
    };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('predictClientChurn: sessions is not an array:', sessions);
    sessions = [];
  }

  const churnPrediction = clients.map((client: ExtendedClient) => {
    let riskScore = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
    const completedSessions = clientSessions.filter((s: Session) => s.status === 'completed');
    const cancelledSessions = clientSessions.filter((s: Session) => s.status === 'cancelled');

    // Фактор 1: Отсутствие активности
    const lastSession = completedSessions.length > 0 
      ? Math.max(...completedSessions.map((s: Session) => new Date(`${s.date}T${s.startTime}`).getTime()))
      : 0;
    
    const daysSinceLastSession = lastSession > 0 
      ? (Date.now() - lastSession) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceLastSession > 30) {
      riskScore += 40;
      factors.push('Нет активности более 30 дней');
      recommendations.push('Связаться с клиентом для выяснения причин');
    } else if (daysSinceLastSession > 14) {
      riskScore += 20;
      factors.push('Нет активности более 2 недель');
      recommendations.push('Предложить персональную программу');
    }

    // Фактор 2: Высокий процент отмен
    const cancellationRate = clientSessions.length > 0 
      ? (cancelledSessions.length / clientSessions.length) * 100 
      : 0;

    if (cancellationRate > 50) {
      riskScore += 30;
      factors.push('Высокий процент отмен сессий');
      recommendations.push('Пересмотреть расписание и подход к тренировкам');
        } else if (cancellationRate > 25) {
      riskScore += 15;
      factors.push('Умеренный процент отмен');
      recommendations.push('Обсудить удобное время для тренировок');
    }

    // Фактор 3: Низкая частота тренировок
    const sessionsPerWeek = completedSessions.length > 0 
      ? completedSessions.length / 4
      : 0;

    if (sessionsPerWeek < 1) {
      riskScore += 25;
      factors.push('Низкая частота тренировок');
      recommendations.push('Мотивировать на регулярные занятия');
    }

    // Фактор 4: Статус клиента
    if (client.status === 'trial') {
      riskScore += 20;
      factors.push('Пробный период');
      recommendations.push('Активно работать над конверсией');
    } else if (client.status === 'inactive') {
      riskScore += 50;
      factors.push('Неактивный статус');
      recommendations.push('Реактивационная кампания');
    } else if (client.status === 'suspended') {
      riskScore += 60;
      factors.push('Приостановленный статус');
      recommendations.push('Срочная работа с клиентом');
    }

    // Фактор 5: Тип членства
    if (client.membershipType === 'basic') {
      riskScore += 10;
      factors.push('Базовое членство');
      recommendations.push('Предложить апгрейд до премиум');
    }

    // Определение уровня риска
    let churnRisk: 'low' | 'medium' | 'high';
    if (riskScore >= 70) {
      churnRisk = 'high';
    } else if (riskScore >= 40) {
      churnRisk = 'medium';
    } else {
      churnRisk = 'low';
    }

    return {
      clientId: client.id,
      clientName: client.name,
      churnRisk,
      riskScore: Math.min(riskScore, 100),
      factors,
      recommendations
    };
  });

  // Сводка
  const highRisk = churnPrediction.filter(p => p.churnRisk === 'high').length;
  const mediumRisk = churnPrediction.filter(p => p.churnRisk === 'medium').length;
  const lowRisk = churnPrediction.filter(p => p.churnRisk === 'low').length;

  const membershipPrices = { basic: 2000, premium: 4000, vip: 8000 };
  const totalRevenueAtRisk = churnPrediction
    .filter(p => p.churnRisk === 'high')
    .reduce((sum: number, prediction) => {
      const client = clients.find((c: ExtendedClient) => c.id === prediction.clientId);
      if (client) {
        const price = membershipPrices[client.membershipType as keyof typeof membershipPrices] || 0;
        return sum + price;
      }
      return sum;
    }, 0);

  return {
    churnPrediction,
    summary: {
      highRisk,
      mediumRisk,
      lowRisk,
      totalRevenueAtRisk
    }
  };
}

// Функция для анализа жизненного цикла клиента
export function analyzeClientLifecycle(clients: ExtendedClient[], sessions: Session[]): {
  stages: Array<{
    stage: string;
    count: number;
    percentage: number;
    averageDuration: number;
    conversionRate: number;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('analyzeClientLifecycle: clients is not an array:', clients);
    return { stages: [], insights: [] };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('analyzeClientLifecycle: sessions is not an array:', sessions);
    sessions = [];
  }

  const now = new Date();
  
  // Определение стадий жизненного цикла
  const stages = [
    {
      stage: 'Новый клиент',
      clients: clients.filter((c: ExtendedClient) => {
        const daysSinceJoin = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceJoin <= 7;
      })
    },
    {
      stage: 'Активация',
      clients: clients.filter((c: ExtendedClient) => {
        const daysSinceJoin = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const clientSessions = sessions.filter((s: Session) => s.clientId === c.id && s.status === 'completed');
        return daysSinceJoin > 7 && daysSinceJoin <= 30 && clientSessions.length >= 1;
      })
    },
    {
      stage: 'Вовлечение',
      clients: clients.filter((c: ExtendedClient) => {
        const daysSinceJoin = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const clientSessions = sessions.filter((s: Session) => s.clientId === c.id && s.status === 'completed');
        return daysSinceJoin > 30 && daysSinceJoin <= 90 && clientSessions.length >= 4;
      })
    },
    {
      stage: 'Лояльность',
      clients: clients.filter((c: ExtendedClient) => {
        const daysSinceJoin = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const clientSessions = sessions.filter((s: Session) => s.clientId === c.id && s.status === 'completed');
        return daysSinceJoin > 90 && clientSessions.length >= 12 && c.status === 'active';
      })
    },
    {
      stage: 'Отток',
      clients: clients.filter((c: ExtendedClient) => c.status === 'inactive' || c.status === 'suspended')
    }
  ];

  const totalClients = clients.length;
  
  const stageAnalysis = stages.map((stageData, index) => {
    const count = stageData.clients.length;
    const percentage = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
    
    // Расчет средней продолжительности на стадии
    const averageDuration = stageData.clients.length > 0 
      ? Math.round(stageData.clients.reduce((sum: number, client: ExtendedClient) => {
          const daysSinceJoin = (now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return sum + daysSinceJoin;
        }, 0) / stageData.clients.length)
      : 0;

    // Расчет конверсии в следующую стадию
    let conversionRate = 0;
    if (index < stages.length - 1) {
      const nextStageCount = stages[index + 1].clients.length;
      conversionRate = count > 0 ? Math.round((nextStageCount / count) * 100) : 0;
    }

    return {
      stage: stageData.stage,
      count,
      percentage,
      averageDuration,
      conversionRate
    };
  });

  // Генерация инсайтов
  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }> = [];

  // Анализ конверсии
  const activationRate = stageAnalysis[1]?.conversionRate || 0;
  if (activationRate < 50) {
    insights.push({
      type: 'warning',
      title: 'Низкая активация новых клиентов',
      description: `Только ${activationRate}% новых клиентов переходят к активному использованию`
    });
  } else if (activationRate > 70) {
    insights.push({
      type: 'success',
      title: 'Отличная активация',
      description: `${activationRate}% новых клиентов успешно активируются`
    });
  }

  // Анализ лояльности
  const loyaltyStage = stageAnalysis.find(s => s.stage === 'Лояльность');
  if (loyaltyStage && loyaltyStage.percentage > 30) {
    insights.push({
      type: 'success',
      title: 'Высокая лояльность',
      description: `${loyaltyStage.percentage}% клиентов достигли стадии лояльности`
    });
  }

  // Анализ оттока
  const churnStage = stageAnalysis.find(s => s.stage === 'Отток');
  if (churnStage && churnStage.percentage > 20) {
    insights.push({
      type: 'warning',
      title: 'Высокий уровень оттока',
      description: `${churnStage.percentage}% клиентов находятся в стадии оттока`
    });
  }

  // Анализ новых клиентов
  const newClientStage = stageAnalysis.find(s => s.stage === 'Новый клиент');
  if (newClientStage && newClientStage.percentage > 15) {
    insights.push({
      type: 'info',
      title: 'Активный приток новых клиентов',
      description: `${newClientStage.percentage}% клиентов - новички, требующие особого внимания`
    });
  }

  return {
    stages: stageAnalysis,
    insights
  };
}

// Функция для расчета Customer Lifetime Value (CLV)
export function calculateClientLifetimeValue(clients: ExtendedClient[], sessions: Session[]): {
  averageCLV: number;
  clvBySegment: Record<string, number>;
  topValueClients: Array<{
    clientId: string;
    clientName: string;
    clv: number;
    totalSessions: number;
    membershipType: string;
  }>;
  insights: Array<{
    type: 'success' | 'info' | 'warning';
    title: string;
    description: string;
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('calculateClientLifetimeValue: clients is not an array:', clients);
    return {
      averageCLV: 0,
      clvBySegment: {},
      topValueClients: [],
      insights: []
    };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('calculateClientLifetimeValue: sessions is not an array:', sessions);
    sessions = [];
  }

  const membershipPrices = { basic: 2000, premium: 4000, vip: 8000 };
  
  const clientCLVs = clients.map((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id && s.status === 'completed');
    const monthlyPrice = membershipPrices[client.membershipType as keyof typeof membershipPrices] || 0;
    
    // Расчет времени жизни клиента в месяцах
    const joinDate = new Date(client.createdAt);
    const now = new Date();
    const lifetimeMonths = Math.max(1, Math.ceil((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    // Простой расчет CLV: месячная стоимость * время жизни * коэффициент активности
    const activityCoefficient = client.status === 'active' ? 1 : 
                               client.status === 'trial' ? 0.3 : 0.1;
    const clv = monthlyPrice * lifetimeMonths * activityCoefficient;

    return {
      clientId: client.id,
      clientName: client.name,
      clv,
      totalSessions: clientSessions.length,
      membershipType: client.membershipType,
      lifetimeMonths
    };
  });

  // Средний CLV
  const averageCLV = clientCLVs.length > 0 
    ? Math.round(clientCLVs.reduce((sum: number, c) => sum + c.clv, 0) / clientCLVs.length)
    : 0;

  // CLV по сегментам
  const clvBySegment: Record<string, number> = {};
  ['basic', 'premium', 'vip'].forEach(membershipType => {
    const segmentCLVs = clientCLVs.filter(c => c.membershipType === membershipType);
    clvBySegment[membershipType] = segmentCLVs.length > 0
      ? Math.round(segmentCLVs.reduce((sum: number, c) => sum + c.clv, 0) / segmentCLVs.length)
      : 0;
  });

  // Добавляем CLV по статусам
  ['active', 'trial', 'inactive', 'suspended'].forEach(status => {
    const statusClients = clients.filter((c: ExtendedClient) => c.status === status);
    const statusCLVs = clientCLVs.filter(c => statusClients.some((sc: ExtendedClient) => sc.id === c.clientId));
    clvBySegment[status] = statusCLVs.length > 0
      ? Math.round(statusCLVs.reduce((sum: number, c) => sum + c.clv, 0) / statusCLVs.length)
      : 0;
  });

  // Топ клиенты по CLV
  const topValueClients = clientCLVs
    .sort((a, b) => b.clv - a.clv)
    .slice(0, 10);

  // Инсайты
  const insights: Array<{
    type: 'success' | 'info' | 'warning';
    title: string;
    description: string;
  }> = [];

  if (clvBySegment.vip > clvBySegment.premium * 1.5) {
    insights.push({
      type: 'success',
      title: 'VIP сегмент высокоценен',
            description: `VIP клиенты приносят в ${Math.round(clvBySegment.vip / clvBySegment.basic)} раз больше дохода чем базовые`
    });
  }

  if (averageCLV > 50000) {
    insights.push({
      type: 'success',
      title: 'Высокая ценность клиентов',
      description: `Средний CLV составляет ${averageCLV.toLocaleString('ru-RU')} ₽`
    });
  }

  const highValueClients = clientCLVs.filter(c => c.clv > averageCLV * 2).length;
  if (highValueClients > 0) {
    insights.push({
      type: 'info',
      title: 'Высокоценные клиенты',
      description: `${highValueClients} клиентов имеют CLV выше среднего в 2+ раза`
    });
  }

  if (clvBySegment.trial > 0) {
    insights.push({
      type: 'info',
      title: 'Потенциал пробных клиентов',
      description: `Средний CLV пробных клиентов: ${clvBySegment.trial.toLocaleString('ru-RU')} ₽`
    });
  }

  if (clvBySegment.active / clvBySegment.inactive > 5) {
    insights.push({
      type: 'warning',
      title: 'Большая разница в ценности',
      description: 'Активные клиенты значительно ценнее неактивных - важно работать с удержанием'
    });
  }

  return {
    averageCLV,
    clvBySegment,
    topValueClients,
    insights
  };
}

// Функция для анализа удовлетворенности клиентов
export function analyzeClientSatisfaction(clients: ExtendedClient[], sessions: Session[]): {
  satisfactionMetrics: {
    averageRating: number;
    ratingDistribution: Record<string, number>;
    npsScore: number;
    satisfactionByMembership: Record<string, number>;
    satisfactionByStatus: Record<string, number>;
  };
  feedbackAnalysis: {
    positiveIndicators: string[];
    negativeIndicators: string[];
    improvementAreas: string[];
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('analyzeClientSatisfaction: clients is not an array:', clients);
    return {
      satisfactionMetrics: {
        averageRating: 0,
        ratingDistribution: {},
        npsScore: 0,
        satisfactionByMembership: {},
        satisfactionByStatus: {}
      },
      feedbackAnalysis: {
        positiveIndicators: [],
        negativeIndicators: [],
        improvementAreas: []
      },
      recommendations: []
    };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('analyzeClientSatisfaction: sessions is not an array:', sessions);
    sessions = [];
  }

  // Симуляция рейтингов (в реальном приложении это будут данные из отзывов)
  const clientRatings = clients.map((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id && s.status === 'completed');
    // Симулируем рейтинг на основе активности и типа членства
    let baseRating = 3.5;
    
    if (client.membershipType === 'vip') baseRating += 0.8;
    else if (client.membershipType === 'premium') baseRating += 0.4;
    
    if (clientSessions.length > 10) baseRating += 0.3;
    if (client.status === 'active') baseRating += 0.2;
    else if (client.status === 'trial') baseRating += 0.1;
    else if (client.status === 'inactive') baseRating -= 0.5;
    else if (client.status === 'suspended') baseRating -= 1.0;
    
    const rating = Math.min(5, Math.max(1, baseRating + (Math.random() - 0.5) * 0.8));
    
    return {
      clientId: client.id,
      rating: Math.round(rating * 10) / 10,
      membershipType: client.membershipType,
      status: client.status
    };
  });

  // Средний рейтинг
  const averageRating = clientRatings.length > 0
    ? Math.round(clientRatings.reduce((sum: number, r) => sum + r.rating, 0) / clientRatings.length * 10) / 10
    : 0;

  // Распределение рейтингов
  const ratingDistribution: Record<string, number> = {
    '5': clientRatings.filter(r => r.rating >= 4.5).length,
    '4': clientRatings.filter(r => r.rating >= 3.5 && r.rating < 4.5).length,
    '3': clientRatings.filter(r => r.rating >= 2.5 && r.rating < 3.5).length,
    '2': clientRatings.filter(r => r.rating >= 1.5 && r.rating < 2.5).length,
    '1': clientRatings.filter(r => r.rating < 1.5).length
  };

  // NPS Score (упрощенный расчет)
  const promoters = clientRatings.filter(r => r.rating >= 4.5).length;
  const detractors = clientRatings.filter(r => r.rating <= 3).length;
  const npsScore = clientRatings.length > 0 
    ? Math.round(((promoters - detractors) / clientRatings.length) * 100)
    : 0;

  // Удовлетворенность по типам членства
  const satisfactionByMembership: Record<string, number> = {};
  ['basic', 'premium', 'vip'].forEach(membershipType => {
    const membershipRatings = clientRatings.filter(r => r.membershipType === membershipType);
    satisfactionByMembership[membershipType] = membershipRatings.length > 0
      ? Math.round(membershipRatings.reduce((sum: number, r) => sum + r.rating, 0) / membershipRatings.length * 10) / 10
      : 0;
  });

  // Удовлетворенность по статусам
  const satisfactionByStatus: Record<string, number> = {};
  ['active', 'trial', 'inactive', 'suspended'].forEach(status => {
    const statusRatings = clientRatings.filter(r => r.status === status);
    satisfactionByStatus[status] = statusRatings.length > 0
      ? Math.round(statusRatings.reduce((sum: number, r) => sum + r.rating, 0) / statusRatings.length * 10) / 10
      : 0;
  });

  // Анализ обратной связи (симуляция)
  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const improvementAreas: string[] = [];

  if (averageRating >= 4.0) {
    positiveIndicators.push('Высокий общий рейтинг удовлетворенности');
  }
  if (satisfactionByMembership.vip >= 4.5) {
    positiveIndicators.push('Отличная удовлетворенность VIP клиентов');
  }
  if (npsScore > 50) {
    positiveIndicators.push('Положительный NPS показатель');
  }
  if (satisfactionByStatus.active >= 4.0) {
    positiveIndicators.push('Высокая удовлетворенность активных клиентов');
  }

  if (averageRating < 3.5) {
    negativeIndicators.push('Низкий общий рейтинг удовлетворенности');
    improvementAreas.push('Качество сервиса');
  }
  if (satisfactionByMembership.basic < 3.5) {
    negativeIndicators.push('Неудовлетворенность базовых клиентов');
    improvementAreas.push('Ценностное предложение для базового тарифа');
  }
  if (npsScore < 0) {
    negativeIndicators.push('Отрицательный NPS');
    improvementAreas.push('Общий клиентский опыт');
  }
  if (satisfactionByStatus.trial < 3.8) {
    negativeIndicators.push('Низкая удовлетворенность пробных клиентов');
    improvementAreas.push('Процесс адаптации новых клиентов');
  }
  if (satisfactionByStatus.inactive < 2.5) {
    negativeIndicators.push('Очень низкая удовлетворенность неактивных клиентов');
    improvementAreas.push('Программы реактивации');
  }

  // Рекомендации
  const recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
  }> = [];

  if (averageRating < 4.0) {
    recommendations.push({
      priority: 'high',
      action: 'Провести детальный анализ причин неудовлетворенности',
      expectedImpact: 'Повышение общего рейтинга на 0.3-0.5 баллов'
    });
  }

  if (satisfactionByMembership.basic < satisfactionByMembership.premium) {
    recommendations.push({
      priority: 'medium',
      action: 'Улучшить ценностное предложение для базового тарифа',
      expectedImpact: 'Увеличение удовлетворенности базовых клиентов на 15-20%'
    });
  }

  if (npsScore < 30) {
    recommendations.push({
      priority: 'high',
      action: 'Запустить программу улучшения клиентского опыта',
      expectedImpact: 'Повышение NPS на 20-30 пунктов'
    });
  }

  if (satisfactionByStatus.trial < 4.0) {
    recommendations.push({
      priority: 'high',
      action: 'Улучшить процесс адаптации для пробных клиентов',
      expectedImpact: 'Повышение конверсии пробных клиентов на 25-30%'
    });
  }

  if (satisfactionByStatus.inactive < 3.0) {
    recommendations.push({
      priority: 'medium',
      action: 'Разработать программу работы с неактивными клиентами',
      expectedImpact: 'Реактивация 15-20% неактивных клиентов'
    });
  }

  recommendations.push({
    priority: 'low',
    action: 'Внедрить систему регулярного сбора обратной связи',
    expectedImpact: 'Своевременное выявление проблем и трендов'
  });

  return {
    satisfactionMetrics: {
      averageRating,
      ratingDistribution,
      npsScore,
      satisfactionByMembership,
      satisfactionByStatus
    },
    feedbackAnalysis: {
      positiveIndicators,
      negativeIndicators,
      improvementAreas
    },
    recommendations
  };
}

// Функция для анализа поведенческих паттернов клиентов
export function analyzeClientBehaviorPatterns(clients: ExtendedClient[], sessions: Session[]): {
  patterns: Array<{
    pattern: string;
    description: string;
    clientCount: number;
    percentage: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  recommendations: Array<{
    pattern: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedOutcome: string;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('analyzeClientBehaviorPatterns: clients is not an array:', clients);
    return { patterns: [], recommendations: [], insights: [] };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('analyzeClientBehaviorPatterns: sessions is not an array:', sessions);
    sessions = [];
  }

  const patterns: Array<{
    pattern: string;
    description: string;
    clientCount: number;
    percentage: number;
    impact: 'positive' | 'negative' | 'neutral';
  }> = [];

  const recommendations: Array<{
    pattern: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedOutcome: string;
  }> = [];

  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }> = [];

  // Паттерн 1: Регулярные клиенты
  const regularClients = clients.filter((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id && s.status === 'completed');
    const weeksActive = Math.ceil(clientSessions.length / 2); // предполагаем 2 сессии в неделю как норму
    return weeksActive >= 4 && client.status === 'active';
  });

  patterns.push({
    pattern: 'Регулярные клиенты',
    description: 'Клиенты с постоянным расписанием тренировок',
    clientCount: regularClients.length,
    percentage: clients.length > 0 ? Math.round((regularClients.length / clients.length) * 100) : 0,
    impact: 'positive'
  });

  // Паттерн 2: Клиенты выходного дня
  const weekendClients = clients.filter((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
    const weekendSessions = clientSessions.filter((s: Session) => {
      const sessionDate = new Date(s.date);
      const dayOfWeek = sessionDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // воскресенье или суббота
    });
    return weekendSessions.length > clientSessions.length * 0.7;
  });

    patterns.push({
    pattern: 'Клиенты выходного дня',
    description: 'Предпочитают тренировки в выходные дни',
    clientCount: weekendClients.length,
    percentage: clients.length > 0 ? Math.round((weekendClients.length / clients.length) * 100) : 0,
    impact: 'neutral'
  });

  // Паттерн 3: Непостоянные клиенты
  const inconsistentClients = clients.filter((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
    const cancelledSessions = clientSessions.filter((s: Session) => s.status === 'cancelled');
    const cancellationRate = clientSessions.length > 0 ? (cancelledSessions.length / clientSessions.length) : 0;
    return cancellationRate > 0.3; // более 30% отмен
  });

  patterns.push({
    pattern: 'Непостоянные клиенты',
    description: 'Высокий процент отмен и нерегулярное посещение',
    clientCount: inconsistentClients.length,
    percentage: clients.length > 0 ? Math.round((inconsistentClients.length / clients.length) * 100) : 0,
    impact: 'negative'
  });

  // Паттерн 4: Новички в адаптации
  const adaptingNewbies = clients.filter((client: ExtendedClient) => {
    const joinDate = new Date(client.createdAt);
    const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
    return daysSinceJoin <= 30 && clientSessions.length >= 1 && clientSessions.length <= 8;
  });

  patterns.push({
    pattern: 'Новички в адаптации',
    description: 'Новые клиенты в процессе привыкания к режиму',
    clientCount: adaptingNewbies.length,
    percentage: clients.length > 0 ? Math.round((adaptingNewbies.length / clients.length) * 100) : 0,
    impact: 'neutral'
  });

  // Паттерн 5: VIP энтузиасты
  const vipEnthusiasts = clients.filter((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id && s.status === 'completed');
    return client.membershipType === 'vip' && clientSessions.length > 15;
  });

  patterns.push({
    pattern: 'VIP энтузиасты',
    description: 'VIP клиенты с высокой активностью',
    clientCount: vipEnthusiasts.length,
    percentage: clients.length > 0 ? Math.round((vipEnthusiasts.length / clients.length) * 100) : 0,
    impact: 'positive'
  });

  // Паттерн 6: Пробные клиенты
  const trialClients = clients.filter((client: ExtendedClient) => client.status === 'trial');

  patterns.push({
    pattern: 'Пробные клиенты',
    description: 'Клиенты в пробном периоде',
    clientCount: trialClients.length,
    percentage: clients.length > 0 ? Math.round((trialClients.length / clients.length) * 100) : 0,
    impact: 'neutral'
  });

  // Паттерн 7: Клиенты группы риска
  const riskClients = clients.filter((client: ExtendedClient) => {
    const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
    const recentSessions = clientSessions.filter((s: Session) => {
      const sessionDate = new Date(`${s.date}T${s.startTime}`);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return sessionDate >= twoWeeksAgo;
    });
    return recentSessions.length === 0 && (client.status === 'active' || client.status === 'trial');
  });

  patterns.push({
    pattern: 'Клиенты группы риска',
    description: 'Нет активности более 2 недель',
    clientCount: riskClients.length,
    percentage: clients.length > 0 ? Math.round((riskClients.length / clients.length) * 100) : 0,
    impact: 'negative'
  });

  // Генерация рекомендаций
  if (regularClients.length > 0) {
    recommendations.push({
      pattern: 'Регулярные клиенты',
      action: 'Создать программу лояльности для постоянных клиентов',
      priority: 'medium',
      expectedOutcome: 'Увеличение удержания на 15-20%'
    });
  }

  if (inconsistentClients.length > clients.length * 0.2) {
    recommendations.push({
      pattern: 'Непостоянные клиенты',
      action: 'Внедрить систему напоминаний и гибкого переноса занятий',
      priority: 'high',
      expectedOutcome: 'Снижение отмен на 25-30%'
    });
  }

  if (weekendClients.length > 0) {
    recommendations.push({
      pattern: 'Клиенты выходного дня',
      action: 'Расширить предложение групповых занятий в выходные',
      priority: 'medium',
      expectedOutcome: 'Увеличение загрузки выходных на 20%'
    });
  }

  if (adaptingNewbies.length > 0) {
    recommendations.push({
      pattern: 'Новички в адаптации',
      action: 'Создать специальную программу адаптации для новых клиентов',
      priority: 'medium',
      expectedOutcome: 'Улучшение конверсии новичков на 30%'
    });
  }

  if (vipEnthusiasts.length > 0) {
    recommendations.push({
      pattern: 'VIP энтузиасты',
      action: 'Предложить эксклюзивные мастер-классы и персональные программы',
      priority: 'low',
      expectedOutcome: 'Повышение удовлетворенности VIP клиентов'
    });
  }

  if (trialClients.length > 0) {
    recommendations.push({
      pattern: 'Пробные клиенты',
      action: 'Разработать персонализированную программу конверсии',
      priority: 'high',
      expectedOutcome: 'Увеличение конверсии пробных клиентов на 40-50%'
    });
  }

  if (riskClients.length > 0) {
    recommendations.push({
      pattern: 'Клиенты группы риска',
      action: 'Запустить проактивную программу удержания',
      priority: 'high',
      expectedOutcome: 'Предотвращение оттока 60-70% клиентов группы риска'
    });
  }

  // Генерация инсайтов
  if (regularClients.length > clients.length * 0.4) {
    insights.push({
      type: 'success',
      title: 'Высокая доля постоянных клиентов',
      description: `${Math.round((regularClients.length / clients.length) * 100)}% клиентов имеют регулярный график тренировок`
    });
  }

  if (inconsistentClients.length > clients.length * 0.3) {
    insights.push({
      type: 'warning',
      title: 'Проблема с постоянством',
      description: `${Math.round((inconsistentClients.length / clients.length) * 100)}% клиентов имеют нерегулярное посещение`
    });
  }

  if (vipEnthusiasts.length > 0) {
    insights.push({
      type: 'info',
      title: 'Активные VIP клиенты',
      description: `${vipEnthusiasts.length} VIP клиентов показывают высокую активность`
    });
  }

  if (trialClients.length > clients.length * 0.15) {
    insights.push({
      type: 'info',
      title: 'Значительная доля пробных клиентов',
      description: `${Math.round((trialClients.length / clients.length) * 100)}% клиентов находятся в пробном периоде`
    });
  }

  if (riskClients.length > clients.length * 0.2) {
    insights.push({
      type: 'warning',
      title: 'Высокий риск оттока',
      description: `${Math.round((riskClients.length / clients.length) * 100)}% клиентов находятся в группе риска`
    });
  }

  if (weekendClients.length > clients.length * 0.25) {
    insights.push({
      type: 'info',
      title: 'Популярность выходных',
      description: `${Math.round((weekendClients.length / clients.length) * 100)}% клиентов предпочитают выходные дни`
    });
  }

  return {
    patterns,
    recommendations,
    insights
  };
}

// Функция для прогнозирования роста клиентской базы
export function predictClientGrowth(clients: ExtendedClient[], sessions: Session[]): {
  growthForecast: {
    nextMonth: {
      expectedNewClients: number;
      expectedChurn: number;
      netGrowth: number;
      confidenceLevel: number;
    };
    nextQuarter: {
      expectedNewClients: number;
      expectedChurn: number;
      netGrowth: number;
      confidenceLevel: number;
    };
  };
  growthFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('predictClientGrowth: clients is not an array:', clients);
    return {
      growthForecast: {
        nextMonth: { expectedNewClients: 0, expectedChurn: 0, netGrowth: 0, confidenceLevel: 0 },
        nextQuarter: { expectedNewClients: 0, expectedChurn: 0, netGrowth: 0, confidenceLevel: 0 }
      },
      growthFactors: [],
      recommendations: []
    };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('predictClientGrowth: sessions is not an array:', sessions);
    sessions = [];
  }

  const now = new Date();
  
  // Анализ исторических данных
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const newClientsLast30Days = clients.filter((c: ExtendedClient) => new Date(c.createdAt) >= last30Days).length;
  const newClientsLast90Days = clients.filter((c: ExtendedClient) => new Date(c.createdAt) >= last90Days).length;
  
  const churnedClientsLast30Days = clients.filter((c: ExtendedClient) => 
    (c.status === 'inactive' || c.status === 'suspended') &&
    new Date(c.createdAt) >= last30Days
  ).length;

  // Расчет трендов
  const monthlyGrowthRate = newClientsLast30Days;
  const quarterlyGrowthRate = newClientsLast90Days / 3; // средний месячный рост за квартал
  const churnRate = clients.length > 0 ? (churnedClientsLast30Days / clients.length) * 100 : 0;

  // Факторы роста
  const growthFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }> = [];

  // Анализ активности
  const activeClientRatio = clients.filter((c: ExtendedClient) => c.status === 'active').length / clients.length;
  if (activeClientRatio > 0.8) {
    growthFactors.push({
      factor: 'Высокая активность клиентов',
      impact: 'positive',
      weight: 0.3,
      description: 'Большинство клиентов активны, что способствует положительным отзывам'
    });
  } else if (activeClientRatio < 0.6) {
    growthFactors.push({
      factor: 'Низкая активность клиентов',
      impact: 'negative',
      weight: 0.25,
      description: 'Низкая доля активных клиентов может негативно влиять на репутацию'
    });
  }

  // Анализ удовлетворенности (симуляция)
  const satisfactionScore = 4.2; // средний рейтинг
  if (satisfactionScore > 4.0) {
    growthFactors.push({
      factor: 'Высокая удовлетворенность',
      impact: 'positive',
      weight: 0.25,
      description: 'Высокие оценки клиентов способствуют рекомендациям'
    });
  } else if (satisfactionScore < 3.5) {
    growthFactors.push({
      factor: 'Низкая удовлетворенность',
      impact: 'negative',
      weight: 0.3,
      description: 'Низкие оценки могут препятствовать привлечению новых клиентов'
    });
  }

  // Анализ оттока
  if (churnRate > 15) {
    growthFactors.push({
      factor: 'Высокий отток клиентов',
      impact: 'negative',
      weight: 0.2,
      description: 'Высокий процент оттока снижает общий рост'
    });
  } else if (churnRate < 5) {
    growthFactors.push({
      factor: 'Низкий отток клиентов',
      impact: 'positive',
      weight: 0.15,
            description: 'Низкий отток способствует стабильному росту'
    });
  }

  // Анализ премиум сегмента
  const premiumRatio = clients.filter((c: ExtendedClient) => c.membershipType === 'premium' || c.membershipType === 'vip').length / clients.length;
  if (premiumRatio > 0.3) {
    growthFactors.push({
      factor: 'Сильный премиум сегмент',
      impact: 'positive',
      weight: 0.15,
      description: 'Высокая доля премиум клиентов указывает на качество услуг'
    });
  }

  // Анализ пробных клиентов
  const trialRatio = clients.filter((c: ExtendedClient) => c.status === 'trial').length / clients.length;
  if (trialRatio > 0.1) {
    growthFactors.push({
      factor: 'Активные пробные клиенты',
      impact: 'positive',
      weight: 0.1,
      description: 'Много пробных клиентов - потенциал для конверсии'
    });
  }

  // Сезонность (упрощенная модель)
  const currentMonth = now.getMonth();
  const seasonalFactor = [0.8, 0.9, 1.1, 1.2, 1.3, 1.1, 0.9, 0.8, 1.0, 1.1, 1.0, 0.7][currentMonth];
  
  growthFactors.push({
    factor: 'Сезонный фактор',
    impact: seasonalFactor > 1.0 ? 'positive' : 'negative',
    weight: 0.1,
    description: `Текущий месяц ${seasonalFactor > 1.0 ? 'благоприятен' : 'менее благоприятен'} для привлечения клиентов`
  });

  // Расчет прогноза
  const baseGrowthRate = (monthlyGrowthRate + quarterlyGrowthRate) / 2;
  const growthMultiplier = growthFactors.reduce((acc: number, factor) => {
    const impact = factor.impact === 'positive' ? 1 + factor.weight : 
                   factor.impact === 'negative' ? 1 - factor.weight : 1;
    return acc * impact;
  }, 1);

  const adjustedGrowthRate = baseGrowthRate * growthMultiplier * seasonalFactor;
  const expectedChurnRate = Math.max(0, churnRate / 100);

  // Прогноз на месяц
  const nextMonthNewClients = Math.round(Math.max(0, adjustedGrowthRate));
  const nextMonthChurn = Math.round(clients.length * expectedChurnRate);
  const nextMonthNetGrowth = nextMonthNewClients - nextMonthChurn;

  // Прогноз на квартал
  const nextQuarterNewClients = Math.round(Math.max(0, adjustedGrowthRate * 3));
  const nextQuarterChurn = Math.round(clients.length * expectedChurnRate * 3);
  const nextQuarterNetGrowth = nextQuarterNewClients - nextQuarterChurn;

  // Уровень уверенности (упрощенная модель)
  const dataQuality = Math.min(1, clients.length / 100); // больше данных = выше уверенность
  const trendStability = Math.min(1, Math.abs(monthlyGrowthRate - quarterlyGrowthRate) < 5 ? 1 : 0.7);
  const confidenceLevel = Math.round((dataQuality * trendStability) * 100);

  // Рекомендации
  const recommendations: Array<{
    action: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  if (churnRate > 15) {
    recommendations.push({
      action: 'Запустить программу удержания клиентов',
      expectedImpact: 'Снижение оттока на 20-30%',
      priority: 'high'
    });
  }

  if (nextMonthNetGrowth < 0) {
    recommendations.push({
      action: 'Усилить маркетинговые активности',
      expectedImpact: 'Увеличение притока новых клиентов на 40-50%',
      priority: 'high'
    });
  }

  if (premiumRatio < 0.2) {
    recommendations.push({
      action: 'Развивать премиум предложения',
      expectedImpact: 'Увеличение среднего чека на 25-35%',
      priority: 'medium'
    });
  }

  if (activeClientRatio < 0.7) {
    recommendations.push({
      action: 'Программа реактивации неактивных клиентов',
      expectedImpact: 'Повышение активности на 15-20%',
      priority: 'medium'
    });
  }

  if (trialRatio > 0.1) {
    recommendations.push({
      action: 'Усилить работу с конверсией пробных клиентов',
      expectedImpact: 'Увеличение конверсии на 25-30%',
      priority: 'high'
    });
  }

  recommendations.push({
    action: 'Внедрить реферальную программу',
    expectedImpact: 'Дополнительный приток 10-15% новых клиентов',
    priority: 'low'
  });

  return {
    growthForecast: {
      nextMonth: {
        expectedNewClients: nextMonthNewClients,
        expectedChurn: nextMonthChurn,
        netGrowth: nextMonthNetGrowth,
        confidenceLevel
      },
      nextQuarter: {
        expectedNewClients: nextQuarterNewClients,
        expectedChurn: nextQuarterChurn,
        netGrowth: nextQuarterNetGrowth,
        confidenceLevel: Math.max(50, confidenceLevel - 10) // меньше уверенности на длинный период
      }
    },
    growthFactors,
    recommendations
  };
}

// Функция для анализа эффективности маркетинговых каналов (симуляция)
export function analyzeMarketingChannels(clients: ExtendedClient[]): {
  channels: Array<{
    channel: string;
    clientCount: number;
    percentage: number;
    conversionRate: number;
    averageCLV: number;
    cost: number;
    roi: number;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
  recommendations: Array<{
    channel: string;
    action: string;
    expectedOutcome: string;
    priority: 'high' | 'medium' | 'low';
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('analyzeMarketingChannels: clients is not an array:', clients);
    return { channels: [], insights: [], recommendations: [] };
  }

  // Симуляция источников привлечения клиентов
  const channelData = [
    { name: 'Социальные сети', share: 0.35, conversion: 0.12, cost: 15000, clvMultiplier: 1.0 },
    { name: 'Рекомендации', share: 0.25, conversion: 0.35, cost: 5000, clvMultiplier: 1.4 },
    { name: 'Поисковая реклама', share: 0.20, conversion: 0.08, cost: 25000, clvMultiplier: 0.9 },
    { name: 'Офлайн реклама', share: 0.10, conversion: 0.05, cost: 30000, clvMultiplier: 0.8 },
    { name: 'Прямые обращения', share: 0.10, conversion: 0.45, cost: 2000, clvMultiplier: 1.2 }
  ];

  const baseCLV = 25000; // базовая ценность клиента
  const totalClients = clients.length;

  const channels = channelData.map(channel => {
    const clientCount = Math.round(totalClients * channel.share);
    const percentage = Math.round(channel.share * 100);
    const averageCLV = Math.round(baseCLV * channel.clvMultiplier);
    const revenue = clientCount * averageCLV;
    const roi = channel.cost > 0 ? Math.round((revenue / channel.cost) * 100) / 100 : 0;

    return {
      channel: channel.name,
      clientCount,
      percentage,
      conversionRate: Math.round(channel.conversion * 100),
      averageCLV,
      cost: channel.cost,
      roi
    };
  });

  // Генерация инсайтов
  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }> = [];

  const bestROI = channels.reduce((prev, current) => current.roi > prev.roi ? current : prev);
  const worstROI = channels.reduce((prev, current) => current.roi < prev.roi ? current : prev);

  insights.push({
    type: 'success',
    title: 'Лучший канал по ROI',
    description: `${bestROI.channel} показывает ROI ${bestROI.roi}x`
  });

  if (worstROI.roi < 1) {
    insights.push({
      type: 'warning',
      title: 'Убыточный канал',
      description: `${worstROI.channel} показывает отрицательный ROI (${worstROI.roi}x)`
    });
  }

  const referralChannel = channels.find(c => c.channel === 'Рекомендации');
  if (referralChannel && referralChannel.percentage > 20) {
    insights.push({
      type: 'success',
      title: 'Сильная реферальная программа',
      description: `${referralChannel.percentage}% клиентов приходят по рекомендациям`
    });
  }

  const socialChannel = channels.find(c => c.channel === 'Социальные сети');
  if (socialChannel && socialChannel.percentage > 30) {
    insights.push({
      type: 'info',
      title: 'Доминирование социальных сетей',
      description: `${socialChannel.percentage}% клиентов приходят из социальных сетей`
    });
  }

  // Генерация рекомендаций
  const recommendations: Array<{
    channel: string;
    action: string;
    expectedOutcome: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  if (worstROI.roi < 0.5) {
    recommendations.push({
      channel: worstROI.channel,
      action: 'Пересмотреть стратегию или приостановить инвестиции',
      expectedOutcome: 'Экономия бюджета и перераспределение средств',
      priority: 'high'
    });
  }

  if (bestROI.roi > 2) {
    recommendations.push({
      channel: bestROI.channel,
      action: 'Увеличить инвестиции в канал',
      expectedOutcome: `Рост количества клиентов на 30-50%`,
      priority: 'high'
    });
  }

  if (referralChannel && referralChannel.percentage < 30) {
    recommendations.push({
      channel: 'Рекомендации',
      action: 'Усилить реферальную программу',
      expectedOutcome: 'Увеличение доли реферального трафика до 35-40%',
      priority: 'medium'
    });
  }

  if (socialChannel && socialChannel.conversionRate < 15) {
    recommendations.push({
      channel: 'Социальные сети',
      action: 'Улучшить качество контента и таргетинг',
      expectedOutcome: 'Повышение конверсии до 18-20%',
      priority: 'medium'
    });
  }

  const searchChannel = channels.find(c => c.channel === 'Поисковая реклама');
  if (searchChannel && searchChannel.roi < 1.5) {
    recommendations.push({
      channel: 'Поисковая реклама',
      action: 'Оптимизировать ключевые слова и посадочные страницы',
      expectedOutcome: 'Повышение ROI до 2.0x',
      priority: 'medium'
    });
  }

  recommendations.push({
    channel: 'Общее',
    action: 'Внедрить систему отслеживания источников',
    expectedOutcome: 'Более точная аналитика и оптимизация каналов',
    priority: 'low'
  });

  return {
    channels,
    insights,
    recommendations
  };
}

// Функция для создания клиентского скоркарда
export function createClientScorecard(clients: ExtendedClient[], sessions: Session[]): {
  scorecard: {
    overall: {
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      trend: 'improving' | 'stable' | 'declining';
    };
    categories: Array<{
      category: string;
      score: number;
      weight: number;
      status: 'excellent' | 'good' | 'average' | 'poor';
      metrics: Array<{
        metric: string;
        value: number;
        target: number;
        performance: number;
      }>;
    }>;
  };
  actionItems: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    category: string;
    expectedImpact: string;
    timeline: string;
  }>;
} {
  // Проверяем, что clients - это массив
  if (!Array.isArray(clients)) {
    console.error('createClientScorecard: clients is not an array:', clients);
    return {
      scorecard: {
        overall: { score: 0, grade: 'F', trend: 'declining' },
        categories: []
      },
      actionItems: []
    };
  }

  // Проверяем, что sessions - это массив
  if (!Array.isArray(sessions)) {
    console.error('createClientScorecard: sessions is not an array:', sessions);
    sessions = [];
  }

  // Расчет метрик по категориям
  const totalClients = clients.length;
  const activeClients = clients.filter((c: ExtendedClient) => c.status === 'active').length;
  const trialClients = clients.filter((c: ExtendedClient) => c.status === 'trial').length;
    const completedSessions = sessions.filter((s: Session) => s.status === 'completed').length;
  const cancelledSessions = sessions.filter((s: Session) => s.status === 'cancelled').length;

  // Категория 1: Рост и привлечение
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newClients = clients.filter((c: ExtendedClient) => new Date(c.createdAt) >= last30Days).length;
  const growthRate = totalClients > 0 ? (newClients / totalClients) * 100 : 0;
  
  const growthMetrics = [
    { metric: 'Рост клиентской базы (%)', value: growthRate, target: 10, performance: Math.min(100, (growthRate / 10) * 100) },
    { metric: 'Новые клиенты (30 дней)', value: newClients, target: 20, performance: Math.min(100, (newClients / 20) * 100) },
    { metric: 'Конверсия пробных (%)', value: trialClients.length > 0 ? (activeClients / (activeClients + trialClients)) * 100 : 100, target: 70, performance: Math.min(100, ((trialClients.length > 0 ? (activeClients / (activeClients + trialClients)) * 100 : 100) / 70) * 100) }
  ];
  const growthScore = growthMetrics.reduce((sum: number, m) => sum + m.performance, 0) / growthMetrics.length;

  // Категория 2: Удержание и лояльность
  const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  const avgSessionsPerClient = totalClients > 0 ? completedSessions / totalClients : 0;
  const churnRate = totalClients > 0 ? ((clients.filter((c: ExtendedClient) => c.status === 'inactive' || c.status === 'suspended').length) / totalClients) * 100 : 0;
  
  const retentionMetrics = [
    { metric: 'Уровень удержания (%)', value: retentionRate, target: 85, performance: Math.min(100, (retentionRate / 85) * 100) },
    { metric: 'Сессий на клиента', value: avgSessionsPerClient, target: 8, performance: Math.min(100, (avgSessionsPerClient / 8) * 100) },
    { metric: 'Уровень оттока (%)', value: churnRate, target: 10, performance: Math.max(0, 100 - (churnRate / 10) * 100) }
  ];
  const retentionScore = retentionMetrics.reduce((sum: number, m) => sum + m.performance, 0) / retentionMetrics.length;

  // Категория 3: Операционная эффективность
  const totalSessions = completedSessions + cancelledSessions;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const utilizationRate = 75; // симуляция загрузки
  const responseTime = 24; // среднее время ответа в часах
  
  const operationalMetrics = [
    { metric: 'Процент завершения (%)', value: completionRate, target: 90, performance: Math.min(100, (completionRate / 90) * 100) },
    { metric: 'Загрузка залов (%)', value: utilizationRate, target: 80, performance: Math.min(100, (utilizationRate / 80) * 100) },
    { metric: 'Время ответа (часы)', value: responseTime, target: 12, performance: Math.max(0, 100 - ((responseTime - 12) / 12) * 100) }
  ];
  const operationalScore = operationalMetrics.reduce((sum: number, m) => sum + m.performance, 0) / operationalMetrics.length;

  // Категория 4: Финансовые показатели
  const membershipPrices = { basic: 2000, premium: 4000, vip: 8000 };
  const monthlyRevenue = activeClients * 3000; // средняя цена
  const revenuePerClient = activeClients > 0 ? monthlyRevenue / activeClients : 0;
  const premiumRatio = totalClients > 0 ? (clients.filter((c: ExtendedClient) => c.membershipType === 'premium' || c.membershipType === 'vip').length / totalClients) * 100 : 0;
  
  const financialMetrics = [
    { metric: 'Доход на клиента (₽)', value: revenuePerClient, target: 3500, performance: Math.min(100, (revenuePerClient / 3500) * 100) },
    { metric: 'Месячный доход (тыс. ₽)', value: monthlyRevenue / 1000, target: 500, performance: Math.min(100, (monthlyRevenue / 500000) * 100) },
    { metric: 'Доля премиум (%)', value: premiumRatio, target: 40, performance: Math.min(100, (premiumRatio / 40) * 100) }
  ];
  const financialScore = financialMetrics.reduce((sum: number, m) => sum + m.performance, 0) / financialMetrics.length;

  // Формирование категорий
  const categories = [
    {
      category: 'Рост и привлечение',
      score: Math.round(growthScore),
      weight: 0.25,
      status: growthScore >= 80 ? 'excellent' as const : growthScore >= 60 ? 'good' as const : growthScore >= 40 ? 'average' as const : 'poor' as const,
      metrics: growthMetrics
    },
    {
      category: 'Удержание и лояльность',
      score: Math.round(retentionScore),
      weight: 0.30,
      status: retentionScore >= 80 ? 'excellent' as const : retentionScore >= 60 ? 'good' as const : retentionScore >= 40 ? 'average' as const : 'poor' as const,
      metrics: retentionMetrics
    },
    {
      category: 'Операционная эффективность',
      score: Math.round(operationalScore),
      weight: 0.25,
      status: operationalScore >= 80 ? 'excellent' as const : operationalScore >= 60 ? 'good' as const : operationalScore >= 40 ? 'average' as const : 'poor' as const,
      metrics: operationalMetrics
    },
    {
      category: 'Финансовые показатели',
      score: Math.round(financialScore),
      weight: 0.20,
      status: financialScore >= 80 ? 'excellent' as const : financialScore >= 60 ? 'good' as const : financialScore >= 40 ? 'average' as const : 'poor' as const,
      metrics: financialMetrics
    }
  ];

  // Общий счет
  const overallScore = Math.round(categories.reduce((sum: number, cat) => sum + (cat.score * cat.weight), 0));
  
  // Определение общей оценки
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  else grade = 'F';

  // Определение тренда (упрощенная логика)
  const trend: 'improving' | 'stable' | 'declining' = 
    overallScore >= 75 ? 'improving' : 
    overallScore >= 60 ? 'stable' : 'declining';

  // Генерация действий
  const actionItems: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    category: string;
    expectedImpact: string;
    timeline: string;
  }> = [];

  // Критические действия (score < 40)
  categories.forEach(category => {
    if (category.score < 40) {
      actionItems.push({
        priority: 'critical',
        action: `Немедленное улучшение показателей категории "${category.category}"`,
        category: category.category,
        expectedImpact: 'Критическое улучшение общего скора',
        timeline: '1-2 недели'
      });
    }
  });

  // Высокоприоритетные действия (score < 60)
  if (growthScore < 60) {
    actionItems.push({
      priority: 'high',
      action: 'Запустить маркетинговую кампанию по привлечению новых клиентов',
      category: 'Рост и привлечение',
      expectedImpact: 'Увеличение притока новых клиентов на 40-50%',
      timeline: '2-4 недели'
    });
  }

  if (retentionScore < 60) {
    actionItems.push({
      priority: 'high',
      action: 'Внедрить программу удержания клиентов',
      category: 'Удержание и лояльность',
      expectedImpact: 'Снижение оттока на 25-30%',
      timeline: '3-6 недель'
    });
  }

  if (operationalScore < 60) {
    actionItems.push({
      priority: 'high',
      action: 'Оптимизировать процессы и снизить количество отмен',
      category: 'Операционная эффективность',
      expectedImpact: 'Повышение эффективности на 20-25%',
      timeline: '2-3 недели'
    });
  }

  if (financialScore < 60) {
    actionItems.push({
      priority: 'high',
      action: 'Пересмотреть ценовую стратегию и увеличить средний чек',
      category: 'Финансовые показатели',
      expectedImpact: 'Рост выручки на 15-20%',
      timeline: '4-6 недель'
    });
  }

  // Специфичные действия по метрикам
  if (trialClients.length > activeClients * 0.3) {
    actionItems.push({
      priority: 'high',
      action: 'Усилить работу с конверсией пробных клиентов',
      category: 'Рост и привлечение',
      expectedImpact: 'Увеличение конверсии на 30-40%',
      timeline: '2-3 недели'
    });
  }

  if (churnRate > 15) {
    actionItems.push({
      priority: 'high',
      action: 'Провести анализ причин оттока и запустить программу удержания',
      category: 'Удержание и лояльность',
      expectedImpact: 'Снижение оттока на 40-50%',
      timeline: '3-4 недели'
    });
  }

  if (completionRate < 85) {
    actionItems.push({
      priority: 'high',
      action: 'Улучшить процесс планирования и напоминаний о сессиях',
      category: 'Операционная эффективность',
      expectedImpact: 'Повышение завершаемости до 90%+',
      timeline: '2-3 недели'
    });
  }

  if (premiumRatio < 30) {
    actionItems.push({
      priority: 'medium',
      action: 'Развивать премиум услуги и программы апгрейда',
      category: 'Финансовые показатели',
      expectedImpact: 'Увеличение доли премиум клиентов до 40%',
      timeline: '1-2 месяца'
    });
  }

  // Среднеприоритетные действия (score 60-80)
  categories.forEach(category => {
    if (category.score >= 60 && category.score < 80) {
      actionItems.push({
        priority: 'medium',
        action: `Дальнейшее развитие показателей в категории "${category.category}"`,
        category: category.category,
        expectedImpact: 'Постепенное улучшение показателей',
        timeline: '1-2 месяца'
      });
    }
  });

  // Низкоприоритетные действия (поддержание высоких показателей)
  categories.forEach(category => {
    if (category.score >= 80) {
      actionItems.push({
        priority: 'low',
        action: `Поддержание высоких стандартов в категории "${category.category}"`,
        category: category.category,
        expectedImpact: 'Сохранение конкурентного преимущества',
        timeline: 'Постоянно'
      });
    }
  });

  // Общие рекомендации
  if (overallScore < 70) {
    actionItems.push({
      priority: 'high',
      action: 'Провести комплексный аудит всех бизнес-процессов',
      category: 'Общее',
      expectedImpact: 'Выявление скрытых проблем и возможностей',
      timeline: '2-3 недели'
    });
  }

  actionItems.push({
    priority: 'medium',
    action: 'Внедрить систему регулярного мониторинга KPI',
    category: 'Общее',
    expectedImpact: 'Своевременное выявление проблем',
    timeline: '1 месяц'
  });

  return {
    scorecard: {
      overall: {
        score: overallScore,
        grade,
        trend
      },
      categories
    },
    actionItems: actionItems.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
  };
}

