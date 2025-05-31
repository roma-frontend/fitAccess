// components/admin/schedule/types.ts (обновленная версия)
export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'break' | 'other' | 'meeting';
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  // ✅ ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ ПОЛЯ
  price?: number;
  duration?: number;
  goals?: string[];
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface TrainerSchedule {
  trainerId: string;
  trainerName: string;
  trainerRole: string;
  events: ScheduleEvent[];
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
}

// ✅ ДОБАВЛЯЕМ ТИПЫ ДЛЯ ФОРМ
export interface CreateEventData {
  title: string;
  description?: string;
  type: ScheduleEvent['type'];
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status?: ScheduleEvent['status'];
  location?: string;
  notes?: string;
  price?: number;
  duration?: number;
  goals?: string[];
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
}

export interface UpdateEventData extends CreateEventData {
  id: string;
}

export interface ScheduleStats {
  totalEvents: number;
  todayEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  pendingConfirmation: number;
  overdueEvents: number;
  byTrainer: Array<{
    trainerId: string;
    trainerName: string;
    eventCount: number;
  }>;
  byType: {
    training: number;
    consultation: number;
    group: number;
    meeting: number;
    break: number;
    other: number;
  };
  byStatus: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    'no-show': number;
  };
  utilizationRate: number;
  averageDuration: number; // в минутах
  busyHours: Array<{
    hour: number;
    eventCount: number;
  }>;
}

export interface EventFilter {
  trainerId?: string;
  clientId?: string;
  status?: ScheduleEvent['status'];
  type?: ScheduleEvent['type'];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  trainerId?: string;
  eventId?: string;
}

export interface WorkingHours {
  start: string;
  end: string;
  days: number[];
}

// ✅ ТИПЫ ДЛЯ КОМПОНЕНТОВ
export interface TrainerOption {
  id: string;
  name: string;
  role: string;
}

export interface ClientOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

// ✅ ТИПЫ ДЛЯ API ОТВЕТОВ
export interface EventResponse {
  success: boolean;
  event?: ScheduleEvent;
  error?: string;
}

export interface EventsResponse {
  success: boolean;
  events?: ScheduleEvent[];
  stats?: ScheduleStats;
  error?: string;
}
