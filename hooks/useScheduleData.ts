"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Id } from "../convex/_generated/dataModel";
import { ScheduleAPI } from "@/lib/api/schedule";

// ✅ ТИПЫ
export interface CreateEventData {
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName?: string;
  clientId?: string;
  clientName?: string;
  location?: string;
  notes?: string;
  status?: string;
}

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  price?: number;
  createdBy: string;
  _creationTime: number;
}

export interface TrainerSchedule {
  trainerId: string;
  trainerName: string;
  trainerRole: string;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  events: ScheduleEvent[];
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  rating: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'trial' | 'inactive';
  joinDate: string;
  trainerId?: string;
  trainerName?: string;
}

// ✅ ТИПЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
interface ConvexUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  password?: string;
  createdAt?: number;
  lastLogin?: number;
  photoUrl?: string;
  faceDescriptor?: any[];
}

function isScheduleApiAvailable() {
  try {
    return api && api.events && typeof api.events === 'object' &&
      api.users && typeof api.users === 'object' &&
      api.clients && typeof api.clients === 'object';
  } catch (error) {
    return false;
  }
}

export function useTrainers() {
  let result: ConvexUser[] | undefined = undefined;
  
  try {
    if (isScheduleApiAvailable() && api.users?.getActiveTrainers) {
      // Используем специальную функцию для получения активных тренеров
      result = useQuery(api.users.getActiveTrainers, {}) as ConvexUser[] | undefined;
    }
  } catch (error) {
    console.warn('Trainers API недоступен:', error);
    result = undefined;
  }

  const trainers = useMemo(() => {
    console.log("🔍 === useTrainers ДЕТАЛЬНАЯ ОТЛАДКА ===");
    console.log("Raw result:", result);
    console.log("Result type:", typeof result);
    console.log("Is array:", Array.isArray(result));
    
    if (result === undefined) {
      console.log("❌ Результат undefined - запрос еще выполняется");
      return [];
    }
    
    if (result === null) {
      console.log("❌ Результат null");
      return [];
    }
    
    if (!Array.isArray(result)) {
      console.log("❌ Результат не является массивом:", result);
      return [];
    }

    console.log("✅ Всего тренеров найдено:", result.length);
    
    // Детальная проверка каждого тренера
    result.forEach((trainer, index) => {
      console.log(`Тренер ${index + 1}:`, {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        role: trainer.role,
        isActive: trainer.isActive
      });
    });
    
    // Результат уже отфильтрован в Convex функции
    const trainers = result.map((trainer: ConvexUser) => ({
      ...trainer,
      _id: trainer._id.toString(),
    }));
    
    console.log("✅ Финальный результат маппинга:", trainers);
    return trainers;
  }, [result]);

  return trainers;
}

export function useEvents() {
  let result: any[] | undefined = undefined;

  try {
    if (isScheduleApiAvailable() && api.events?.getAll) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.events.getAll, {});
    }
  } catch (error) {
    console.warn('Events API недоступен:', error);
    result = undefined;
  }

  return result ?? [];
}

export function useClients() {
  let result: ConvexUser[] | undefined = undefined;

  try {
    if (isScheduleApiAvailable() && api.users?.getAll) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const allUsers = useQuery(api.users.getAll, {}) as ConvexUser[] | undefined;

      if (allUsers && Array.isArray(allUsers)) {
        result = allUsers.filter((user: ConvexUser) =>
          user.role === 'client' || user.role === 'member'
        );
      }
    }
  } catch (error) {
    console.warn('Clients API недоступен:', error);
    result = undefined;
  }

  return result ?? [];
}

export function useEventMutations() {
  let createEventMutation, updateEventMutation, deleteEventMutation, updateEventStatusMutation;

  try {
    if (isScheduleApiAvailable()) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      createEventMutation = api.events?.create ? useMutation(api.events.create) : null;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      updateEventMutation = api.events?.update ? useMutation(api.events.update) : null;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      deleteEventMutation = api.events?.delete_ ? useMutation(api.events.delete_) : null;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      updateEventStatusMutation = api.events?.updateStatus ? useMutation(api.events.updateStatus) : null;
    }
  } catch (error) {
    console.warn('Event mutations недоступны:', error);
  }

  return {
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    updateEventStatusMutation
  };
}

export function useScheduleDataClean() {
  const [dataSource, setDataSource] = useState<'convex' | 'api' | 'unavailable'>('convex');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);

  // ✅ ПОЛУЧАЕМ ДАННЫЕ ЧЕРЕЗ БЕЗОПАСНЫЕ ХУКИ
  const convexEvents = useEvents();
  const convexTrainers = useTrainers();
  const convexClients = useClients();
  const {
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    updateEventStatusMutation
  } = useEventMutations();

  // ✅ ОБНОВЛЕНИЕ ДАННЫХ API
  const refreshApiData = useCallback(async () => {
    if (dataSource === 'api') {
      try {
        const result = await ScheduleAPI.getScheduleData();
        setApiData(result.data);
      } catch (error: unknown) {
        console.error("❌ Ошибка обновления API данных:", error);
      }
    }
  }, [dataSource]);

  useEffect(() => {
    const checkDataSources = async () => {
      // ✅ ПРОВЕРЯЕМ CONVEX
      try {
        const hasConvexData = isScheduleApiAvailable();

        if (hasConvexData && convexEvents !== undefined && convexTrainers !== undefined) {
          setDataSource('convex');
          setError(null);
          setLoading(false);
          return;
        }

        // Если Convex queries возвращают undefined, ждем еще
        if (convexEvents === undefined || convexTrainers === undefined || convexClients === undefined) {
          return; // Продолжаем ждать
        }
      } catch (convexError) {
        console.warn("⚠️ Convex ошибка:", convexError);
      }

      // ✅ ПРОБУЕМ API
      try {
        const apiResult = await ScheduleAPI.getScheduleData();
        setDataSource('api');
        setApiData(apiResult.data);
        setError(null);
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn("⚠️ API ошибка:", apiError);
      }

      // ✅ НЕТ ДОСТУПНЫХ ИСТОЧНИКОВ
      setDataSource('unavailable');
      setError("Нет доступных источников данных");
      setLoading(false);
    };

    const timer = setTimeout(checkDataSources, 1000);
    return () => clearTimeout(timer);
  }, [convexEvents, convexTrainers, convexClients]);

  // ✅ ФУНКЦИИ ДЛЯ РАБОТЫ С СОБЫТИЯМИ
  const createEvent = useCallback(async (data: CreateEventData): Promise<string> => {
    switch (dataSource) {
      case 'convex':
        try {
          if (!createEventMutation) {
            throw new Error("Convex mutation недоступна");
          }

          const trainer = convexTrainers?.find((t: any) =>
            t._id === data.trainerId || t.email === data.trainerId
          );

          const client = data.clientId && data.clientId !== "no-client"
            ? convexClients?.find((c: any) => c._id === data.clientId || c.id === data.clientId)
            : null;

          const eventId = await createEventMutation({
            title: data.title,
            description: data.description,
            type: data.type,
            startTime: data.startTime,
            endTime: data.endTime,
            trainerId: data.trainerId,
            trainerName: trainer?.name || "Неизвестный тренер",
            clientId: client?._id,
            clientName: client?.name,
            status: data.status || "scheduled",
            location: data.location,
            notes: data.notes,
            createdBy: "admin",
          });

          return eventId;
        } catch (error: unknown) {
          console.error("❌ Ошибка создания в Convex:", error);
          throw error;
        }

      case 'api':
        try {
          const result = await ScheduleAPI.createEvent(data);
          await refreshApiData();
          return result.eventId;
        } catch (error: unknown) {
          console.error("❌ Ошибка создания через API:", error);
          throw error;
        }

      case 'unavailable':
      default:
        throw new Error("Нет доступных источников данных для создания события");
    }
  }, [dataSource, createEventMutation, convexTrainers, convexClients, refreshApiData]);

  const updateEvent = useCallback(async (updates: any): Promise<void> => {
    switch (dataSource) {
      case 'convex':
        try {
          if (!updateEventMutation) {
            throw new Error("Convex update mutation недоступна");
          }

          await updateEventMutation({
            id: updates.id as Id<"events">,
            title: updates.title,
            description: updates.description,
            type: updates.type,
            startTime: updates.startTime,
            endTime: updates.endTime,
            trainerId: updates.trainerId,
            trainerName: updates.trainerName,
            clientId: updates.clientId,
            clientName: updates.clientName,
            status: updates.status,
            location: updates.location,
            notes: updates.notes,
          });
        } catch (error: unknown) {
          console.error("❌ Ошибка обновления в Convex:", error);
          throw error;
        }
        break;

      case 'api':
        try {
          await ScheduleAPI.updateEvent(updates.id, updates);
          await refreshApiData();
        } catch (error: unknown) {
          console.error("❌ Ошибка обновления через API:", error);
          throw error;
        }
        break;

      case 'unavailable':
      default:
        throw new Error("Нет доступных источников данных для обновления события");
    }
  }, [dataSource, updateEventMutation, refreshApiData]);

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    switch (dataSource) {
      case 'convex':
        try {
          if (!deleteEventMutation) {
            throw new Error("Convex delete mutation недоступна");
          }

          await deleteEventMutation({ id: eventId as Id<"events"> });
        } catch (error: unknown) {
          console.error("❌ Ошибка удаления из Convex:", error);
          throw error;
        }
        break;

      case 'api':
        try {
          await ScheduleAPI.deleteEvent(eventId);
          await refreshApiData();
        } catch (error: unknown) {
          console.error("❌ Ошибка удаления через API:", error);
          throw error;
        }
        break;

      case 'unavailable':
      default:
        throw new Error("Нет доступных источников данных для удаления события");
    }
  }, [dataSource, deleteEventMutation, refreshApiData]);

  const updateEventStatus = useCallback(async (eventId: string, status: string): Promise<void> => {
    switch (dataSource) {
      case 'convex':
        try {
          if (!updateEventStatusMutation) {
            throw new Error("Convex status mutation недоступна");
          }

          await updateEventStatusMutation({
            id: eventId as Id<"events">,
            status
          });
        } catch (error: unknown) {
          console.error("❌ Ошибка обновления статуса в Convex:", error);
          throw error;
        }
        break;

      case 'api':
        try {
          await ScheduleAPI.updateEvent(eventId, { status });
          await refreshApiData();
        } catch (error: unknown) {
          console.error("❌ Ошибка обновления статуса через API:", error);
          throw error;
        }
        break;

      case 'unavailable':
      default:
        throw new Error("Нет доступных источников данных для обновления статуса");
    }
  }, [dataSource, updateEventStatusMutation, refreshApiData]);

  const retryConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Пробуем Convex
    try {
      if (isScheduleApiAvailable() && convexEvents !== undefined && convexTrainers !== undefined) {
        setDataSource('convex');
        setLoading(false);
        return;
      }
    } catch (convexError) {
      console.warn("⚠️ Convex недоступен:", convexError);
    }

    // Пробуем API
    try {
      const apiResult = await ScheduleAPI.getScheduleData();
      setDataSource('api');
      setApiData(apiResult.data);
    } catch (error: unknown) {
      setDataSource('unavailable');
      setError("Все источники недоступны");
    }

    setLoading(false);
  }, [convexEvents, convexTrainers]);

  // ✅ ПОДГОТАВЛИВАЕМ ДАННЫЕ
  const events: ScheduleEvent[] = (() => {
    switch (dataSource) {
      case 'convex':
        return convexEvents && Array.isArray(convexEvents) ? convexEvents.map((event: any) => ({
          ...event,
          _id: event._id.toString(),
        })) : [];

      case 'api':
        return apiData?.events || [];

      case 'unavailable':
      default:
        return [];
    }
  })();

const trainers: TrainerSchedule[] = useMemo(() => {
  console.log("🔍 === МАППИНГ ТРЕНЕРОВ ===");
  console.log("dataSource:", dataSource);
  console.log("convexTrainers:", convexTrainers);
  console.log("convexTrainers length:", convexTrainers?.length);
  
  switch (dataSource) {
    case 'convex':
      if (convexTrainers && Array.isArray(convexTrainers)) {
        console.log("✅ Начинаем маппинг тренеров из Convex");
        console.log("Исходные данные для маппинга:", convexTrainers);
        
        const mappedTrainers = convexTrainers.map((trainer: any, index) => {
          console.log(`Маппинг тренера ${index + 1}:`, {
            исходные_данные: trainer,
            _id: trainer._id,
            name: trainer.name,
            role: trainer.role,
            isActive: trainer.isActive
          });

          const mapped = {
            trainerId: trainer._id,
            trainerName: trainer.name,
            trainerRole: "Тренер",
            workingHours: trainer.workingHours || { 
              start: "09:00", 
              end: "18:00", 
              days: [1, 2, 3, 4, 5] 
            },
            events: events.filter((e: ScheduleEvent) => e.trainerId === trainer._id),
            totalEvents: trainer.totalWorkouts || 0,
            completedEvents: trainer.completedWorkouts || 0,
            upcomingEvents: events.filter((e: ScheduleEvent) => 
              e.trainerId === trainer._id && 
              new Date(e.startTime) > new Date()
            ).length,
            rating: trainer.rating || 0,
          };
          
          console.log(`Результат маппинга тренера ${index + 1}:`, mapped);
          return mapped;
        });

        console.log("✅ Финальный результат маппинга:", mappedTrainers);
        return mappedTrainers;
      }

      console.log("❌ convexTrainers пустой или не массив");
      return [];

    case 'api':
      // ... остальной код ...
      return apiData?.trainers?.map((trainer: any) => ({
        trainerId: trainer.trainerId || trainer.email || trainer._id,
        trainerName: trainer.name,
        trainerRole: trainer.role,
        workingHours: trainer.workingHours || { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
        events: events.filter((e: ScheduleEvent) => e.trainerId === (trainer.trainerId || trainer.email || trainer._id)),
        totalEvents: trainer.totalWorkouts || 0,
        completedEvents: trainer.completedWorkouts || 0,
        upcomingEvents: events.filter((e: ScheduleEvent) =>
          e.trainerId === (trainer.trainerId || trainer.email || trainer._id) &&
          new Date(e.startTime) > new Date()
        ).length,
        rating: trainer.rating || 0,
      })) || [];

    case 'unavailable':
    default:
      console.log("❌ Источник данных недоступен");
      return [];
  }
}, [dataSource, convexTrainers, events, apiData]);

  const clients: Client[] = (() => {
    switch (dataSource) {
      case 'convex':
        return convexClients && Array.isArray(convexClients) ? convexClients.map((client: any) => ({
          id: client._id || client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || "",
          status: client.status,
          joinDate: client.joinDate,
          trainerId: client.trainerId,
          trainerName: client.trainerName,
        })) : [];

      case 'api':
        return apiData?.clients || [];

      case 'unavailable':
      default:
        return [];
    }
  })();

  return {
    events,
    trainers,
    clients,
    loading,
    error,
    dataSource,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    refreshApiData,
    retryConnection,
  };
}

export {
  useScheduleDataClean as useScheduleData,
  useEvents as useEventsData,
  useTrainers as useTrainersData,
  useClients as useClientsData
};

