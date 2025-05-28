// components/admin/schedule/types.ts
export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'break' | 'other';
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
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

export interface ScheduleStats {
  totalEvents: number;
  todayEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  pendingConfirmation: number;
  overdueEvents: number;
  utilizationRate: number; 
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
  byTrainer: Array<{
    trainerId: string;
    trainerName: string;
    eventCount: number;
  }>;
  averageDuration: number;
  busyHours: Array<{
    hour: number;
    eventCount: number;
  }>;
}

export interface CreateEventData {
  title: string;
  description?: string;
  type: ScheduleEvent['type'];
  startTime: string;
  endTime: string;
  trainerId: string;
  clientId?: string;
  location?: string;
  notes?: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
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
