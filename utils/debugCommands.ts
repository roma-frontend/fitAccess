// utils/debugCommands.ts (исправленная версия)

import { toast } from "@/hooks/use-toast";

interface DebugCommands {
  addEvents: (count?: number) => Promise<void>;
  updateLastEvent: () => Promise<void>;
  deleteLastEvent: () => Promise<void>;
  clearEvents: () => Promise<void>;
  checkSync: () => void;
  refreshAll: () => Promise<void>;
  stressTest: (count?: number) => Promise<void>;
  simulateDesync: () => void;
  getStats: () => object;
}

export const initDebugCommands = (contexts: {
  dashboard?: any;
  schedule?: any;
  superAdmin?: any;
  admin?: any;
  manager?: any;
  trainer?: any;
}): DebugCommands => {
  const { dashboard, schedule, superAdmin, admin, manager, trainer } = contexts;

  const addEvents = async (count = 1) => {
    if (!schedule) {
      console.error('❌ Schedule context не доступен');
      return;
    }
  
    try {
      console.log(`🔄 Добавляем ${count} событий...`);
      
      // 🔍 Посмотрим на существующее событие для понимания формата
      if (schedule.events && schedule.events.length > 0) {
        console.log('📋 Пример существующего события:', schedule.events[0]);
      }
      
      const promises = [];
      
      for (let i = 0; i < count; i++) {
        const now = new Date();
        const startTime = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  
        // ✅ ИСПОЛЬЗУЕМ ТОЧНО ТАКОЙ ЖЕ ФОРМАТ КАК СУЩЕСТВУЮЩИЕ СОБЫТИЯ
        const eventData = {
          title: `Debug событие ${i + 1} ${now.toLocaleTimeString()}`,
          description: `Автоматически созданное тестовое событие #${i + 1}`,
          type: 'training',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          trainerId: 'trainer1',
          trainerName: 'Debug Тренер', // ✅ Добавляем trainerName
          clientId: 'client1',
          clientName: 'Debug Клиент', // ✅ Добавляем clientName
          location: 'Тестовый зал',
          status: 'scheduled', // ✅ Добавляем status
          createdBy: 'trainer1' // ✅ Добавляем createdBy
        };
  
        console.log(`📤 Отправляем событие ${i + 1}:`, eventData);
        promises.push(schedule.createEvent(eventData));
      }
  
      await Promise.all(promises);
      console.log(`✅ ${count} событий добавлено`);
      
      toast({
        title: "События добавлены",
        description: `Успешно добавлено ${count} тестовых событий`,
      });
    } catch (error) {
      console.error('❌ Ошибка добавления событий:', error);
      
      // 🔍 ПОДРОБНОЕ ЛОГИРОВАНИЕ ОШИБКИ
      if (error instanceof Response) {
        console.error('📋 HTTP статус:', error.status);
        console.error('📋 HTTP статус текст:', error.statusText);
        
        // Попробуем получить тело ответа
        error.text().then(text => {
          console.error('📋 Тело ответа:', text);
        }).catch(() => {
          console.error('📋 Не удалось получить тело ответа');
        });
      }
      
      toast({
        title: "Ошибка",
        description: "Не удалось добавить события. Проверьте консоль для деталей.",
        variant: "destructive",
      });
    }
  };

  const updateLastEvent = async () => {
    if (!schedule?.events?.length) {
      console.warn('⚠️ Нет событий для обновления');
      return;
    }

    try {
      const lastEvent = schedule.events[schedule.events.length - 1];
      const updatedData = {
        ...lastEvent,
        title: `${lastEvent.title} (обновлено)`,
        description: `${lastEvent.description} - Обновлено в ${new Date().toLocaleTimeString()}`,
      };

      // Пробуем разные методы обновления
      if (schedule.updateEvent) {
        await schedule.updateEvent(lastEvent._id, updatedData);
      } else if (schedule.update) {
        await schedule.update(lastEvent._id, updatedData);
      } else {
        console.error('❌ Метод обновления события не найден');
        return;
      }

      console.log('✅ Последнее событие обновлено');
      toast({
        title: "Событие обновлено",
        description: "Последнее событие успешно обновлено",
      });
    } catch (error) {
      console.error('❌ Ошибка обновления события:', error);
    }
  };

  const deleteLastEvent = async () => {
    if (!schedule?.events?.length) {
      console.warn('⚠️ Нет событий для удаления');
      return;
    }

    try {
      const lastEvent = schedule.events[schedule.events.length - 1];
      
      // Пробуем разные методы удаления
      if (schedule.deleteEvent) {
        await schedule.deleteEvent(lastEvent._id);
      } else if (schedule.remove) {
        await schedule.remove(lastEvent._id);
      } else if (schedule.delete) {
        await schedule.delete(lastEvent._id);
      } else {
        console.error('❌ Метод удаления события не найден');
        return;
      }

      console.log('✅ Последнее событие удалено');
      toast({
        title: "Событие удалено",
        description: "Последнее событие успешно удалено",
      });
    } catch (error) {
      console.error('❌ Ошибка удаления события:', error);
    }
  };

  const clearEvents = async () => {
    if (!schedule?.events?.length) {
      console.warn('⚠️ Нет событий для очистки');
      return;
    }

    try {
      console.log('🔄 Очищаем все события...');
      
      // Удаляем все события по одному
      const events = [...schedule.events];
      for (const event of events) {
        if (schedule.deleteEvent) {
          await schedule.deleteEvent(event._id);
        } else if (schedule.remove) {
          await schedule.remove(event._id);
        }
      }

      console.log('✅ Все события очищены');
      toast({
        title: "События очищены",
        description: "Все тестовые события удалены",
      });
    } catch (error) {
      console.error('❌ Ошибка очистки событий:', error);
    }
  };

  const checkSync = () => {
    console.log('🔍 Проверяем синхронизацию...');
    console.table({
      'Dashboard Events': dashboard?.events?.length || 0,
      'Schedule Events': schedule?.events?.length || 0,
      'SuperAdmin Trainers': superAdmin?.trainers?.length || 0,
      'Dashboard Trainers': dashboard?.trainers?.length || 0,
      'Dashboard Clients': dashboard?.clients?.length || 0,
    });

    // Проверяем события
    const dashboardEvents = dashboard?.events?.length || 0;
    const scheduleEvents = schedule?.events?.length || 0;
    
    if (dashboardEvents === scheduleEvents) {
      console.log(`✅ События синхронизированы: ${dashboardEvents} в обоих контекстах`);
    } else {
      console.warn(`⚠️ Рассинхронизация событий: Dashboard(${dashboardEvents}) ≠ Schedule(${scheduleEvents})`);
    }

    // Проверяем тренеров
    const dashboardTrainers = dashboard?.trainers?.length || 0;
    const superAdminTrainers = superAdmin?.trainers?.length || 0;
    
    if (dashboardTrainers === superAdminTrainers) {
      console.log(`✅ Тренеры синхронизированы: ${dashboardTrainers} в обоих контекстах`);
    } else {
      console.warn(`⚠️ Рассинхронизация тренеров: Dashboard(${dashboardTrainers}) ≠ SuperAdmin(${superAdminTrainers})`);
    }
  };

  const refreshAll = async () => {
    console.log('🔄 Обновляем все контексты...');
    
    try {
      const promises = [];
      
      if (schedule?.refreshData) promises.push(schedule.refreshData());
      if (dashboard?.syncAllData) promises.push(dashboard.syncAllData());
      if (superAdmin?.refreshData) promises.push(superAdmin.refreshData());
      if (admin?.refreshData) promises.push(admin.refreshData());
      if (manager?.refreshData) promises.push(manager.refreshData());
      if (trainer?.refreshData) promises.push(trainer.refreshData());
      
      await Promise.all(promises);
      console.log('✅ Все контексты обновлены');
      
      toast({
        title: "Данные обновлены",
        description: "Все контексты успешно обновлены",
      });
    } catch (error) {
      console.error('❌ Ошибка обновления контекстов:', error);
    }
  };

  const stressTest = async (count = 10) => {
    console.log(`🚀 Запускаем стресс-тест: ${count} событий...`);
    
    try {
      // Используем наш исправленный метод addEvents
      await addEvents(count);
      
      // Ждем немного для обработки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверяем синхронизацию
      checkSync();
      
      console.log('✅ Стресс-тест завершен');
      toast({
        title: "Стресс-тест завершен",
        description: `Создано ${count} событий, синхронизация проверена`,
      });
    } catch (error) {
      console.error('❌ Ошибка стресс-теста:', error);
      toast({
        title: "Ошибка стресс-теста",
        description: "Произошла ошибка во время стресс-теста",
        variant: "destructive",
      });
    }
  };

  const simulateDesync = () => {
    console.log('🎭 Симулируем рассинхронизацию...');
    // Эта функция для демонстрации - в реальности рассинхронизация происходит из-за ошибок
    console.warn('⚠️ Симуляция: представьте, что данные рассинхронизированы');
    toast({
      title: "Симуляция рассинхронизации",
      description: "Проверьте мониторинг данных",
      variant: "destructive",
    });
  };

  const getStats = () => {
    const stats = {
      contexts: {
        dashboard: !!dashboard,
        schedule: !!schedule,
        superAdmin: !!superAdmin,
        admin: !!admin,
        manager: !!manager,
        trainer: !!trainer,
      },
      data: {
        events: schedule?.events?.length || 0,
        trainers: superAdmin?.trainers?.length || 0,
        clients: superAdmin?.clients?.length || 0,
      },
      methods: {
        schedule: schedule ? Object.keys(schedule) : [],
        dashboard: dashboard ? Object.keys(dashboard) : [],
      }
    };
    
    console.log('📊 Статистика debug системы:', stats);
    return stats;
  };

  return {
    addEvents,
    updateLastEvent,
    deleteLastEvent,
    clearEvents,
    checkSync,
    refreshAll,
    stressTest,
    simulateDesync,
    getStats,
  };
};
