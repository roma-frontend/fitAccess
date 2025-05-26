// lib/types.ts
// Дополнительные типы для системы

export type UserRole = 'admin' | 'manager' | 'trainer' | 'client';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'trial';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type SessionType = 'personal' | 'group' | 'consultation';
export type MembershipType = 'basic' | 'premium' | 'vip';

// Расширенные типы для фильтрации и сортировки
export interface FilterOptions {
  status?: UserStatus[];
  role?: UserRole[];
  membershipType?: MembershipType[];
  trainerId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Типы для форм
export interface CreateClientForm {
  name: string;
  email: string;
  phone?: string;
  trainerId?: string;
  membershipType: MembershipType;
  birthDate?: string;
  goals?: string[];
  medicalInfo?: string;
  emergencyContact?: string;
}

export interface CreateTrainerForm {
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  hourlyRate: number;
  certifications: string[];
  workingHours: import('./mock-data').WorkingHours;
}

export interface CreateSessionForm {
  trainerId: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SessionType;
  notes?: string;
}

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Типы для уведомлений
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Типы для календаря
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'session' | 'break' | 'unavailable';
  trainer?: string;
  client?: string;
  status?: SessionStatus;
  color?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
  sessionId?: string;
}

// Типы для дашборда
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalTrainers: number;
  activeTrainers: number;
  todaySessions: number;
  thisWeekSessions: number;
  monthlyRevenue: number;
  completionRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

// Типы для настроек
export interface AppSettings {
  businessHours: {
    start: string;
    end: string;
  };
  timeSlotDuration: number; // в минутах
  maxAdvanceBooking: number; // в днях
  cancellationPolicy: {
    hoursBeforeSession: number;
    penaltyPercentage: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderHours: number;
  };
  currency: string;
  timezone: string;
  language: string;
}

// Типы для экспорта
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ExportType = 'clients' | 'trainers' | 'sessions' | 'payments' | 'reports';

export interface ExportOptions {
  type: ExportType;
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: FilterOptions;
  includeFields?: string[];
}
