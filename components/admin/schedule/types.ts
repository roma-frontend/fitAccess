// components/admin/schedule/types.ts (обновленная версия)
export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'meeting' | 'break' | 'other';
  startTime: string; // ISO string
  endTime: string; // ISO string
  trainerId: string;
  trainerName: string;
  clientId?: string; // Может быть undefined
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

export interface TrainerSchedule {
  trainerId: string;
  trainerName: string;
  trainerRole: string;
  events: ScheduleEvent[];
  workingHours: {
    start: string; // "09:00"
    end: string; // "18:00"
    days: number[]; // [1,2,3,4,5] - пн-пт
  };
}

export interface ScheduleStats {
  totalEvents: number;
  todayEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  byTrainer: Record<string, number>;
  byType: Record<string, number>;
  utilizationRate: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  eventId?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  type: ScheduleEvent['type'];
  startTime: string;
  endTime: string;
  trainerId: string;
  clientId?: string; // Может быть undefined
  location?: string;
  notes?: string;
  recurring?: ScheduleEvent['recurring'];
}
