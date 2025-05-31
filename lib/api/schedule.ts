// lib/api/schedule.ts

// ✅ УБИРАЕМ ДУБЛИРОВАНИЕ - импортируем из хука
import { CreateEventData } from '@/hooks/useScheduleData';

export class ScheduleAPI {
  private static baseUrl = '/api/admin/schedule';

  // ✅ ПОЛУЧЕНИЕ ВСЕХ ДАННЫХ РАСПИСАНИЯ
  static async getScheduleData() {
    try {
      console.log("📡 ScheduleAPI: Запрос данных расписания");
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: Данные получены", data);
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка получения данных:", error);
      throw new Error(`Ошибка получения данных: ${errorMessage}`);
    }
  }

  // ✅ СОЗДАНИЕ СОБЫТИЯ
  static async createEvent(eventData: CreateEventData) {
    try {
      console.log("📡 ScheduleAPI: Создание события", eventData);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: Событие создано", data);
      
      return {
        success: true,
        eventId: data.eventId || data.event?._id,
        event: data.event,
        source: data.source
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка создания события:", error);
      throw new Error(`Ошибка создания события: ${errorMessage}`);
    }
  }

  // ✅ ОБНОВЛЕНИЕ СОБЫТИЯ
  static async updateEvent(eventId: string, updateData: Partial<CreateEventData>) {
    try {
      console.log("📡 ScheduleAPI: Обновление события", eventId, updateData);
      
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, ...updateData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: Событие обновлено", data);
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка обновления события:", error);
      throw new Error(`Ошибка обновления события: ${errorMessage}`);
    }
  }

  // ✅ УДАЛЕНИЕ СОБЫТИЯ
  static async deleteEvent(eventId: string) {
    try {
      console.log("📡 ScheduleAPI: Удаление события", eventId);
      
      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: Событие удалено", data);
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка удаления события:", error);
      throw new Error(`Ошибка удаления события: ${errorMessage}`);
    }
  }

  // ✅ ПОЛУЧЕНИЕ СОБЫТИЯ ПО ID
  static async getEventById(eventId: string) {
    try {
      console.log("📡 ScheduleAPI: Получение события по ID", eventId);
      
      const response = await fetch(`${this.baseUrl}/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: Событие получено", data);
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка получения события:", error);
      throw new Error(`Ошибка получения события: ${errorMessage}`);
    }
  }

  // ✅ ПОЛУЧЕНИЕ СОБЫТИЙ ПО ДАТЕ
  static async getEventsByDate(date: string) {
    try {
      console.log("📡 ScheduleAPI: Получение событий по дате", date);
      
      const response = await fetch(`${this.baseUrl}?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: События по дате получены", data);
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка получения событий по дате:", error);
      throw new Error(`Ошибка получения событий: ${errorMessage}`);
    }
  }

  // ✅ ПОЛУЧЕНИЕ СТАТИСТИКИ
  static async getStats() {
    try {
      console.log("📡 ScheduleAPI: Получение статистики");
      
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ ScheduleAPI: Статистика получена", data);
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error("❌ ScheduleAPI: Ошибка получения статистики:", error);
      throw new Error(`Ошибка получения статистики: ${errorMessage}`);
    }
  }
}
