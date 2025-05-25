// contexts/ScheduleContext.tsx (исправленная версия)
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScheduleEvent, TrainerSchedule, CreateEventData } from '@/components/admin/schedule/types';

interface ScheduleContextType {
  // Данные
  events: ScheduleEvent[];
  trainers: TrainerSchedule[];
  loading: boolean;
  error: string | null;
  
  // CRUD операции
  createEvent: (data: CreateEventData) => Promise<void>;
  updateEvent: (eventId: string, data: Partial<ScheduleEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateEventStatus: (eventId: string, status: ScheduleEvent['status']) => Promise<void>;
  
  // Фильтрация и поиск
  getEventsByTrainer: (trainerId: string) => ScheduleEvent[];
  getEventsInDateRange: (start: Date, end: Date) => ScheduleEvent[];
  searchEvents: (query: string) => ScheduleEvent[];
  
  // Обновление данных
  refreshData: () => Promise<void>;
  
  // Подписка на изменения
  subscribeToUpdates: (callback: (events: ScheduleEvent[]) => void) => () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [trainers, setTrainers] = useState<TrainerSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<((events: ScheduleEvent[]) => void)[]>([]);

  // Загрузка данных с улучшенной обработкой ошибок
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Загрузка данных расписания...');
      
      // Сначала пробуем загрузить с API
      const [eventsResponse, trainersResponse] = await Promise.allSettled([
        fetch('/api/schedule/events'),
        fetch('/api/schedule/trainers')
      ]);
      
      let eventsData: ScheduleEvent[] = [];
      let trainersData: TrainerSchedule[] = [];
      
      // Обрабатываем ответ событий
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.ok) {
        eventsData = await eventsResponse.value.json();
        console.log('✅ События загружены с API:', eventsData.length);
      } else {
        console.log('⚠️ API событий недоступен, используем mock данные');
        eventsData = getMockEvents();
      }
      
      // Обрабатываем ответ тренеров
      if (trainersResponse.status === 'fulfilled' && trainersResponse.value.ok) {
        trainersData = await trainersResponse.value.json();
        console.log('✅ Тренеры загружены с API:', trainersData.length);
      } else {
        console.log('⚠️ API тренеров недоступен, используем mock данные');
        trainersData = getMockTrainers();
      }
      
      // Связываем события с тренерами
      const updatedTrainers = trainersData.map(trainer => ({
        ...trainer,
        events: eventsData.filter(event => event.trainerId === trainer.trainerId)
      }));
      
      setEvents(eventsData);
      setTrainers(updatedTrainers);
      
      // Уведомляем подписчиков
      notifySubscribers(eventsData);
      
      console.log('✅ Данные расписания загружены успешно');
      
    } catch (err) {
      console.error('❌ Критическая ошибка загрузки данных:', err);
      setError('Ошибка загрузки данных. Используются локальные данные.');
      
      // Fallback к mock данным
      const mockEvents = getMockEvents();
      const mockTrainers = getMockTrainers();
      
      setEvents(mockEvents);
      setTrainers(mockTrainers);
      notifySubscribers(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  // Mock данные для разработки
  const getMockEvents = (): ScheduleEvent[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        _id: 'event1',
        title: 'Персональная тренировка',
        description: 'Силовая тренировка на верх тела',
        type: 'training',
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer1',
        trainerName: 'Александр Петров',
        clientId: 'client1',
        clientName: 'Анна Смирнова',
        status: 'confirmed',
        location: 'Зал №1',
        createdAt: new Date().toISOString(),
        createdBy: 'trainer1'
      },
      {
        _id: 'event2',
        title: 'Групповая йога',
        description: 'Утренняя практика йоги',
        type: 'training',
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer2',
        trainerName: 'Мария Иванова',
        status: 'scheduled',
        location: 'Йога-студия',
        createdAt: new Date().toISOString(),
        createdBy: 'trainer2'
      },
      {
        _id: 'event3',
        title: 'Функциональная тренировка',
        description: 'Комплексная тренировка с собственным весом',
        type: 'training',
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer1',
        trainerName: 'Александр Петров',
        clientId: 'client3',
        clientName: 'Елена Васильева',
        status: 'confirmed',
        location: 'Зал №2',
        createdAt: new Date().toISOString(),
        createdBy: 'trainer1'
      },
      {
        _id: 'event4',
        title: 'Медитация и растяжка',
        description: 'Расслабляющая практика',
        type: 'training',
        startTime: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer3',
        trainerName: 'Дмитрий Козлов',
        clientId: 'client4',
        clientName: 'Михаил Петров',
        status: 'completed',
        location: 'Йога-студия',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'trainer3'
      },
      {
        _id: 'event5',
        title: 'Кардио тренировка',
        description: 'Интенсивная кардио сессия',
        type: 'training',
        startTime: new Date(today.getTime() + 72 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(today.getTime() + 72 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer2',
        trainerName: 'Мария Иванова',
        clientId: 'client2',
        clientName: 'Дмитрий Козлов',
        status: 'scheduled',
        location: 'Кардио зона',
        createdAt: new Date().toISOString(),
        createdBy: 'trainer2'
      }
    ];
  };

  const getMockTrainers = (): TrainerSchedule[] => {
    return [
      {
        trainerId: 'trainer1',
        trainerName: 'Александр Петров',
        trainerRole: 'Персональный тренер',
        events: [],
        workingHours: {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5]
        }
      },
      {
        trainerId: 'trainer2',
        trainerName: 'Мария Иванова',
        trainerRole: 'Фитнес-инструктор',
        events: [],
        workingHours: {
          start: '08:00',
          end: '17:00',
          days: [1, 2, 3, 4, 5, 6]
        }
      },
      {
        trainerId: 'trainer3',
        trainerName: 'Дмитрий Козлов',
        trainerRole: 'Йога-инструктор',
        events: [],
        workingHours: {
          start: '10:00',
          end: '19:00',
          days: [1, 2, 3, 4, 5, 6, 0]
        }
      }
    ];
  };

  // Mock данные для клиентов (для получения имен)
  const getMockClients = () => {
    return [
      { id: 'client1', name: 'Анна Смирнова' },
      { id: 'client2', name: 'Дмитрий Козлов' },
      { id: 'client3', name: 'Елена Васильева' },
      { id: 'client4', name: 'Михаил Петров' },
      { id: 'client5', name: 'Ольга Петрова' },
      { id: 'client6', name: 'Сергей Иванов' }
    ];
  };

  // Уведомление подписчиков
  const notifySubscribers = (updatedEvents: ScheduleEvent[]) => {
    subscribers.forEach(callback => callback(updatedEvents));
  };

  // Вспомогательные функции для получения имен
  const getTrainerNameById = (trainerId: string): string => {
    const trainer = trainers.find(t => t.trainerId === trainerId);
    return trainer?.trainerName || 'Неизвестный тренер';
  };

  const getClientNameById = (clientId: string): string => {
    // В реальном приложении это должно быть из API клиентов
    const mockClients = getMockClients();
    const client = mockClients.find(c => c.id === clientId);
    return client?.name || 'Неизвестный клиент';
  };

  // CRUD операции с улучшенной обработкой ошибок
  const createEvent = async (data: CreateEventData): Promise<void> => {
    try {
      console.log('🔄 Создание события:', data.title);
      
      // Подготавливаем данные для API с именами
      const eventDataWithNames = {
        ...data,
        trainerName: getTrainerNameById(data.trainerId),
        clientName: data.clientId ? getClientNameById(data.clientId) : undefined
      };
      
      const response = await fetch('/api/schedule/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventDataWithNames)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newEvent = await response.json();
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
      
      console.log('✅ Событие создано:', newEvent._id);
      
    } catch (err) {
      console.log('⚠️ API недоступен, создаем событие локально');
      
      // Mock создание для разработки
      const newEvent: ScheduleEvent = {
        _id: `event_${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        trainerId: data.trainerId,
        trainerName: getTrainerNameById(data.trainerId),
        clientId: data.clientId,
        clientName: data.clientId ? getClientNameById(data.clientId) : undefined,
        status: 'scheduled',
        location: data.location,
        notes: data.notes,
        recurring: data.recurring,
        createdAt: new Date().toISOString(),
        createdBy: 'current_user'
      };
      
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
      
      console.log('✅ Событие создано локально:', newEvent._id);
    }
  };

  const updateEvent = async (eventId: string, data: Partial<ScheduleEvent>): Promise<void> => {
    try {
      console.log('🔄 Обновление события:', eventId);
      
      // Подготавливаем данные для обновления
      const updateData = { ...data };
      
            // Если обновляется trainerId, добавляем trainerName
      if (data.trainerId && !data.trainerName) {
        updateData.trainerName = getTrainerNameById(data.trainerId);
      }
      
      // Если обновляется clientId, добавляем clientName
      if (data.clientId && !data.clientName) {
        updateData.clientName = getClientNameById(data.clientId);
      }
      
      const response = await fetch(`/api/schedule/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedEvent = await response.json();
      const updatedEvents = events.map(event => 
        event._id === eventId ? { ...event, ...updatedEvent } : event
      );
      
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
      
      console.log('✅ Событие обновлено:', eventId);
      
    } catch (err) {
      console.log('⚠️ API недоступен, обновляем событие локально');
      
      // Подготавливаем данные для локального обновления
      const updateData = { ...data };
      
      // Если обновляется trainerId, добавляем trainerName
      if (data.trainerId && !data.trainerName) {
        updateData.trainerName = getTrainerNameById(data.trainerId);
      }
      
      // Если обновляется clientId, добавляем clientName
      if (data.clientId && !data.clientName) {
        updateData.clientName = getClientNameById(data.clientId);
      }
      
      // Mock обновление
      const updatedEvents = events.map(event => 
        event._id === eventId ? { 
          ...event, 
          ...updateData, 
          updatedAt: new Date().toISOString() 
        } : event
      );
      
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
      
      console.log('✅ Событие обновлено локально:', eventId);
    }
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    try {
      console.log('🔄 Удаление события:', eventId);
      
      const response = await fetch(`/api/schedule/events/${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedEvents = events.filter(event => event._id !== eventId);
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
      
      console.log('✅ Событие удалено:', eventId);
      
    } catch (err) {
      console.log('⚠️ API недоступен, удаляем событие локально');
      
      // Mock удаление
      const updatedEvents = events.filter(event => event._id !== eventId);
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
      
      console.log('✅ Событие удалено локально:', eventId);
    }
  };

  const updateEventStatus = async (eventId: string, status: ScheduleEvent['status']): Promise<void> => {
    await updateEvent(eventId, { status });
  };

  // Обновление событий в данных тренеров
  const updateTrainerEvents = (updatedEvents: ScheduleEvent[]) => {
    const updatedTrainers = trainers.map(trainer => ({
      ...trainer,
      events: updatedEvents.filter(event => event.trainerId === trainer.trainerId)
    }));
    setTrainers(updatedTrainers);
  };

  // Утилиты для фильтрации
  const getEventsByTrainer = (trainerId: string): ScheduleEvent[] => {
    return events.filter(event => event.trainerId === trainerId);
  };

  const getEventsInDateRange = (start: Date, end: Date): ScheduleEvent[] => {
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= start && eventStart <= end;
    });
  };

  const searchEvents = (query: string): ScheduleEvent[] => {
    const lowercaseQuery = query.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.trainerName.toLowerCase().includes(lowercaseQuery) ||
      (event.clientName && event.clientName.toLowerCase().includes(lowercaseQuery)) ||
      (event.description && event.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  const refreshData = async (): Promise<void> => {
    console.log('🔄 Принудительное обновление данных...');
    await loadData();
  };

  // Подписка на обновления
  const subscribeToUpdates = (callback: (events: ScheduleEvent[]) => void): (() => void) => {
    setSubscribers(prev => [...prev, callback]);
    
    // Возвращаем функцию отписки
    return () => {
      setSubscribers(prev => prev.filter(sub => sub !== callback));
    };
  };

  // Дополнительные утилиты для работы с событиями
  const getUpcomingEvents = (limit?: number): ScheduleEvent[] => {
    const now = new Date();
    const upcoming = events
      .filter(event => new Date(event.startTime) > now && event.status !== 'cancelled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  };

  const getTodayEvents = (): ScheduleEvent[] => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return getEventsInDateRange(startOfDay, endOfDay);
  };

  const getEventsByStatus = (status: ScheduleEvent['status']): ScheduleEvent[] => {
    return events.filter(event => event.status === status);
  };

  const getConflictingEvents = (newEvent: {
    trainerId: string;
    startTime: string;
    endTime: string;
    excludeEventId?: string;
  }): ScheduleEvent[] => {
    const newStart = new Date(newEvent.startTime);
    const newEnd = new Date(newEvent.endTime);
    
    return events.filter(event => {
      if (newEvent.excludeEventId && event._id === newEvent.excludeEventId) {
        return false;
      }
      
      if (event.trainerId !== newEvent.trainerId) {
        return false;
      }
      
      if (event.status === 'cancelled') {
        return false;
      }
      
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      // Проверяем пересечение времени
      return (newStart < eventEnd && newEnd > eventStart);
    });
  };

  const isTrainerAvailable = (trainerId: string, startTime: string, endTime: string, excludeEventId?: string): boolean => {
    const conflicts = getConflictingEvents({ trainerId, startTime, endTime, excludeEventId });
    return conflicts.length === 0;
  };

  // Статистика событий
  const getEventStats = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      total: events.length,
      today: getTodayEvents().length,
      thisWeek: events.filter(e => new Date(e.startTime) >= startOfWeek).length,
      thisMonth: events.filter(e => new Date(e.startTime) >= startOfMonth).length,
      upcoming: getUpcomingEvents().length,
      completed: getEventsByStatus('completed').length,
      cancelled: getEventsByStatus('cancelled').length,
      confirmed: getEventsByStatus('confirmed').length,
      scheduled: getEventsByStatus('scheduled').length
    };
  };

  // Получение доступных тренеров для определенного времени
  const getAvailableTrainers = (startTime: string, endTime: string, excludeEventId?: string): TrainerSchedule[] => {
    return trainers.filter(trainer => {
      return isTrainerAvailable(trainer.trainerId, startTime, endTime, excludeEventId);
    });
  };

  // Получение следующего доступного слота для тренера
  const getNextAvailableSlot = (trainerId: string, duration: number = 60): { startTime: string; endTime: string } | null => {
    const now = new Date();
    const trainer = trainers.find(t => t.trainerId === trainerId);
    
    if (!trainer) return null;
    
    // Начинаем поиск с текущего времени, округленного до следующего часа
    const searchStart = new Date(now);
    searchStart.setMinutes(0, 0, 0);
    searchStart.setHours(searchStart.getHours() + 1);
    
    // Ищем в течение следующих 7 дней
    for (let day = 0; day < 7; day++) {
      const currentDay = new Date(searchStart);
      currentDay.setDate(searchStart.getDate() + day);
      
      // Проверяем рабочие часы тренера
      const dayOfWeek = currentDay.getDay();
      if (!trainer.workingHours.days.includes(dayOfWeek)) {
        continue;
      }
      
      // Устанавливаем начало рабочего дня
      const [startHour, startMinute] = trainer.workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = trainer.workingHours.end.split(':').map(Number);
      
      const workStart = new Date(currentDay);
      workStart.setHours(startHour, startMinute, 0, 0);
      
      const workEnd = new Date(currentDay);
      workEnd.setHours(endHour, endMinute, 0, 0);
      
      // Ищем свободные слоты по часам
      for (let hour = workStart.getHours(); hour < workEnd.getHours(); hour++) {
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);
        
        if (slotEnd > workEnd) break;
        
        if (isTrainerAvailable(trainerId, slotStart.toISOString(), slotEnd.toISOString())) {
          return {
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString()
          };
        }
      }
    }
    
    return null;
  };

  // Загружаем данные при инициализации
  useEffect(() => {
    loadData();
  }, []);

  const value: ScheduleContextType = {
    events,
    trainers,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEventsByTrainer,
    getEventsInDateRange,
    searchEvents,
    refreshData,
    subscribeToUpdates
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

// Дополнительные хуки для удобства
export function useScheduleStats() {
  const { events } = useSchedule();
  
  return React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate >= startOfToday && eventDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    });
    
    return {
      total: events.length,
      today: todayEvents.length,
      thisWeek: events.filter(e => new Date(e.startTime) >= startOfWeek).length,
      thisMonth: events.filter(e => new Date(e.startTime) >= startOfMonth).length,
      upcoming: events.filter(e => new Date(e.startTime) > now && e.status !== 'cancelled').length,
      completed: events.filter(e => e.status === 'completed').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
      confirmed: events.filter(e => e.status === 'confirmed').length,
      scheduled: events.filter(e => e.status === 'scheduled').length
    };
  }, [events]);
}

export function useTrainerSchedule(trainerId: string) {
  const { events, trainers, getEventsByTrainer } = useSchedule();
  
  const trainer = trainers.find(t => t.trainerId === trainerId);
  const trainerEvents = getEventsByTrainer(trainerId);
  
  const upcomingEvents = trainerEvents
    .filter(event => new Date(event.startTime) > new Date() && event.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const todayEvents = trainerEvents.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });
  
  return {
    trainer,
    events: trainerEvents,
    upcomingEvents,
    todayEvents,
    isLoading: !trainer
  };
}

export function useEventConflicts() {
  const { events } = useSchedule();
  
  const checkConflicts = React.useCallback((newEvent: {
    trainerId: string;
    startTime: string;
    endTime: string;
    excludeEventId?: string;
  }) => {
    const newStart = new Date(newEvent.startTime);
    const newEnd = new Date(newEvent.endTime);
    
        return events.filter(event => {
      if (newEvent.excludeEventId && event._id === newEvent.excludeEventId) {
        return false;
      }
      
      if (event.trainerId !== newEvent.trainerId) {
        return false;
      }
      
      if (event.status === 'cancelled') {
        return false;
      }
      
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return (newStart < eventEnd && newEnd > eventStart);
    });
  }, [events]);
  
  const isAvailable = React.useCallback((trainerId: string, startTime: string, endTime: string, excludeEventId?: string) => {
    const conflicts = checkConflicts({ trainerId, startTime, endTime, excludeEventId });
    return conflicts.length === 0;
  }, [checkConflicts]);
  
  return {
    checkConflicts,
    isAvailable
  };
}

// Хук для работы с доступностью тренеров
export function useTrainerAvailability() {
  const { trainers, events } = useSchedule();
  
  const getAvailableTrainers = React.useCallback((startTime: string, endTime: string, excludeEventId?: string) => {
    return trainers.filter(trainer => {
      const conflicts = events.filter(event => {
        if (excludeEventId && event._id === excludeEventId) {
          return false;
        }
        
        if (event.trainerId !== trainer.trainerId) {
          return false;
        }
        
        if (event.status === 'cancelled') {
          return false;
        }
        
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);
        
        return (newStart < eventEnd && newEnd > eventStart);
      });
      
      return conflicts.length === 0;
    });
  }, [trainers, events]);
  
  const getNextAvailableSlot = React.useCallback((trainerId: string, duration: number = 60) => {
    const trainer = trainers.find(t => t.trainerId === trainerId);
    if (!trainer) return null;
    
    const now = new Date();
    const searchStart = new Date(now);
    searchStart.setMinutes(0, 0, 0);
    searchStart.setHours(searchStart.getHours() + 1);
    
    // Ищем в течение следующих 7 дней
    for (let day = 0; day < 7; day++) {
      const currentDay = new Date(searchStart);
      currentDay.setDate(searchStart.getDate() + day);
      
      const dayOfWeek = currentDay.getDay();
      if (!trainer.workingHours.days.includes(dayOfWeek)) {
        continue;
      }
      
      const [startHour, startMinute] = trainer.workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = trainer.workingHours.end.split(':').map(Number);
      
      const workStart = new Date(currentDay);
      workStart.setHours(startHour, startMinute, 0, 0);
      
      const workEnd = new Date(currentDay);
      workEnd.setHours(endHour, endMinute, 0, 0);
      
      for (let hour = workStart.getHours(); hour < workEnd.getHours(); hour++) {
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);
        
        if (slotEnd > workEnd) break;
        
        const conflicts = events.filter(event => {
          if (event.trainerId !== trainerId || event.status === 'cancelled') {
            return false;
          }
          
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          
          return (slotStart < eventEnd && slotEnd > eventStart);
        });
        
        if (conflicts.length === 0) {
          return {
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString()
          };
        }
      }
    }
    
    return null;
  }, [trainers, events]);
  
  return {
    getAvailableTrainers,
    getNextAvailableSlot
  };
}

// Хук для аналитики расписания
export function useScheduleAnalytics() {
  const { events, trainers } = useSchedule();
  
  return React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Статистика по тренерам
    const trainerStats = trainers.map(trainer => {
      const trainerEvents = events.filter(e => e.trainerId === trainer.trainerId);
      const thisWeekEvents = trainerEvents.filter(e => new Date(e.startTime) >= startOfWeek);
      const thisMonthEvents = trainerEvents.filter(e => new Date(e.startTime) >= startOfMonth);
      const completedEvents = trainerEvents.filter(e => e.status === 'completed');
      const cancelledEvents = trainerEvents.filter(e => e.status === 'cancelled');
      
      return {
        trainerId: trainer.trainerId,
        trainerName: trainer.trainerName,
        totalEvents: trainerEvents.length,
        thisWeekEvents: thisWeekEvents.length,
        thisMonthEvents: thisMonthEvents.length,
        completedEvents: completedEvents.length,
        cancelledEvents: cancelledEvents.length,
        cancellationRate: trainerEvents.length > 0 ? (cancelledEvents.length / trainerEvents.length) * 100 : 0,
        utilizationRate: thisWeekEvents.length / 40 * 100 // Предполагаем 40 часов в неделю
      };
    });
    
    // Статистика по времени
    const timeStats = {
      busyHours: {} as Record<number, number>,
      busyDays: {} as Record<number, number>
    };
    
    events.forEach(event => {
      if (event.status !== 'cancelled') {
        const eventDate = new Date(event.startTime);
        const hour = eventDate.getHours();
        const day = eventDate.getDay();
        
        timeStats.busyHours[hour] = (timeStats.busyHours[hour] || 0) + 1;
        timeStats.busyDays[day] = (timeStats.busyDays[day] || 0) + 1;
      }
    });
    
    // Общая статистика
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status !== 'cancelled').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const upcomingEvents = events.filter(e => new Date(e.startTime) > now && e.status !== 'cancelled').length;
    
    return {
      trainerStats,
      timeStats,
      overview: {
        totalEvents,
        activeEvents,
        completedEvents,
        upcomingEvents,
        completionRate: totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0,
        utilizationRate: trainers.length > 0 ? (activeEvents / (trainers.length * 40)) * 100 : 0
      }
    };
  }, [events, trainers]);
}

// Хук для работы с уведомлениями о событиях
export function useEventNotifications() {
  const { events, subscribeToUpdates } = useSchedule();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'upcoming' | 'conflict' | 'cancellation';
    message: string;
    eventId: string;
    timestamp: Date;
  }>>([]);
  
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((updatedEvents) => {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Проверяем предстоящие события
      const upcomingEvents = updatedEvents.filter(event => {
        const eventTime = new Date(event.startTime);
        return eventTime <= oneHourFromNow && eventTime > now && event.status === 'confirmed';
      });
      
      const newNotifications = upcomingEvents.map(event => ({
        id: `upcoming_${event._id}`,
        type: 'upcoming' as const,
        message: `Тренировка "${event.title}" начнется через ${Math.round((new Date(event.startTime).getTime() - now.getTime()) / (1000 * 60))} минут`,
        eventId: event._id,
        timestamp: now
      }));
      
      setNotifications(prev => {
        // Удаляем старые уведомления и добавляем новые
        const filtered = prev.filter(n => n.type !== 'upcoming');
        return [...filtered, ...newNotifications];
      });
    });
    
    return unsubscribe;
  }, [subscribeToUpdates]);
  
  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  return {
    notifications,
    dismissNotification,
    clearAllNotifications
  };
}


