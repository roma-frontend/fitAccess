// lib/constants.ts
// Константы для приложения

export const APP_CONFIG = {
  name: 'FitClub Manager',
  version: '1.0.0',
  description: 'Система управления фитнес-клубом',
  author: 'FitClub Team'
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  CLIENT_DETAIL: '/clients/:id',
  TRAINERS: '/trainers',
  TRAINER_DETAIL: '/trainers/:id',
  SESSIONS: '/sessions',
  SESSION_DETAIL: '/sessions/:id',
  CALENDAR: '/calendar',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register'
} as const;

export const SESSION_TYPES = {
  PERSONAL: 'personal',
  GROUP: 'group',
  CONSULTATION: 'consultation'
} as const;

export const SESSION_STATUSES = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TRAINER: 'trainer',
  CLIENT: 'client'
} as const;

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export const MEMBERSHIP_TYPES = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  VIP: 'vip'
} as const;

export const SPECIALIZATIONS = [
  'Силовые тренировки',
  'Кардио тренировки',
  'Йога',
  'Пилатес',
  'Кроссфит',
  'Функциональный тренинг',
  'Бокс',
  'Кикбоксинг',
  'Самооборона',
  'Аэробика',
  'Зумба',
  'Танцы',
  'Растяжка',
  'Реабилитация',
  'Спортивная медицина'
] as const;

export const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00'
] as const;

export const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
} as const;

export const DAYS_OF_WEEK_RU = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье'
} as const;

export const SESSION_TYPE_LABELS = {
  personal: 'Персональная',
  group: 'Групповая',
  consultation: 'Консультация'
} as const;

export const SESSION_STATUS_LABELS = {
  scheduled: 'Запланирована',
  completed: 'Завершена',
  cancelled: 'Отменена',
  'no-show': 'Неявка'
} as const;

export const MEMBERSHIP_TYPE_LABELS = {
  basic: 'Базовое',
  premium: 'Премиум',
  vip: 'VIP'
} as const;

export const USER_STATUS_LABELS = {
  active: 'Активный',
  inactive: 'Неактивный',
  suspended: 'Заблокирован'
} as const;

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4'
} as const;

export const SESSION_TYPE_COLORS = {
  personal: '#3B82F6',
  group: '#10B981',
  consultation: '#F59E0B'
} as const;

export const SESSION_STATUS_COLORS = {
  scheduled: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
  'no-show': '#F59E0B'
} as const;

export const PAGINATION_LIMITS = [10, 25, 50, 100] as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 25
} as const;

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-$]{10,}$/,
  PASSWORD_MIN_LENGTH: 8,
  SESSION_MIN_DURATION: 30, // минуты
  SESSION_MAX_DURATION: 240, // минуты
  HOURLY_RATE_MIN: 500,
  HOURLY_RATE_MAX: 10000,
  EXPERIENCE_MAX: 50
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'dd.MM.yyyy HH:mm'
} as const;

export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000
} as const;

export const LOCAL_STORAGE_KEYS = {
  USER: 'fitclub_user',
  SETTINGS: 'fitclub_settings',
  THEME: 'fitclub_theme',
  LANGUAGE: 'fitclub_language'
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REGISTER: '/api/auth/register'
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: '/api/users/:id',
    CREATE: '/api/users',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id'
  },
  CLIENTS: {
    LIST: '/api/clients',
    DETAIL: '/api/clients/:id',
    CREATE: '/api/clients',
    UPDATE: '/api/clients/:id',
    DELETE: '/api/clients/:id',
    SESSIONS: '/api/clients/:id/sessions'
  },
  TRAINERS: {
    LIST: '/api/trainers',
    DETAIL: '/api/trainers/:id',
    CREATE: '/api/trainers',
    UPDATE: '/api/trainers/:id',
    DELETE: '/api/trainers/:id',
    SESSIONS: '/api/trainers/:id/sessions',
    AVAILABILITY: '/api/trainers/:id/availability'
  },
  SESSIONS: {
    LIST: '/api/sessions',
    DETAIL: '/api/sessions/:id',
    CREATE: '/api/sessions',
    UPDATE: '/api/sessions/:id',
    DELETE: '/api/sessions/:id',
    CALENDAR: '/api/sessions/calendar'
  },
  REPORTS: {
    DASHBOARD: '/api/reports/dashboard',
    TRAINER: '/api/reports/trainer/:id',
    CLIENT: '/api/reports/client/:id',
    GENERAL: '/api/reports/general',
    EXPORT: '/api/reports/export'
  }
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  UNAUTHORIZED: 'Необходима авторизация.',
  FORBIDDEN: 'Недостаточно прав доступа.',
  NOT_FOUND: 'Ресурс не найден.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка.'
} as const;

export const SUCCESS_MESSAGES = {
  CLIENT_CREATED: 'Клиент успешно создан',
  CLIENT_UPDATED: 'Данные клиента обновлены',
  CLIENT_DELETED: 'Клиент удален',
  TRAINER_CREATED: 'Тренер успешно создан',
  TRAINER_UPDATED: 'Данные тренера обновлены',
  TRAINER_DELETED: 'Тренер удален',
  SESSION_CREATED: 'Сессия создана',
  SESSION_UPDATED: 'Сессия обновлена',
  SESSION_DELETED: 'Сессия удалена',
  SESSION_CANCELLED: 'Сессия отменена',
  DATA_EXPORTED: 'Данные экспортированы',
  SETTINGS_SAVED: 'Настройки сохранены'
} as const;
