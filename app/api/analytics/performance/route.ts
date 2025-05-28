// app/api/analytics/performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';

// Типы для пользователя
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client' | 'manager';
}

// Интерфейсы для типизации
interface TrainerPerformance {
  id: string;
  name: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  completionRate: number;
  revenue: number;
  avgRating: number;
  clientCount: number;
}

interface DailyTrend {
  date: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  completionRate: number;
  revenue: number;
}

interface HourlyLoad {
  hour: number;
  sessions: number;
  utilization: number;
}

interface SessionTypeData {
  count: number;
  completed: number;
  revenue: number;
}

interface ClientActivityData {
  id: string;
  name: string;
  totalSessions: number;
  completedSessions: number;
  lastSessionDate: string | null;
  isActive: boolean;
}

interface Recommendation {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface Alert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
}

// Функция для получения аутентифицированного пользователя
async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    return {
      id: 'user-1',
      name: 'Администратор',
      email: 'admin@example.com',
      role: 'admin'
    };
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return null;
  }
}

// Функция проверки прав
function hasPermission(user: User, resource: string, action: string): boolean {
  if (user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'manager' && resource === 'analytics') {
    return true;
  }
  
  if (user.role === 'trainer' && resource === 'analytics' && (action === 'read' || action === 'export')) {
    return true;
  }
  
  return false;
}

// Функция для генерации алертов
function generateAlerts(
  kpis: any, 
  predictions: any, 
  activeClients: number, 
  inactiveClients: number
): Alert[] {
  const alerts: Alert[] = [];

  if (kpis.completionRate < 70) {
    alerts.push({
      type: 'critical',
      title: 'Критически низкий процент завершения',
      message: `Только ${kpis.completionRate}% сессий завершается успешно`,
      action: 'Немедленно проанализируйте причины отмен и неявок'
    });
  }

  if (kpis.cancellationRate > 25) {
    alerts.push({
      type: 'critical',
      title: 'Критически высокий процент отмен',
      message: `${kpis.cancellationRate}% сессий отменяется`,
      action: 'Пересмотрите политику бронирования и отмен'
    });
  }

  if (kpis.noShowRate > 15) {
    alerts.push({
      type: 'warning',
      title: 'Высокий процент неявок',
      message: `${kpis.noShowRate}% клиентов не приходят на сессии`,
      action: 'Внедрите систему напоминаний'
    });
  }

  if (inactiveClients > activeClients) {
    alerts.push({
      type: 'warning',
      title: 'Больше неактивных клиентов',
      message: `${inactiveClients} неактивных против ${activeClients} активных`,
      action: 'Запустите программу реактивации'
    });
  }

  if (predictions.nextMonthRevenue > kpis.totalRevenue * 1.2) {
    alerts.push({
      type: 'info',
      title: 'Прогнозируется рост выручки',
      message: `Ожидается увеличение на ${Math.round(((predictions.nextMonthRevenue - kpis.totalRevenue) / kpis.totalRevenue) * 100)}%`,
      action: 'Подготовьтесь к увеличению нагрузки'
    });
  }

  return alerts;
}

// Функция для конвертации в CSV
function convertToCSV(data: any): string {
  const lines: string[] = [];
  
  lines.push('Performance Report');
  lines.push(`Period: ${data.period.type}`);
  lines.push(`Generated: ${data.generatedAt}`);
  lines.push('');

  lines.push('Key Performance Indicators');
  lines.push('Metric,Value');
  lines.push(`Completion Rate,${data.kpis.completionRate}%`);
  lines.push(`Cancellation Rate,${data.kpis.cancellationRate}%`);
  lines.push(`No Show Rate,${data.kpis.noShowRate}%`);
  lines.push(`Total Revenue,${data.kpis.totalRevenue}`);
  lines.push(`Avg Sessions Per Client,${data.kpis.avgSessionsPerClient}`);
  lines.push('');

  if (data.trainerPerformance && data.trainerPerformance.length > 0) {
    lines.push('Trainer Performance');
    lines.push('Name,Total Sessions,Completed,Cancelled,Completion Rate,Revenue');
    data.trainerPerformance.forEach((trainer: TrainerPerformance) => {
      lines.push(`${trainer.name},${trainer.totalSessions},${trainer.completedSessions},${trainer.cancelledSessions},${trainer.completionRate}%,${trainer.revenue}`);
    });
    lines.push('');
  }

  if (data.dailyTrends && data.dailyTrends.length > 0) {
    lines.push('Daily Trends');
    lines.push('Date,Total Sessions,Completed,Cancelled,Completion Rate,Revenue');
    data.dailyTrends.forEach((day: DailyTrend) => {
      lines.push(`${day.date},${day.totalSessions},${day.completedSessions},${day.cancelledSessions},${day.completionRate}%,${day.revenue}`);
    });
    lines.push('');
  }

  if (data.recommendations && data.recommendations.length > 0) {
    lines.push('Recommendations');
    lines.push('Priority,Title,Description');
    data.recommendations.forEach((rec: Recommendation) => {
      lines.push(`${rec.priority},${rec.title},"${rec.description}"`);
    });
  }

  return lines.join('\n');
}

// Вспомогательная функция для получения данных производительности
async function getPerformanceData(
  user: User, 
  period: string, 
  trainerId?: string | null
) {
  // Фильтрация данных по правам доступа
  let sessions = [...mockSessions];
  let trainers = [...mockTrainers];
  let clients = [...mockClients];

  if (user.role === 'trainer') {
    sessions = sessions.filter(s => s.trainerId === user.id);
    trainers = trainers.filter(t => t.id === user.id);
    clients = clients.filter(c => c.trainerId === user.id);
  } else if (trainerId && (user.role === 'admin' || user.role === 'manager')) {
    sessions = sessions.filter(s => s.trainerId === trainerId);
    clients = clients.filter(c => c.trainerId === trainerId);
    trainers = trainers.filter(t => t.id === trainerId);
  }

  // Определение временного периода
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
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

  const periodSessions = sessions.filter(session => {
    const sessionDate = new Date(`${session.date}T${session.startTime}`);
    return sessionDate >= startDate;
  });

  // Расчет KPI
  const totalSessions = periodSessions.length;
  const completedSessions = periodSessions.filter(s => s.status === 'completed');
  const cancelledSessions = periodSessions.filter(s => s.status === 'cancelled');
  const noShowSessions = periodSessions.filter(s => s.status === 'no-show');

  const kpis = {
    completionRate: totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0,
    cancellationRate: totalSessions > 0 ? Math.round((cancelledSessions.length / totalSessions) * 100) : 0,
    noShowRate: totalSessions > 0 ? Math.round((noShowSessions.length / totalSessions) * 100) : 0,
    clientRetentionRate: 85,
    avgSessionsPerClient: clients.length > 0 ? Math.round(completedSessions.length / clients.length) : 0,
    revenuePerSession: 2000,
    totalRevenue: completedSessions.length * 2000
  };

  // Производительность по тренерам
  let trainerPerformance: TrainerPerformance[] = [];
  if (user.role === 'admin' || user.role === 'manager') {
    trainerPerformance = trainers.map(trainer => {
      const trainerSessions = periodSessions.filter(s => s.trainerId === trainer.id);
      const trainerCompleted = trainerSessions.filter(s => s.status === 'completed');
      const trainerCancelled = trainerSessions.filter(s => s.status === 'cancelled');
      
      return {
        id: trainer.id,
        name: trainer.name,
        totalSessions: trainerSessions.length,
        completedSessions: trainerCompleted.length,
        cancelledSessions: trainerCancelled.length,
        completionRate: trainerSessions.length > 0 ? Math.round((trainerCompleted.length / trainerSessions.length) * 100) : 0,
        revenue: trainerCompleted.length * 2000,
        avgRating: trainer.rating || 0,
        clientCount: new Set(trainerSessions.map(s => s.clientId)).size
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  }

  // Тренды по дням
  const dailyTrends: DailyTrend[] = [];
  const days = period === 'year' ? 30 : period === 'quarter' ? 15 : 7;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const daySessions = periodSessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate.toDateString() === date.toDateString();
    });

    const dayCompleted = daySessions.filter(s => s.status === 'completed');
    const dayCancelled = daySessions.filter(s => s.status === 'cancelled');
    
    dailyTrends.push({
      date: date.toISOString().split('T')[0],
      totalSessions: daySessions.length,
      completedSessions: dayCompleted.length,
      cancelledSessions: dayCancelled.length,
      completionRate: daySessions.length > 0 ? Math.round((dayCompleted.length / daySessions.length) * 100) : 0,
      revenue: dayCompleted.length * 2000
    });
  }

  // Анализ загрузки по часам
  const hourlyLoad: HourlyLoad[] = Array.from({ length: 24 }, (_, hour) => {
    const hourSessions = periodSessions.filter(session => {
      const startHour = parseInt(session.startTime.split(':')[0]);
      return startHour === hour;
    });

    return {
      hour,
      sessions: hourSessions.length,
      utilization: Math.round((hourSessions.length / Math.max(1, trainers.length)) * 100)
    };
  }).filter(h => h.sessions > 0);

  // Анализ типов сессий
  const sessionTypeAnalysis: Record<string, SessionTypeData> = {
    personal: {
      count: periodSessions.filter(s => s.type === 'personal').length,
      completed: periodSessions.filter(s => s.type === 'personal' && s.status === 'completed').length,
      revenue: periodSessions.filter(s => s.type === 'personal' && s.status === 'completed').length * 2000
    },
    group: {
      count: periodSessions.filter(s => s.type === 'group').length,
      completed: periodSessions.filter(s => s.type === 'group' && s.status === 'completed').length,
      revenue: periodSessions.filter(s => s.type === 'group' && s.status === 'completed').length * 1500
    },
    consultation: {
      count: periodSessions.filter(s => s.type === 'consultation').length,
      completed: periodSessions.filter(s => s.type === 'consultation' && s.status === 'completed').length,
      revenue: periodSessions.filter(s => s.type === 'consultation' && s.status === 'completed').length * 1000
    }
  };

  // Клиентская активность
  const clientActivity: ClientActivityData[] = clients.map(client => {
    const clientSessions = periodSessions.filter(s => s.clientId === client.id);
    const lastSession = clientSessions.length > 0 
      ? Math.max(...clientSessions.map(s => new Date(`${s.date}T${s.startTime}`).getTime()))
      : null;
    return {
      id: client.id,
      name: client.name,
      totalSessions: clientSessions.length,
      completedSessions: clientSessions.filter(s => s.status === 'completed').length,
      lastSessionDate: lastSession ? new Date(lastSession).toISOString().split('T')[0] : null,
      isActive: lastSession ? (Date.now() - lastSession) < (30 * 24 * 60 * 60 * 1000) : false
    };
  });

  const activeClients = clientActivity.filter(c => c.isActive).length;
  const inactiveClients = clientActivity.filter(c => !c.isActive).length;

  // Прогнозы и рекомендации
  const predictions = {
    nextMonthRevenue: Math.round(kpis.totalRevenue * 1.1),
    potentialNewClients: Math.round(activeClients * 0.2),
    recommendedTrainerHours: Math.round(completedSessions.length * 1.2),
    expectedGrowth: Math.round(((completedSessions.length - (completedSessions.length * 0.9)) / (completedSessions.length * 0.9)) * 100),
    optimalCapacity: Math.round(trainers.length * 40),
    utilizationForecast: Math.round((completedSessions.length / Math.max(1, trainers.length * 30)) * 100)
  };

  const recommendations: Recommendation[] = [];
  
  if (kpis.completionRate < 85) {
    recommendations.push({
      type: 'warning',
      title: 'Низкий процент завершения сессий',
      description: 'Рассмотрите улучшение планирования и коммуникации с клиентами',
      priority: 'high'
    });
  }

  if (kpis.cancellationRate > 15) {
    recommendations.push({
      type: 'warning',
      title: 'Высокий процент отмен',
      description: 'Внедрите систему подтверждения записей за день до сессии',
      priority: 'medium'
    });
  }

  if (inactiveClients > activeClients * 0.3) {
    recommendations.push({
      type: 'info',
      title: 'Много неактивных клиентов',
      description: 'Запустите программу реактивации клиентов',
      priority: 'medium'
    });
  }

  if (kpis.noShowRate > 10) {
    recommendations.push({
      type: 'warning',
      title: 'Высокий процент неявок',
      description: 'Внедрите систему напоминаний и штрафов за неявку',
      priority: 'high'
    });
  }

  if (predictions.utilizationForecast > 90) {
    recommendations.push({
      type: 'info',
      title: 'Высокая загрузка тренеров',
      description: 'Рассмотрите возможность найма дополнительных тренеров',
      priority: 'medium'
    });
  }

  if (kpis.completionRate > 95) {
    recommendations.push({
      type: 'success',
      title: 'Отличная производительность',
      description: 'Поддерживайте текущий уровень качества обслуживания',
      priority: 'low'
    });
  }

  // Дополнительная аналитика
  const additionalMetrics = {
    averageSessionDuration: 60,
    peakHours: hourlyLoad.slice().sort((a, b) => b.sessions - a.sessions).slice(0, 3),
    mostPopularSessionType: Object.entries(sessionTypeAnalysis)
      .sort(([,a], [,b]) => b.completed - a.completed)[0]?.[0] || 'personal',
    clientSatisfactionScore: 4.2,
    trainerUtilizationRate: Math.round((completedSessions.length / Math.max(1, trainers.length * 20)) * 100),
    seasonalTrend: 'stable' as const,
    conversionRate: Math.round((clients.length / (clients.length + 10)) * 100)
  };

  return {
    period: {
      type: period,
      start: startDate.toISOString(),
      end: now.toISOString(),
      daysCount: Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    },
    kpis,
    trainerPerformance,
    dailyTrends: dailyTrends.filter(d => d.totalSessions > 0),
    hourlyLoad,
    sessionTypeAnalysis,
    clientActivity: {
      active: activeClients,
      inactive: inactiveClients,
      total: clients.length,
      retentionRate: clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0,
      topClients: clientActivity
        .sort((a, b) => b.completedSessions - a.completedSessions)
        .slice(0, 5),
      churnRisk: clientActivity
        .filter(c => !c.isActive && c.totalSessions > 0)
        .sort((a, b) => (b.lastSessionDate || '').localeCompare(a.lastSessionDate || ''))
        .slice(0, 10)
    },
    predictions,
    recommendations,
    additionalMetrics,
    benchmarks: {
      industryCompletionRate: 88,
      industryCancellationRate: 12,
      industryNoShowRate: 8,
      industryRetentionRate: 75,
      industryUtilizationRate: 70
    },
    comparisons: {
      completionRateVsIndustry: kpis.completionRate - 88,
      cancellationRateVsIndustry: kpis.cancellationRate - 12,
      noShowRateVsIndustry: kpis.noShowRate - 8,
      retentionRateVsIndustry: (clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0) - 75
    },
    trends: {
      weekOverWeek: {
        sessions: Math.round((Math.random() - 0.5) * 20),
        revenue: Math.round((Math.random() - 0.5) * 15),
        completionRate: Math.round((Math.random() - 0.5) * 10)
      },
      monthOverMonth: {
        sessions: Math.round((Math.random() - 0.5) * 30),
        revenue: Math.round((Math.random() - 0.5) * 25),
        completionRate: Math.round((Math.random() - 0.5) * 15)
      }
    },
    alerts: generateAlerts(kpis, predictions, activeClients, inactiveClients),
    generatedAt: now.toISOString()
  };
}

// GET /api/analytics/performance - Получение метрик производительности
export async function GET(request: NextRequest) {
  try {
    console.log('⚡ API: получение метрик производительности');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    const trainerId = url.searchParams.get('trainerId');

    const performanceData = await getPerformanceData(user, period, trainerId);

    console.log(`✅ API: метрики производительности сформированы для ${user.role}`);

    return NextResponse.json({
      success: true,
      data: performanceData,
      meta: {
        scope: user.role === 'trainer' ? 'personal' : 'global',
        trainerId: user.role === 'trainer' ? user.id : trainerId,
        dataPoints: {
          sessions: performanceData.dailyTrends.length,
          trainers: performanceData.trainerPerformance.length,
          clients: performanceData.clientActivity.total,
          period: period
        }
      }
    });

  } catch (error: any) {
    console.error('💥 API: ошибка получения метрик производительности:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения метрик производительности' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/performance - Экспорт отчета о производительности
export async function POST(request: NextRequest) {
  try {
    console.log('📊 API: экспорт отчета о производительности');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'export')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      period = 'month',
      format = 'json',
      trainerId,
      includeDetails = true,
      includeCharts = false
    } = body;

    if (user.role === 'trainer' && trainerId && trainerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для экспорта данных других тренеров' },
        { status: 403 }
      );
    }

    const performanceData = await getPerformanceData(user, period, trainerId);

    // Создаем копию объекта для экспорта
    const exportData: any = {
      ...performanceData,
      exportInfo: {
        exportedBy: user.name,
        exportedAt: new Date().toISOString(),
        format,
        includeDetails,
        includeCharts
      }
    };

    // Удаляем детальные данные если не требуются
    if (!includeDetails) {
      if ('trainerPerformance' in exportData) {
        delete (exportData as any).trainerPerformance;
      }
      if ('clientActivity' in exportData) {
        delete (exportData as any).clientActivity;
      }
      if ('dailyTrends' in exportData) {
        delete (exportData as any).dailyTrends;
      }
    }

    let responseBody: string;
    let contentType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        responseBody = convertToCSV(exportData);
        contentType = 'text/csv';
        filename = `performance_report_${period}_${timestamp}.csv`;
        break;
      
      case 'excel':
        responseBody = JSON.stringify(exportData, null, 2);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `performance_report_${period}_${timestamp}.xlsx`;
        break;
      
      default:
        responseBody = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        filename = `performance_report_${period}_${timestamp}.json`;
    }

    console.log(`✅ API: отчет экспортирован в формате ${format}`);

    return NextResponse.json({
      success: true,
      data: {
        content: responseBody,
        filename,
        contentType,
        size: responseBody.length
      },
      message: 'Отчет успешно сформирован'
    });

  } catch (error: any) {
    console.error('💥 API: ошибка экспорта отчета:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка экспорта отчета о производительности' },
      { status: 500 }
    );
  }
}

// PUT /api/analytics/performance - Обновление настроек аналитики
export async function PUT(request: NextRequest) {
  try {
    console.log('⚙️ API: обновление настроек аналитики');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'write')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      defaultPeriod = 'month',
      autoRefresh = true,
      refreshInterval = 300,
      emailReports = false,
      alertThresholds = {
        completionRate: 85,
        cancellationRate: 15,
        noShowRate: 10
      },
      dashboardLayout = 'default'
    } = body;

    const validPeriods = ['week', 'month', 'quarter', 'year'];
    if (!validPeriods.includes(defaultPeriod)) {
      return NextResponse.json(
        { success: false, error: 'Некорректный период по умолчанию' },
        { status: 400 }
      );
    }

    if (refreshInterval < 60 || refreshInterval > 3600) {
      return NextResponse.json(
        { success: false, error: 'Интервал обновления должен быть от 60 до 3600 секунд' },
        { status: 400 }
      );
    }

    const settings = {
      userId: user.id,
      defaultPeriod,
      autoRefresh,
      refreshInterval,
      emailReports,
      alertThresholds: {
        completionRate: Math.max(0, Math.min(100, alertThresholds.completionRate)),
        cancellationRate: Math.max(0, Math.min(100, alertThresholds.cancellationRate)),
        noShowRate: Math.max(0, Math.min(100, alertThresholds.noShowRate))
      },
      dashboardLayout,
      updatedAt: new Date().toISOString()
    };

    console.log(`✅ API: настройки аналитики обновлены для пользователя ${user.id}`);

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Настройки аналитики успешно обновлены'
    });

  } catch (error: any) {
    console.error('💥 API: ошибка обновления настроек аналитики:', error);
    return NextResponse.json(
            { success: false, error: 'Ошибка обновления настроек аналитики' },
      { status: 500 }
    );
  }
}

// DELETE /api/analytics/performance - Очистка кэша аналитики
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: очистка кэша аналитики');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'write')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const cacheType = url.searchParams.get('type') || 'all';

    const clearedCaches = [];

    switch (cacheType) {
      case 'performance':
        clearedCaches.push('performance_metrics');
        break;
      case 'trends':
        clearedCaches.push('daily_trends', 'hourly_trends');
        break;
      case 'reports':
        clearedCaches.push('generated_reports');
        break;
      case 'all':
      default:
        clearedCaches.push('performance_metrics', 'daily_trends', 'hourly_trends', 'generated_reports');
    }

    console.log(`✅ API: кэш аналитики очищен (${clearedCaches.join(', ')})`);

    return NextResponse.json({
      success: true,
      data: {
        clearedCaches,
        clearedAt: new Date().toISOString(),
        clearedBy: user.id
      },
      message: `Кэш аналитики успешно очищен: ${clearedCaches.join(', ')}`
    });

  } catch (error: any) {
    console.error('💥 API: ошибка очистки кэша аналитики:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка очистки кэша аналитики' },
      { status: 500 }
    );
  }
}

// PATCH /api/analytics/performance - Обновление конкретных метрик
export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 API: обновление конкретных метрик');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'write')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      metrics = [],
      period = 'month',
      trainerId,
      forceRefresh = false
    } = body;

    if (user.role === 'trainer' && trainerId && trainerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для обновления метрик других тренеров' },
        { status: 403 }
      );
    }

    const validMetrics = [
      'kpis',
      'trainerPerformance', 
      'dailyTrends',
      'hourlyLoad',
      'sessionTypeAnalysis',
      'clientActivity',
      'predictions',
      'recommendations'
    ];

    const invalidMetrics = metrics.filter((m: string) => !validMetrics.includes(m));
    if (invalidMetrics.length > 0) {
      return NextResponse.json(
        { success: false, error: `Некорректные метрики: ${invalidMetrics.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedMetrics: Record<string, any> = {};
    const timestamp = new Date().toISOString();

    metrics.forEach((metric: string) => {
      switch (metric) {
        case 'kpis':
          updatedMetrics.kpis = {
            completionRate: Math.round(Math.random() * 100),
            cancellationRate: Math.round(Math.random() * 20),
            noShowRate: Math.round(Math.random() * 15),
            updatedAt: timestamp
          };
          break;
        case 'trainerPerformance':
          updatedMetrics.trainerPerformance = {
            topPerformer: 'Иван Петров',
            averageRating: 4.5,
            updatedAt: timestamp
          };
          break;
        case 'predictions':
          updatedMetrics.predictions = {
            nextMonthRevenue: Math.round(50000 + Math.random() * 20000),
            expectedGrowth: Math.round((Math.random() - 0.5) * 20),
            updatedAt: timestamp
          };
          break;
        default:
          updatedMetrics[metric] = {
            status: 'updated',
            updatedAt: timestamp
          };
      }
    });

    console.log(`✅ API: метрики обновлены: ${metrics.join(', ')}`);

    return NextResponse.json({
      success: true,
      data: {
        updatedMetrics,
        period,
        trainerId,
        forceRefresh,
        updatedAt: timestamp
      },
      message: `Метрики успешно обновлены: ${metrics.join(', ')}`
    });

  } catch (error: any) {
    console.error('💥 API: ошибка обновления метрик:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления метрик' },
      { status: 500 }
    );
  }
}

