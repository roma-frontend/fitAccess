// app/api/analytics/export-all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';

// GET /api/analytics/export-all - Полный экспорт аналитических данных
export const GET = withPermissions(
  { resource: 'analytics', action: 'export' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('📤 API: полный экспорт аналитических данных');

      const { user } = req;
      const url = new URL(req.url);
      const format = url.searchParams.get('format') || 'json';
      const period = url.searchParams.get('period') || 'year';
      const includePersonalData = url.searchParams.get('includePersonalData') === 'true';

      // Проверка прав на экспорт персональных данных
      if (includePersonalData && user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для экспорта персональных данных' },
          { status: 403 }
        );
      }

      // Фильтрация данных по правам доступа
      let sessions = [...mockSessions];
      let trainers = [...mockTrainers];
      let clients = [...mockClients];

      if (user.role === 'trainer') {
        sessions = sessions.filter(s => s.trainerId === user.id);
        trainers = trainers.filter(t => t.id === user.id);
        clients = clients.filter(c => c.trainerId === user.id);
      }

      // Определение временного периода
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'all':
          startDate = new Date(2020, 0, 1); // Начало данных
          break;
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
      }

      const periodSessions = sessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate >= startDate;
      });

      // Подготовка данных для экспорта
      const exportData = {
        metadata: {
          exportDate: now.toISOString(),
          exportedBy: user.email,
          period: {
            type: period,
            start: startDate.toISOString(),
            end: now.toISOString()
          },
          scope: user.role === 'trainer' ? 'personal' : 'global',
          includesPersonalData: includePersonalData,
          version: '1.0'
        },
        summary: {
          totalSessions: periodSessions.length,
          completedSessions: periodSessions.filter(s => s.status === 'completed').length,
          cancelledSessions: periodSessions.filter(s => s.status === 'cancelled').length,
          totalRevenue: periodSessions.filter(s => s.status === 'completed').length * 2000,
          uniqueClients: new Set(periodSessions.map(s => s.clientId)).size,
          activeTrainers: trainers.filter(t => t.status === 'active').length
        },
        sessions: periodSessions.map(session => ({
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          type: session.type,
          status: session.status,
          trainerId: session.trainerId,
          clientId: includePersonalData ? session.clientId : 'REDACTED',
          notes: includePersonalData ? session.notes : 'REDACTED'
        })),
        trainers: trainers.map(trainer => ({
          id: trainer.id,
          name: includePersonalData ? trainer.name : 'REDACTED',
          email: includePersonalData ? trainer.email : 'REDACTED',
          specialization: trainer.specialization,
          rating: trainer.rating,
          experience: trainer.experience,
          status: trainer.status,
          sessionsCount: periodSessions.filter(s => s.trainerId === trainer.id).length,
          completedSessions: periodSessions.filter(s => s.trainerId === trainer.id && s.status === 'completed').length,
          revenue: periodSessions.filter(s => s.trainerId === trainer.id && s.status === 'completed').length * 2000
        })),
        clients: includePersonalData ? clients.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          trainerId: client.trainerId,
          status: client.status,
          joinDate: client.joinDate,
          sessionsCount: periodSessions.filter(s => s.clientId === client.id).length,
          completedSessions: periodSessions.filter(s => s.clientId === client.id && s.status === 'completed').length,
          lastSessionDate: periodSessions
            .filter(s => s.clientId === client.id)
            .sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime())[0]?.date || null
        })) : [],
        analytics: {
          byMonth: generateMonthlyAnalytics(periodSessions, startDate, now),
          byTrainer: generateTrainerAnalytics(periodSessions, trainers),
          bySessionType: generateSessionTypeAnalytics(periodSessions),
          trends: generateTrendAnalytics(periodSessions, startDate)
        }
      };

      // Возврат в зависимости от формата
      if (format === 'csv') {
        const csvContent = convertToCSV(exportData);
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="analytics_export_${period}_${now.toISOString().split('T')[0]}.csv"`
          }
        });
      }

      if (format === 'excel') {
        // В реальном приложении здесь будет генерация Excel файла
        return NextResponse.json({
          success: false,
          error: 'Excel экспорт пока не поддерживается. Используйте JSON или CSV формат.'
        }, { status: 501 });
      }

      // JSON формат по умолчанию
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="analytics_export_${period}_${now.toISOString().split('T')[0]}.json"`
        }
      });

    } catch (error: any) {
      console.error('💥 API: ошибка полного экспорта аналитики:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка экспорта аналитических данных' },
        { status: 500 }
      );
    }
  }
);

// Вспомогательные функции для генерации аналитики
function generateMonthlyAnalytics(sessions: any[], startDate: Date, endDate: Date) {
  const monthlyData = [];
  const start = new Date(startDate);
  
  while (start <= endDate) {
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate.getMonth() === start.getMonth() && 
             sessionDate.getFullYear() === start.getFullYear();
    });

    monthlyData.push({
      month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      totalSessions: monthSessions.length,
      completedSessions: monthSessions.filter(s => s.status === 'completed').length,
      revenue: monthSessions.filter(s => s.status === 'completed').length * 2000,
      uniqueClients: new Set(monthSessions.map(s => s.clientId)).size
    });

    start.setMonth(start.getMonth() + 1);
  }

  return monthlyData;
}

function generateTrainerAnalytics(sessions: any[], trainers: any[]) {
  return trainers.map(trainer => {
    const trainerSessions = sessions.filter(s => s.trainerId === trainer.id);
    const completed = trainerSessions.filter(s => s.status === 'completed');
    
    return {
      trainerId: trainer.id,
      totalSessions: trainerSessions.length,
      completedSessions: completed.length,
      completionRate: trainerSessions.length > 0 ? Math.round((completed.length / trainerSessions.length) * 100) : 0,
      revenue: completed.length * 2000,
      uniqueClients: new Set(trainerSessions.map(s => s.clientId)).size,
      avgRating: trainer.rating || 0
    };
  });
}

function generateSessionTypeAnalytics(sessions: any[]) {
  const types = ['personal', 'group', 'consultation'];
  
  return types.map(type => {
    const typeSessions = sessions.filter(s => s.type === type);
    const completed = typeSessions.filter(s => s.status === 'completed');
    
    return {
      type,
      totalSessions: typeSessions.length,
      completedSessions: completed.length,
      completionRate: typeSessions.length > 0 ? Math.round((completed.length / typeSessions.length) * 100) : 0,
      revenue: completed.length * (type === 'group' ? 1500 : type === 'consultation' ? 1000 : 2000)
    };
  });
}

function generateTrendAnalytics(sessions: any[], startDate: Date) {
  // Простой анализ трендов по неделям
  const weeklyData = [];
  const start = new Date(startDate);
  const now = new Date();
  
  while (start <= now) {
    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 6);
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= start && sessionDate <= weekEnd;
    });

    weeklyData.push({
      weekStart: start.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalSessions: weekSessions.length,
      completedSessions: weekSessions.filter(s => s.status === 'completed').length,
      revenue: weekSessions.filter(s => s.status === 'completed').length * 2000
    });

    start.setDate(start.getDate() + 7);
  }

  // Расчет трендов
  const trends = {
    sessionsGrowth: calculateGrowthTrend(weeklyData.map(w => w.totalSessions)),
    revenueGrowth: calculateGrowthTrend(weeklyData.map(w => w.revenue)),
    completionTrend: calculateGrowthTrend(weeklyData.map(w => 
      w.totalSessions > 0 ? (w.completedSessions / w.totalSessions) * 100 : 0
    ))
  };

  return {
    weeklyData,
    trends
  };
}

function calculateGrowthTrend(data: number[]): string {
  if (data.length < 2) return 'insufficient_data';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  
  if (growthRate > 10) return 'strong_growth';
  if (growthRate > 5) return 'moderate_growth';
  if (growthRate > -5) return 'stable';
  if (growthRate > -10) return 'moderate_decline';
  return 'strong_decline';
}

function convertToCSV(data: any): string {
  const csvSections = [];
  
  // Метаданные
  csvSections.push('METADATA');
  csvSections.push(`Export Date,${data.metadata.exportDate}`);
  csvSections.push(`Exported By,${data.metadata.exportedBy}`);
  csvSections.push(`Period,${data.metadata.period.type}`);
  csvSections.push(`Scope,${data.metadata.scope}`);
  csvSections.push('');
  
  // Сводка
  csvSections.push('SUMMARY');
  csvSections.push('Metric,Value');
  csvSections.push(`Total Sessions,${data.summary.totalSessions}`);
  csvSections.push(`Completed Sessions,${data.summary.completedSessions}`);
  csvSections.push(`Cancelled Sessions,${data.summary.cancelledSessions}`);
  csvSections.push(`Total Revenue,${data.summary.totalRevenue}`);
  csvSections.push(`Unique Clients,${data.summary.uniqueClients}`);
  csvSections.push(`Active Trainers,${data.summary.activeTrainers}`);
  csvSections.push('');
  
  // Сессии
  csvSections.push('SESSIONS');
  csvSections.push('ID,Date,Start Time,End Time,Type,Status,Trainer ID,Client ID');
  data.sessions.forEach((session: any) => {
    csvSections.push(`${session.id},${session.date},${session.startTime},${session.endTime},${session.type},${session.status},${session.trainerId},${session.clientId}`);
  });
  csvSections.push('');
  
  // Тренеры
  csvSections.push('TRAINERS');
  csvSections.push('ID,Name,Email,Specialization,Rating,Experience,Status,Sessions Count,Completed Sessions,Revenue');
  data.trainers.forEach((trainer: any) => {
    csvSections.push(`${trainer.id},"${trainer.name}","${trainer.email}",${trainer.specialization},${trainer.rating},${trainer.experience},${trainer.status},${trainer.sessionsCount},${trainer.completedSessions},${trainer.revenue}`);
  });
  csvSections.push('');
  
  // Месячная аналитика
  csvSections.push('MONTHLY ANALYTICS');
  csvSections.push('Month,Total Sessions,Completed Sessions,Revenue,Unique Clients');
  data.analytics.byMonth.forEach((month: any) => {
    csvSections.push(`${month.month},${month.totalSessions},${month.completedSessions},${month.revenue},${month.uniqueClients}`);
  });
  
  return csvSections.join('\n');
}

