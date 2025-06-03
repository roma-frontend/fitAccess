// types/trainer.ts (дополненная версия)
export interface Trainer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  hourlyRate: number;
  certifications: string[];
  bio: string;
  avatar: string;
  rating?: number;
  isActive?: boolean;
  status?: string;
  activeClients?: number;
  totalSessions?: number;
  createdAt?: number;
  _creationTime?: number;
}

export interface Member {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  status: string;
  membershipExpiry?: number;
  membershipType?: string;
  joinDate?: number;
  createdAt?: number;
  lastVisit?: number;
  trainerId?: string;
}

export interface Client {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "trial" | "inactive";
  joinDate: string;
  trainerId?: string;
  trainerName?: string;
  totalWorkouts?: number;
  progress?: number;
  lastWorkout?: string;
  createdAt?: number;
  _creationTime?: number;
}

export interface Workout {
  id?: string;
  _id?: string;
  trainerId: string;
  userId: string;
  clientName?: string;
  userName?: string;
  type?: "personal" | "group" | "cardio" | "strength" | "yoga" | "pilates" | "crossfit";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  date?: string;
  time?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  location?: string;
  notes?: string;
  price?: number;
  cancellationReason?: string;
  completedAt?: string;
  createdAt?: string;
  _creationTime?: number;
}

export interface UserBooking {
  id?: string;
  _id?: string;
  userId: string;
  trainerId: string;
  userName?: string;
  trainerName?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  type?: string;
  location?: string;
  notes?: string;
  price?: number;
  createdAt?: string;
  _creationTime?: number;
}

// Статистические интерфейсы
export interface TrainerStats {
  totalTrainers: number;
  activeTrainers: number;
  avgRating: number;
  totalSessions: number;
  totalRevenue: number;
}

export interface MessageStats {
  unreadMessages: number;
  totalMessages: number;
  urgentMessages: number;
}

export interface WorkoutStats {
  todayWorkouts: number;
  completedWorkouts: number;
  scheduledWorkouts: number;
  cancelledWorkouts: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  expiringSoon: number;
  newThisMonth: number;
  retention: number;
}

export interface ClientStats {
  total: number;
  active: number;
  trial: number;
  inactive: number;
  newThisMonth: number;
  retention: number;
}

// Дополнительные типы для сообщений
export interface Message {
  id: string;
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
  priority?: 'normal' | 'urgent';
  readAt?: Record<string, number>;
  createdAt?: string;
  _creationTime?: number;
}

// Типы для фильтров и пагинации
export interface TrainerFilters {
  search?: string;
  status?: string;
  specialization?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

// Типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TrainersApiResponse {
  success: boolean;
  data: Trainer[];
  pagination: PaginationInfo;
  stats: {
    active: number;
    inactive: number;
    suspended: number;
    specializations: string[];
  };
}

// Типы для создания/обновления данных
export interface CreateTrainerData {
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  hourlyRate: number;
  certifications: string[];
  bio: string;
  avatar: string;
}

export interface UpdateWorkoutData {
  clientName?: string;
  type?: string;
  status?: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  date?: string;
  time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  price?: number;
  cancellationReason?: string;
}

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  urgent: boolean;
  read?: boolean;
}

// Типы для статистики доходов
export interface RevenueStats {
  total: number;
  average: number;
  growth: number;
  currentPeriodSessions: number;
  previousPeriodSessions: number;
  isLoading: boolean;
}

// Типы для топ тренеров
export interface TopTrainerStats extends Trainer {
  totalWorkouts: number;
  completedWorkouts: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
}

export interface TopTrainersData {
  topByRevenue: TopTrainerStats[];
  topByRating: TopTrainerStats[];
  topByWorkouts: TopTrainerStats[];
  isLoading: boolean;
}

// Типы для расписания
export interface ScheduleSession {
  id: string;
  type: 'workout' | 'booking';
  time: number;
  clientName: string;
  timeFormatted: string;
  status: string;
  duration?: number;
  location?: string;
  notes?: string;
  price?: number;
}

export interface TodaySchedule {
  sessions: ScheduleSession[];
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  inProgress: number;
}

// Типы для месячной статистики
export interface MonthlyStatsData {
  month: number;
  monthName: string;
  workouts: number;
  bookings: number;
  totalSessions: number;
  newMembers: number;
  newClients: number;
  completedSessions: number;
  revenue: number;
}

// Типы для поиска
export interface SearchResult {
  results: any[];
  total: number;
  isLoading: boolean;
}

// Типы для статистики тренировок
export interface WorkoutTypeStats {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalRevenue: number;
  averagePrice: number;
  isLoading: boolean;
}
