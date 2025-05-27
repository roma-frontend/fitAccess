// contexts/UnifiedDataContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Типы данных
export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  specializations: string[];
  experience?: number;
  rating: number;
  totalClients: number;
  activeClients: number;
  totalWorkouts: number;
  totalSessions?: number;
  monthlyRevenue: number;
  hourlyRate?: number;
  certifications?: string[];
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  lastActivity: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  joinDate: string;
  trainerId?: string;
  trainerName?: string;
  membershipType: string;
  membershipExpiry: string;
  totalSessions: number;
  lastVisit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleEvent {
  id?: string;
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'meeting' | 'break' | 'other';
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  inStock: number;
  minStock: number;
  isPopular: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Analytics {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    byRole: Record<string, number>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
  revenue: {
    total: number;
    monthly: number;
    thisMonth?: number; // Добавляем это поле
    growth: number;
    byProduct: Array<{ name: string; revenue: number }>;
    trend: Array<{ date: string; amount: number }>;
  };
  activity: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    byCategory: Record<string, number>;
    salesTrend: Array<{ date: string; sales: number; revenue: number }>;
  };
}

export interface UnifiedData {
  trainers: Trainer[];
  clients: Client[];
  events: ScheduleEvent[];
  products: Product[];
  analytics: Analytics | null;
  lastSync: Date | null;
  loading: boolean;
  error: string | null;
}

interface UnifiedDataContextType extends UnifiedData {
  syncAllData: () => Promise<void>;
  syncTrainers: () => Promise<void>;
  syncClients: () => Promise<void>;
  syncEvents: () => Promise<void>;
  syncProducts: () => Promise<void>;
  syncAnalytics: () => Promise<void>;
  addEvent: (event: ScheduleEvent) => void;
  updateEvent: (eventId: string, updates: Partial<ScheduleEvent>) => void;
  removeEvent: (eventId: string) => void;
  addTrainer: (trainer: Trainer) => void;
  updateTrainer: (trainerId: string, updates: Partial<Trainer>) => void;
  removeTrainer: (trainerId: string) => void;
  isOnline: boolean;
  retryCount: number;
}

const UnifiedDataContext = createContext<UnifiedDataContextType | undefined>(undefined);

// Провайдер контекста
export const UnifiedDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<UnifiedData>({
    trainers: [],
    clients: [],
    events: [],
    products: [],
    analytics: null,
    lastSync: null,
    loading: true,
    error: null
  });

  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Проверка сетевого соединения
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
      console.log('🌐 Соединение восстановлено, синхронизируем данные...');
      syncAllData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Соединение потеряно, переходим в оффлайн режим');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Универсальная функция для API запросов с retry логикой
  const fetchWithRetry = async (url: string, options: RequestInit = {}, maxRetries = 3): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Попытка $${attempt}/$${maxRetries} для ${url}`);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Успешно загружено из ${url}`);
        return data;

      } catch (error) {
        console.error(`❌ Ошибка при загрузке ${url} (попытка ${attempt}):`, error);
        
        if (attempt === maxRetries) {
          setRetryCount(prev => prev + 1);
          throw error;
        }
        
        // Экспоненциальная задержка между попытками
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  // Синхронизация тренеров
  const syncTrainers = useCallback(async () => {
    try {
      const trainersData = await fetchWithRetry('/api/admin/trainers');
      
      setData(prev => ({
        ...prev,
        trainers: Array.isArray(trainersData) ? trainersData : [],
        error: null
      }));

      console.log('👥 Тренеры синхронизированы:', trainersData?.length || 0);
    } catch (error) {
      console.error('❌ Ошибка синхронизации тренеров:', error);
      setData(prev => ({
        ...prev,
        error: `Ошибка загрузки тренеров: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }));
    }
  }, []);

  // Синхронизация клиентов
  const syncClients = useCallback(async () => {
    try {
      const clientsData = await fetchWithRetry('/api/admin/clients');
      
      setData(prev => ({
        ...prev,
        clients: Array.isArray(clientsData) ? clientsData : [],
        error: null
      }));

      console.log('👤 Клиенты синхронизированы:', clientsData?.length || 0);
    } catch (error) {
      console.error('❌ Ошибка синхронизации клиентов:', error);
      setData(prev => ({
        ...prev,
        error: `Ошибка загрузки клиентов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }));
    }
  }, []);

  // Синхронизация событий
  const syncEvents = useCallback(async () => {
    try {
      const eventsResponse = await fetchWithRetry('/api/admin/schedule');
      const eventsData = eventsResponse?.data?.events || eventsResponse?.events || [];
      
      setData(prev => ({
        ...prev,
        events: Array.isArray(eventsData) ? eventsData : [],
        error: null
      }));

      console.log('📅 События синхронизированы:', eventsData?.length || 0);
    } catch (error) {
      console.error('❌ Ошибка синхронизации событий:', error);
      setData(prev => ({
        ...prev,
        error: `Ошибка загрузки событий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }));
    }
  }, []);

  // Синхронизация продуктов
  const syncProducts = useCallback(async () => {
    try {
      const productsResponse = await fetchWithRetry('/api/products');
      const productsData = productsResponse?.products || productsResponse?.data || [];
      
      setData(prev => ({
        ...prev,
        products: Array.isArray(productsData) ? productsData : [],
        error: null
      }));

      console.log('📦 Продукты синхронизированы:', productsData?.length || 0);
    } catch (error) {
      console.error('❌ Ошибка синхронизации продуктов:', error);
      setData(prev => ({
        ...prev,
        error: `Ошибка загрузки продуктов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }));
    }
  }, []);

  // Синхронизация аналитики
  const syncAnalytics = useCallback(async () => {
    try {
      const analyticsResponse = await fetchWithRetry('/api/admin/analytics');
      const analyticsData = analyticsResponse?.data || analyticsResponse;
      
      setData(prev => ({
        ...prev,
        analytics: analyticsData || null,
        error: null
      }));

      console.log('📊 Аналитика синхронизирована');
    } catch (error) {
      console.error('❌ Ошибка синхронизации аналитики:', error);
      setData(prev => ({
        ...prev,
        error: `Ошибка загрузки аналитики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }));
    }
  }, []);

  // Полная синхронизация всех данных
  const syncAllData = useCallback(async () => {
    console.log('🔄 Начинаем полную синхронизацию данных...');
    
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Параллельная загрузка всех данных
      await Promise.allSettled([
        syncTrainers(),
        syncClients(),
        syncEvents(),
        syncProducts(),
        syncAnalytics()
      ]);

      setData(prev => ({
        ...prev,
        lastSync: new Date(),
        loading: false
      }));

      console.log('✅ Полная синхронизация завершена успешно');
      setRetryCount(0);

    } catch (error) {
      console.error('❌ Ошибка полной синхронизации:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: `Ошибка синхронизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }));
    }
  }, [syncTrainers, syncClients, syncEvents, syncProducts, syncAnalytics]);

  // Локальные операции с событиями (для мгновенного обновления UI)
  const addEvent = useCallback((event: ScheduleEvent) => {
    setData(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));
    console.log('➕ Событие добавлено локально:', event.title);
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<ScheduleEvent>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event._id === eventId 
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    }));
    console.log('✏️ Событие обновлено локально:', eventId);
  }, []);

  const removeEvent = useCallback((eventId: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(event => event._id !== eventId)
    }));
    console.log('🗑️ Событие удалено локально:', eventId);
  }, []);

  // Локальные операции с тренерами
  const addTrainer = useCallback((trainer: Trainer) => {
    setData(prev => ({
      ...prev,
      trainers: [...prev.trainers, trainer]
    }));
    console.log('➕ Тренер добавлен локально:', trainer.name);
  }, []);

  const updateTrainer = useCallback((trainerId: string, updates: Partial<Trainer>) => {
    setData(prev => ({
      ...prev,
      trainers: prev.trainers.map(trainer => 
        trainer.id === trainerId 
          ? { ...trainer, ...updates }
          : trainer
      )
    }));
    console.log('✏️ Тренер обновлен локально:', trainerId);
  }, []);

  const removeTrainer = useCallback((trainerId: string) => {
    setData(prev => ({
      ...prev,
      trainers: prev.trainers.filter(trainer => trainer.id !== trainerId)
    }));
    console.log('🗑️ Тренер удален локально:', trainerId);
  }, []);

  // Автоматическая синхронизация при монтировании
  useEffect(() => {
    syncAllData();
  }, [syncAllData]);

  // Периодическая синхронизация каждые 5 минут
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      console.log('⏰ Периодическая синхронизация данных...');
      syncAllData();
    }, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(interval);
  }, [syncAllData, isOnline]);

  // Автоматический retry при ошибках
  useEffect(() => {
    if (retryCount > 0 && retryCount < 5 && isOnline) {
      const timeout = setTimeout(() => {
        console.log(`🔄 Автоматический retry ${retryCount}/5...`);
        syncAllData();
      }, Math.pow(2, retryCount) * 5000); // Экспоненциальная задержка

      return () => clearTimeout(timeout);
    }
  }, [retryCount, isOnline, syncAllData]);

  const contextValue: UnifiedDataContextType = {
    ...data,
    syncAllData,
    syncTrainers,
    syncClients,
    syncEvents,
    syncProducts,
    syncAnalytics,
    addEvent,
    updateEvent,
    removeEvent,
    addTrainer,
    updateTrainer,
    removeTrainer,
    isOnline,
    retryCount
  };

  return (
    <UnifiedDataContext.Provider value={contextValue}>
      {children}
    </UnifiedDataContext.Provider>
  );
};

// Хук для использования контекста
export const useUnifiedData = () => {
  const context = useContext(UnifiedDataContext);
  if (context === undefined) {
    throw new Error('useUnifiedData must be used within a UnifiedDataProvider');
  }
  return context;
};

// Специализированные хуки для отдельных типов данных
export const useTrainers = () => {
  const { trainers, syncTrainers, addTrainer, updateTrainer, removeTrainer, loading, error } = useUnifiedData();
  return { trainers, syncTrainers, addTrainer, updateTrainer, removeTrainer, loading, error };
};

export const useClients = () => {
  const { clients, syncClients, loading, error } = useUnifiedData();
  return { clients, syncClients, loading, error };
};

export const useSchedule = () => {
  const { events, syncEvents, addEvent, updateEvent, removeEvent, loading, error } = useUnifiedData();
  return { events, syncEvents, addEvent, updateEvent, removeEvent, loading, error };
};

export const useProducts = () => {
  const { products, syncProducts, loading, error } = useUnifiedData();
  return { products, syncProducts, loading, error };
};

export const useAnalytics = () => {
  const { analytics, syncAnalytics, loading, error } = useUnifiedData();
  return { analytics, syncAnalytics, loading, error };
};

