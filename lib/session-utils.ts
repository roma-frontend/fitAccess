// lib/session-utils.ts
import { Session, mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';

export interface SessionWithDetails extends Session {
  trainerName: string;
  clientName: string;
  trainerPhone?: string;
  clientPhone?: string;
  trainerEmail?: string;
  clientEmail?: string;
}

// Функция для получения сессии с дополнительными деталями
export const getSessionWithDetails = (sessionId: string): SessionWithDetails | null => {
  const session = mockSessions.find(s => s.id === sessionId);
  if (!session) return null;

  const trainer = mockTrainers.find(t => t.id === session.trainerId);
  const client = mockClients.find(c => c.id === session.clientId);

  return {
    ...session,
    trainerName: trainer?.name || 'Неизвестный тренер',
    clientName: client?.name || 'Неизвестный клиент',
    trainerPhone: trainer?.phone,
    clientPhone: client?.phone,
    trainerEmail: trainer?.email,
    clientEmail: client?.email
  };
};

// Функция для проверки конфликтов времени
export const checkTimeConflict = (
  trainerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
): Session | null => {
  return mockSessions.find(s => 
    s.id !== excludeSessionId &&
    s.trainerId === trainerId &&
    s.status !== 'cancelled' &&
    s.date === date &&
    (
      (startTime >= s.startTime && startTime < s.endTime) ||
      (endTime > s.startTime && endTime <= s.endTime) ||
      (startTime <= s.startTime && endTime >= s.endTime)
    )
  ) || null;
};

// Функция для валидации времени сессии
export const validateSessionTime = (
  date: string,
  startTime: string,
  endTime: string
): { isValid: boolean; error?: string } => {
  const sessionDate = new Date(date);
  const now = new Date();
  
  // Проверка, что дата не в прошлом
  if (sessionDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return { isValid: false, error: 'Нельзя создать сессию в прошлом' };
  }

  // Проверка формата времени
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return { isValid: false, error: 'Некорректный формат времени' };
  }

  // Проверка логики времени
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  
  if (start >= end) {
    return { isValid: false, error: 'Время начала должно быть раньше времени окончания' };
  }

  // Проверка минимальной продолжительности (30 минут)
  const duration = end.getTime() - start.getTime();
  const minDuration = 30 * 60 * 1000; // 30 минут в миллисекундах
  
  if (duration < minDuration) {
    return { isValid: false, error: 'Минимальная продолжительность сессии - 30 минут' };
  }

  // Проверка максимальной продолжительности (4 часа)
  const maxDuration = 4 * 60 * 60 * 1000; // 4 часа в миллисекундах
  
  if (duration > maxDuration) {
    return { isValid: false, error: 'Максимальная продолжительность сессии - 4 часа' };
  }

  return { isValid: true };
};

// Функция для получения статистики сессий
export const getSessionStats = (trainerId?: string) => {
  let sessions = mockSessions;
  
  if (trainerId) {
    sessions = sessions.filter(s => s.trainerId === trainerId);
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    total: sessions.length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
    noShow: sessions.filter(s => s.status === 'no-show').length,
    today: sessions.filter(s => s.date === today).length,
    thisWeek: sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= thisWeekStart;
    }).length,
    thisMonth: sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= thisMonthStart;
    }).length,
    byType: {
      personal: sessions.filter(s => s.type === 'personal').length,
      group: sessions.filter(s => s.type === 'group').length,
      consultation: sessions.filter(s => s.type === 'consultation').length
    }
  };
};

// Функция для получения предстоящих сессий
export const getUpcomingSessions = (trainerId?: string, limit: number = 10): SessionWithDetails[] => {
  let sessions = mockSessions;
  
  if (trainerId) {
    sessions = sessions.filter(s => s.trainerId === trainerId);
  }

  const now = new Date();
  const upcoming = sessions
    .filter(s => {
      const sessionDateTime = new Date(`${s.date}T${s.startTime}`);
      return sessionDateTime > now && s.status === 'scheduled';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, limit);

  return upcoming.map(session => {
    const details = getSessionWithDetails(session.id);
    return details!;
  });
};

// Функция для получения дня недели
const getDayOfWeek = (date: string): keyof import('@/lib/mock-data').WorkingHours => {
  const dayNames: (keyof import('@/lib/mock-data').WorkingHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const dayIndex = new Date(date).getDay();
  return dayNames[dayIndex];
};

// Функция для получения доступных слотов для тренера
export const getAvailableSlots = (
  trainerId: string,
  date: string,
  duration: number = 60 // продолжительность в минутах
): string[] => {
  const trainer = mockTrainers.find(t => t.id === trainerId);
  if (!trainer) return [];

  // Получаем рабочие часы для данного дня
  const dayOfWeek = getDayOfWeek(date);
  const workingDay = trainer.workingHours[dayOfWeek];
  
  if (!workingDay || !workingDay.isWorking) return [];

  // Генерируем все возможные слоты
  const slots: string[] = [];
  const startHour = parseInt(workingDay.start.split(':')[0]);
  const startMinute = parseInt(workingDay.start.split(':')[1]);
  const endHour = parseInt(workingDay.end.split(':')[0]);
  const endMinute = parseInt(workingDay.end.split(':')[1]);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  for (let time = startTime; time + duration <= endTime; time += 30) { // слоты каждые 30 минут
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Проверяем, не занят ли слот
    const endSlotTime = time + duration;
    const endSlotHour = Math.floor(endSlotTime / 60);
    const endSlotMinute = endSlotTime % 60;
    const endTimeSlot = `${endSlotHour.toString().padStart(2, '0')}:${endSlotMinute.toString().padStart(2, '0')}`;
    
    const isBooked = mockSessions.some(session =>
      session.trainerId === trainerId &&
      session.date === date &&
      session.status !== 'cancelled' &&
      (
        (timeSlot >= session.startTime && timeSlot < session.endTime) ||
        (endTimeSlot > session.startTime && endTimeSlot <= session.endTime) ||
        (timeSlot <= session.startTime && endTimeSlot >= session.endTime)
      )
    );
    
    if (!isBooked) {
      slots.push(timeSlot);
    }
  }
  
  return slots;
};

// Функция для получения сессий по дате
export const getSessionsByDate = (date: string, trainerId?: string): SessionWithDetails[] => {
  let sessions = mockSessions.filter(s => s.date === date);
  
  if (trainerId) {
    sessions = sessions.filter(s => s.trainerId === trainerId);
  }

  return sessions
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(session => {
      const details = getSessionWithDetails(session.id);
      return details!;
    });
};

// Функция для получения сессий за период
export const getSessionsByDateRange = (
  startDate: string,
  endDate: string,
  trainerId?: string
): SessionWithDetails[] => {
  let sessions = mockSessions.filter(s => s.date >= startDate && s.date <= endDate);
  
  if (trainerId) {
    sessions = sessions.filter(s => s.trainerId === trainerId);
  }

  return sessions
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    })
    .map(session => {
      const details = getSessionWithDetails(session.id);
      return details!;
    });
};

// Функция для проверки доступности тренера
export const isTrainerAvailable = (
  trainerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
): boolean => {
  const trainer = mockTrainers.find(t => t.id === trainerId);
  if (!trainer) return false;

  // Проверяем рабочие часы
  const dayOfWeek = getDayOfWeek(date);
  const workingDay = trainer.workingHours[dayOfWeek];
  
  if (!workingDay || !workingDay.isWorking) return false;
  
  if (startTime < workingDay.start || endTime > workingDay.end) return false;

  // Проверяем конфликты с существующими сессиями
  const conflict = checkTimeConflict(trainerId, date, startTime, endTime, excludeSessionId);
  
  return !conflict;
};

// Функция для форматирования времени сессии
export const formatSessionTime = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

// Функция для получения продолжительности сессии в минутах
export const getSessionDuration = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60);
};

// Функция для получения статуса сессии с учетом времени
export const getSessionStatusWithTime = (session: Session): Session['status'] | 'overdue' => {
  if (session.status !== 'scheduled') return session.status;
  
  const now = new Date();
  const sessionDateTime = new Date(`${session.date}T${session.startTime}`);
  
  if (sessionDateTime < now) {
    return 'overdue';
  }
  
  return session.status;
};

// Функция для группировки сессий по дням
export const groupSessionsByDate = (sessions: SessionWithDetails[]): Record<string, SessionWithDetails[]> => {
  return sessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, SessionWithDetails[]>);
};

// Функция для получения следующей доступной даты для тренера
export const getNextAvailableDate = (trainerId: string, fromDate?: string): string | null => {
  const trainer = mockTrainers.find(t => t.id === trainerId);
  if (!trainer) return null;

  const startDate = fromDate ? new Date(fromDate) : new Date();
  const maxDays = 30; // Ищем в течение 30 дней

  for (let i = 0; i < maxDays; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    const availableSlots = getAvailableSlots(trainerId, dateString);
    if (availableSlots.length > 0) {
      return dateString;
    }
  }

  return null;
};

// Функция для получения рекомендуемого времени для сессии
export const getRecommendedTimeSlots = (
  trainerId: string,
  date: string,
  duration: number = 60
): Array<{ time: string; score: number; reason: string }> => {
  const availableSlots = getAvailableSlots(trainerId, date, duration);
  
  return availableSlots.map(slot => {
    const hour = parseInt(slot.split(':')[0]);
    let score = 5; // базовый балл
    let reason = 'Доступно';

        // Утренние часы (9-11) - высокий приоритет
    if (hour >= 9 && hour < 11) {
      score += 3;
      reason = 'Утренние часы - высокая энергия';
    }
    // Дневные часы (14-16) - средний приоритет
    else if (hour >= 14 && hour < 16) {
      score += 2;
      reason = 'Дневные часы - хорошее время';
    }
    // Вечерние часы (18-20) - высокий приоритет
    else if (hour >= 18 && hour < 20) {
      score += 3;
      reason = 'Вечерние часы - популярное время';
    }
    // Поздние вечерние часы (20-22) - средний приоритет
    else if (hour >= 20 && hour < 22) {
      score += 1;
      reason = 'Поздние вечерние часы';
    }
    // Очень ранние или очень поздние часы - низкий приоритет
    else if (hour < 8 || hour >= 22) {
      score -= 2;
      reason = 'Нестандартное время';
    }

    // Проверяем, есть ли сессии до или после этого слота
    const slotHour = parseInt(slot.split(':')[0]);
    const slotMinute = parseInt(slot.split(':')[1]);
    
    const hasSessionBefore = mockSessions.some(s => 
      s.trainerId === trainerId && 
      s.date === date && 
      s.status !== 'cancelled' &&
      parseInt(s.endTime.split(':')[0]) * 60 + parseInt(s.endTime.split(':')[1]) === slotHour * 60 + slotMinute
    );
    
    const hasSessionAfter = mockSessions.some(s => 
      s.trainerId === trainerId && 
      s.date === date && 
      s.status !== 'cancelled' &&
      parseInt(s.startTime.split(':')[0]) * 60 + parseInt(s.startTime.split(':')[1]) === (slotHour * 60 + slotMinute + duration)
    );

    if (hasSessionBefore || hasSessionAfter) {
      score += 1;
      reason += ' (оптимальное планирование)';
    }

    return { time: slot, score, reason };
  }).sort((a, b) => b.score - a.score);
};

// Функция для получения загруженности тренера по дням недели
export const getTrainerWorkload = (trainerId: string, weeks: number = 4): Record<string, number> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (weeks * 7));

  const sessions = mockSessions.filter(s => 
    s.trainerId === trainerId &&
    s.date >= startDate.toISOString().split('T')[0] &&
    s.date <= endDate.toISOString().split('T')[0] &&
    s.status === 'completed'
  );

  const workload = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0
  };

  sessions.forEach(session => {
    const dayOfWeek = getDayOfWeek(session.date);
    workload[dayOfWeek]++;
  });

  return workload;
};

// Функция для получения среднего времени между сессиями
export const getAverageSessionInterval = (trainerId: string): number => {
  const sessions = mockSessions
    .filter(s => s.trainerId === trainerId && s.status === 'completed')
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

  if (sessions.length < 2) return 0;

  let totalInterval = 0;
  for (let i = 1; i < sessions.length; i++) {
    const prevSession = new Date(`${sessions[i-1].date}T${sessions[i-1].endTime}`);
    const currentSession = new Date(`${sessions[i].date}T${sessions[i].startTime}`);
    totalInterval += currentSession.getTime() - prevSession.getTime();
  }

  return totalInterval / (sessions.length - 1) / (1000 * 60); // в минутах
};

// Функция для проверки, можно ли отменить сессию
export const canCancelSession = (session: Session): { canCancel: boolean; reason?: string } => {
  if (session.status !== 'scheduled') {
    return { canCancel: false, reason: 'Можно отменить только запланированные сессии' };
  }

  const now = new Date();
  const sessionDateTime = new Date(`${session.date}T${session.startTime}`);
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Минимум 24 часа до сессии для отмены
  if (hoursUntilSession < 24) {
    return { canCancel: false, reason: 'Отмена возможна минимум за 24 часа до сессии' };
  }

  return { canCancel: true };
};

// Функция для проверки, можно ли перенести сессию
export const canRescheduleSession = (session: Session): { canReschedule: boolean; reason?: string } => {
  if (session.status !== 'scheduled') {
    return { canReschedule: false, reason: 'Можно перенести только запланированные сессии' };
  }

  const now = new Date();
  const sessionDateTime = new Date(`${session.date}T${session.startTime}`);
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Минимум 12 часов до сессии для переноса
  if (hoursUntilSession < 12) {
    return { canReschedule: false, reason: 'Перенос возможен минимум за 12 часов до сессии' };
  }

  return { canReschedule: true };
};

// Функция для получения конфликтующих сессий при переносе
export const getConflictingSessions = (
  trainerId: string,
  newDate: string,
  newStartTime: string,
  newEndTime: string,
  excludeSessionId?: string
): SessionWithDetails[] => {
  const conflictingSessions = mockSessions.filter(s => 
    s.id !== excludeSessionId &&
    s.trainerId === trainerId &&
    s.status !== 'cancelled' &&
    s.date === newDate &&
    (
      (newStartTime >= s.startTime && newStartTime < s.endTime) ||
      (newEndTime > s.startTime && newEndTime <= s.endTime) ||
      (newStartTime <= s.startTime && newEndTime >= s.endTime)
    )
  );

  return conflictingSessions.map(session => {
    const details = getSessionWithDetails(session.id);
    return details!;
  });
};

// Функция для получения оптимального расписания на день
export const getOptimalDaySchedule = (
  trainerId: string,
  date: string
): Array<{
  time: string;
  type: 'session' | 'break' | 'available';
  session?: SessionWithDetails;
  duration?: number;
}> => {
  const trainer = mockTrainers.find(t => t.id === trainerId);
  if (!trainer) return [];

  const dayOfWeek = getDayOfWeek(date);
  const workingDay = trainer.workingHours[dayOfWeek];
  
  if (!workingDay || !workingDay.isWorking) return [];

  const schedule: Array<{
    time: string;
    type: 'session' | 'break' | 'available';
    session?: SessionWithDetails;
    duration?: number;
  }> = [];

  const sessions = getSessionsByDate(date, trainerId);
  const startHour = parseInt(workingDay.start.split(':')[0]);
  const startMinute = parseInt(workingDay.start.split(':')[1]);
  const endHour = parseInt(workingDay.end.split(':')[0]);
  const endMinute = parseInt(workingDay.end.split(':')[1]);

  let currentTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  while (currentTime < endTime) {
    const hour = Math.floor(currentTime / 60);
    const minute = currentTime % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Проверяем, есть ли сессия в это время
    const currentSession = sessions.find(s => 
      timeString >= s.startTime && timeString < s.endTime
    );

    if (currentSession) {
      // Если это начало сессии, добавляем её
      if (timeString === currentSession.startTime) {
        const duration = getSessionDuration(currentSession.startTime, currentSession.endTime);
        schedule.push({
          time: timeString,
          type: 'session',
          session: currentSession,
          duration
        });
        currentTime += duration;
      } else {
        currentTime += 30; // Пропускаем, так как сессия уже добавлена
      }
    } else {
      // Проверяем, нужен ли перерыв между сессиями
      const prevSession = sessions.find(s => s.endTime === timeString);
      const nextSession = sessions.find(s => s.startTime === timeString);

      if (prevSession && nextSession) {
        schedule.push({
          time: timeString,
          type: 'break',
          duration: 30
        });
        currentTime += 30;
      } else {
        // Доступное время
        let availableDuration = 30;
        const nextSessionStart = sessions.find(s => s.startTime > timeString)?.startTime;
        
        if (nextSessionStart) {
          const nextSessionTime = parseInt(nextSessionStart.split(':')[0]) * 60 + parseInt(nextSessionStart.split(':')[1]);
          availableDuration = Math.min(nextSessionTime - currentTime, 120); // Максимум 2 часа
        } else {
          availableDuration = Math.min(endTime - currentTime, 120);
        }

        schedule.push({
          time: timeString,
          type: 'available',
          duration: availableDuration
        });
        currentTime += 30; // Двигаемся с шагом 30 минут
      }
    }
  }

  return schedule;
};

// Функция для получения статистики эффективности тренера
export const getTrainerEfficiencyStats = (trainerId: string, days: number = 30): {
  utilizationRate: number;
  averageSessionsPerDay: number;
  cancellationRate: number;
  noShowRate: number;
  completionRate: number;
} => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const sessions = mockSessions.filter(s => 
    s.trainerId === trainerId &&
    s.date >= startDate.toISOString().split('T')[0] &&
    s.date <= endDate.toISOString().split('T')[0]
  );

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
  const noShowSessions = sessions.filter(s => s.status === 'no-show').length;

  // Расчет коэффициента использования времени
  const trainer = mockTrainers.find(t => t.id === trainerId);
  let totalWorkingHours = 0;
  let totalSessionHours = 0;

  if (trainer) {
    // Подсчитываем общее количество рабочих часов за период
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = getDayOfWeek(d.toISOString().split('T')[0]);
      const workingDay = trainer.workingHours[dayOfWeek];
      
      if (workingDay && workingDay.isWorking) {
        const startHour = parseInt(workingDay.start.split(':')[0]);
        const startMinute = parseInt(workingDay.start.split(':')[1]);
        const endHour = parseInt(workingDay.end.split(':')[0]);
        const endMinute = parseInt(workingDay.end.split(':')[1]);
        
        const dailyHours = (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60;
        totalWorkingHours += dailyHours;
      }
    }

    // Подсчитываем общее количество часов сессий
    sessions.forEach(session => {
      const duration = getSessionDuration(session.startTime, session.endTime);
      totalSessionHours += duration / 60;
    });
  }

  return {
    utilizationRate: totalWorkingHours > 0 ? Math.round((totalSessionHours / totalWorkingHours) * 100) : 0,
    averageSessionsPerDay: Math.round((totalSessions / days) * 10) / 10,
    cancellationRate: totalSessions > 0 ? Math.round((cancelledSessions / totalSessions) * 100) : 0,
    noShowRate: totalSessions > 0 ? Math.round((noShowSessions / totalSessions) * 100) : 0,
    completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
  };
};

// Дополнительные утилиты для работы с сессиями

// Функция для получения самого загруженного дня недели
export const getBusiestDayOfWeek = (trainerId: string): { day: string; sessionCount: number } => {
  const workload = getTrainerWorkload(trainerId);
  const dayNames = {
    monday: 'Понедельник',
    tuesday: 'Вторник', 
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  };

  let busiestDay = 'monday';
  let maxSessions = 0;

  Object.entries(workload).forEach(([day, count]) => {
    if (count > maxSessions) {
      maxSessions = count;
      busiestDay = day;
    }
  });

  return {
    day: dayNames[busiestDay as keyof typeof dayNames],
    sessionCount: maxSessions
  };
};

// Функция для получения рекомендаций по оптимизации расписания
export const getScheduleOptimizationSuggestions = (trainerId: string): Array<{
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
}> => {
  const suggestions: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }> = [];

  const stats = getTrainerEfficiencyStats(trainerId);
  const workload = getTrainerWorkload(trainerId);
  const trainer = mockTrainers.find(t => t.id === trainerId);

  if (!trainer) return suggestions;

  // Анализ загруженности
  if (stats.utilizationRate < 50) {
    suggestions.push({
      type: 'warning',
      title: 'Низкая загруженность',
      description: `Коэффициент использования времени составляет ${stats.utilizationRate}%`,
      action: 'Рассмотрите возможность увеличения количества клиентов или сокращения рабочих часов'
    });
  } else if (stats.utilizationRate > 85) {
    suggestions.push({
      type: 'warning',
      title: 'Высокая загруженность',
      description: `Коэффициент использования времени составляет ${stats.utilizationRate}%`,
      action: 'Рассмотрите возможность увеличения рабочих часов или перераспределения нагрузки'
    });
  } else {
    suggestions.push({
      type: 'success',
      title: 'Оптимальная загруженность',
      description: `Коэффициент использования времени составляет ${stats.utilizationRate}%`
    });
  }

  // Анализ отмен
  if (stats.cancellationRate > 15) {
    suggestions.push({
      type: 'warning',
      title: 'Высокий процент отмен',
      description: `${stats.cancellationRate}% сессий отменяются`,
      action: 'Проанализируйте причины отмен и рассмотрите изменение политики отмен'
    });
  }

  // Анализ неявок
  if (stats.noShowRate > 10) {
    suggestions.push({
      type: 'warning',
      title: 'Высокий процент неявок',
      description: `${stats.noShowRate}% клиентов не являются на сессии`,
      action: 'Внедрите систему напоминаний или штрафов за неявку'
    });
  }

  // Анализ распределения по дням недели
  const workloadValues = Object.values(workload);
  const maxWorkload = Math.max(...workloadValues);
  const minWorkload = Math.min(...workloadValues);
  
  if (maxWorkload - minWorkload > 5) {
    suggestions.push({
      type: 'info',
      title: 'Неравномерное распределение нагрузки',
      description: 'Нагрузка сильно различается по дням недели',
      action: 'Попробуйте перераспределить сессии для более равномерной загрузки'
    });
  }

  // Анализ рабочих часов
  const workingDays = Object.values(trainer.workingHours).filter(day => day.isWorking).length;
  if (workingDays < 5) {
    suggestions.push({
      type: 'info',
      title: 'Ограниченное количество рабочих дней',
      description: `Вы работаете ${workingDays} дней в неделю`,
      action: 'Рассмотрите возможность добавления дополнительных рабочих дней'
    });
  }

  // Проверка на длинные рабочие дни
  Object.entries(trainer.workingHours).forEach(([day, hours]) => {
    if (hours.isWorking) {
      const startHour = parseInt(hours.start.split(':')[0]);
      const endHour = parseInt(hours.end.split(':')[0]);
      const workingHours = endHour - startHour;
      
      if (workingHours > 10) {
        suggestions.push({
          type: 'warning',
          title: 'Длинный рабочий день',
          description: `${day}: ${workingHours} часов работы`,
          action: 'Рассмотрите возможность сокращения рабочего дня для предотвращения переутомления'
        });
      }
    }
  });

  return suggestions;
};

// Функция для получения статистики по типам сессий
export const getSessionTypeStats = (trainerId: string, days: number = 30): {
  personal: { count: number; percentage: number; avgDuration: number };
  group: { count: number; percentage: number; avgDuration: number };
  consultation: { count: number; percentage: number; avgDuration: number };
} => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const sessions = mockSessions.filter(s => 
    s.trainerId === trainerId &&
    s.date >= startDate.toISOString().split('T')[0] &&
    s.date <= endDate.toISOString().split('T')[0] &&
    s.status === 'completed'
  );

  const personalSessions = sessions.filter(s => s.type === 'personal');
  const groupSessions = sessions.filter(s => s.type === 'group');
  const consultationSessions = sessions.filter(s => s.type === 'consultation');

  const totalSessions = sessions.length;

  const calculateAvgDuration = (sessionList: Session[]): number => {
    if (sessionList.length === 0) return 0;
    const totalDuration = sessionList.reduce((sum, session) => {
      return sum + getSessionDuration(session.startTime, session.endTime);
    }, 0);
    return Math.round(totalDuration / sessionList.length);
  };

  return {
    personal: {
      count: personalSessions.length,
      percentage: totalSessions > 0 ? Math.round((personalSessions.length / totalSessions) * 100) : 0,
      avgDuration: calculateAvgDuration(personalSessions)
    },
    group: {
      count: groupSessions.length,
      percentage: totalSessions > 0 ? Math.round((groupSessions.length / totalSessions) * 100) : 0,
      avgDuration: calculateAvgDuration(groupSessions)
    },
    consultation: {
      count: consultationSessions.length,
      percentage: totalSessions > 0 ? Math.round((consultationSessions.length / totalSessions) * 100) : 0,
      avgDuration: calculateAvgDuration(consultationSessions)
    }
  };
};

// Функция для получения пиковых часов активности
export const getPeakHours = (trainerId: string, days: number = 30): Array<{
  hour: number;
  sessionCount: number;
  timeSlot: string;
}> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const sessions = mockSessions.filter(s => 
    s.trainerId === trainerId &&
    s.date >= startDate.toISOString().split('T')[0] &&
    s.date <= endDate.toISOString().split('T')[0] &&
    s.status === 'completed'
  );

  const hourlyStats: Record<number, number> = {};

  sessions.forEach(session => {
    const hour = parseInt(session.startTime.split(':')[0]);
    hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
  });

  return Object.entries(hourlyStats)
    .map(([hour, count]) => ({
      hour: parseInt(hour),
      sessionCount: count,
      timeSlot: `${hour.padStart(2, '0')}:00-${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);
};

// Функция для получения клиентов с наибольшим количеством сессий
export const getTopClientsBySessionCount = (trainerId: string, days: number = 30): Array<{
  clientId: string;
  clientName: string;
  sessionCount: number;
  lastSessionDate: string;
}> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const sessions = mockSessions.filter(s => 
    s.trainerId === trainerId &&
    s.date >= startDate.toISOString().split('T')[0] &&
    s.date <= endDate.toISOString().split('T')[0] &&
    s.status === 'completed'
  );

  const clientStats: Record<string, { count: number; lastDate: string }> = {};

  sessions.forEach(session => {
    if (!clientStats[session.clientId]) {
      clientStats[session.clientId] = { count: 0, lastDate: session.date };
    }
    clientStats[session.clientId].count++;
    if (session.date > clientStats[session.clientId].lastDate) {
      clientStats[session.clientId].lastDate = session.date;
    }
  });

  return Object.entries(clientStats)
    .map(([clientId, stats]) => {
      const client = mockClients.find(c => c.id === clientId);
      return {
        clientId,
        clientName: client?.name || 'Неизвестный клиент',
        sessionCount: stats.count,
        lastSessionDate: stats.lastDate
      };
    })
    .sort((a, b) => b.sessionCount - a.sessionCount);
};

// Функция для получения среднего времени между бронированием и проведением сессии
export const getAverageBookingLeadTime = (trainerId: string, days: number = 30): number => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const sessions = mockSessions.filter(s => 
    s.trainerId === trainerId &&
    s.date >= startDate.toISOString().split('T')[0] &&
    s.date <= endDate.toISOString().split('T')[0] &&
    s.status === 'completed'
  );

  if (sessions.length === 0) return 0;

  let totalLeadTime = 0;
  sessions.forEach(session => {
    const createdDate = new Date(session.createdAt);
    const sessionDate = new Date(`${session.date}T${session.startTime}`);
    const leadTime = sessionDate.getTime() - createdDate.getTime();
    totalLeadTime += leadTime;
  });

  return Math.round(totalLeadTime / sessions.length / (1000 * 60 * 60 * 24)); // в днях
};

// Функция для получения тенденций по месяцам
export const getMonthlyTrends = (trainerId: string, months: number = 6): Array<{
  month: string;
  year: number;
  sessionCount: number;
  completionRate: number;
  revenue: number;
}> => {
  const trends: Array<{
    month: string;
    year: number;
    sessionCount: number;
    completionRate: number;
    revenue: number;
  }> = [];

  const trainer = mockTrainers.find(t => t.id === trainerId);
  const hourlyRate = trainer?.hourlyRate || 0;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    const monthSessions = mockSessions.filter(s => 
      s.trainerId === trainerId &&
      s.date >= monthStart.toISOString().split('T')[0] &&
      s.date <= monthEnd.toISOString().split('T')[0]
    );

    const completedSessions = monthSessions.filter(s => s.status === 'completed');
    const completionRate = monthSessions.length > 0 
      ? Math.round((completedSessions.length / monthSessions.length) * 100) 
      : 0;

    const revenue = completedSessions.reduce((sum, session) => {
      const duration = getSessionDuration(session.startTime, session.endTime);
      return sum + (hourlyRate * duration / 60);
    }, 0);

    trends.push({
      month: new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date),
      year,
      sessionCount: monthSessions.length,
      completionRate,
      revenue: Math.round(revenue)
    });
  }

  return trends;
};

// Функция для получения прогноза загруженности
export const getForecastedWorkload = (trainerId: string, daysAhead: number = 14): Array<{
  date: string;
  scheduledSessions: number;
  availableSlots: number;
  utilizationForecast: number;
}> => {
  const forecast: Array<{
    date: string;
    scheduledSessions: number;
    availableSlots: number;
    utilizationForecast: number;
  }> = [];

  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dateString = forecastDate.toISOString().split('T')[0];
    
    const scheduledSessions = mockSessions.filter(s => 
      s.trainerId === trainerId &&
      s.date === dateString &&
      s.status === 'scheduled'
    ).length;

    const availableSlots = getAvailableSlots(trainerId, dateString).length;
    const totalPossibleSlots = scheduledSessions + availableSlots;
    const utilizationForecast = totalPossibleSlots > 0 
      ? Math.round((scheduledSessions / totalPossibleSlots) * 100) 
      : 0;

    forecast.push({
      date: dateString,
      scheduledSessions,
      availableSlots,
      utilizationForecast
    });
  }

  return forecast;
};

