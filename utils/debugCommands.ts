// utils/debugCommands.ts (исправленная версия)
"use client";

// Добавляем глобальные команды для тестирования в консоли браузера
declare global {
  interface Window {
    fitAccessDebug: {
      addEvents: (count: number) => void;
      clearEvents: () => void;
      simulateError: () => void;
      checkSync: () => void;
      stressTest: () => void;
      refreshAll: () => void;
    };
  }
}

export const initDebugCommands = (
  schedule: any,
  dashboard: any,
  superAdmin: any
) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.fitAccessDebug = {
      addEvents: async (count: number = 5) => {
        console.log(`🧪 Добавляем ${count} тестовых событий...`);
        
        const promises = Array.from({ length: count }, (_, i) =>
          schedule.createEvent({
            title: `Debug событие ${i + 1}`,
            description: `Тестовое событие для отладки #${i + 1}`,
            type: 'training',
            startTime: new Date(Date.now() + (i * 60 * 60 * 1000)).toISOString(),
            endTime: new Date(Date.now() + ((i + 1) * 60 * 60 * 1000)).toISOString(),
            trainerId: `trainer${(i % 3) + 1}`,
            clientId: `client${(i % 5) + 1}`,
            location: `Debug зал ${i + 1}`
          })
        );
        
        try {
          await Promise.all(promises);
          console.log(`✅ ${count} событий добавлено`);
        } catch (error) {
          console.error('❌ Ошибка добавления событий:', error);
        }
      },

      clearEvents: async () => {
        console.log('🧹 Очищаем все события...');
        try {
          const events = schedule.events || [];
          const promises = events.map((event: any) => schedule.deleteEvent(event._id));
          await Promise.all(promises);
          console.log(`✅ Удалено ${events.length} событий`);
        } catch (error) {
          console.error('❌ Ошибка очистки событий:', error);
        }
      },

      simulateError: () => {
        console.log('💥 Симулируем ошибку...');
        throw new Error('Тестовая ошибка для проверки обработки');
      },

      checkSync: () => {
        console.log('🔍 Проверяем синхронизацию...');
        console.table({
          'Dashboard Events': dashboard.events?.length || 0,
          'Schedule Events': schedule.events?.length || 0,
          'SuperAdmin Trainers': superAdmin.trainers?.length || 0,
          'Dashboard Trainers': dashboard.trainers?.length || 0,
          'Dashboard Clients': dashboard.clients?.length || 0
        });
        
                // Проверяем рассинхронизацию
                const scheduleEventsCount = schedule.events?.length || 0;
                const dashboardEventsCount = dashboard.events?.length || 0;
                
                if (scheduleEventsCount !== dashboardEventsCount) {
                  console.warn(`⚠️ Рассинхронизация событий: Schedule(${scheduleEventsCount}) ≠ Dashboard(${dashboardEventsCount})`);
                } else {
                  console.log(`✅ События синхронизированы: ${scheduleEventsCount} в обоих контекстах`);
                }
                
                const superAdminTrainersCount = superAdmin.trainers?.length || 0;
                const dashboardTrainersCount = dashboard.trainers?.length || 0;
                
                if (superAdminTrainersCount !== dashboardTrainersCount) {
                  console.warn(`⚠️ Рассинхронизация тренеров: SuperAdmin(${superAdminTrainersCount}) ≠ Dashboard(${dashboardTrainersCount})`);
                } else {
                  console.log(`✅ Тренеры синхронизированы: ${superAdminTrainersCount} в обоих контекстах`);
                }
              },
        
              stressTest: async () => {
                console.log('🔥 Запуск стресс-теста...');
                const start = performance.now();
                
                try {
                  // Добавляем 50 событий параллельно
                  const promises = Array.from({ length: 50 }, (_, i) =>
                    schedule.createEvent({
                      title: `Стресс ${i}`,
                      description: `Стресс-тест событие #${i}`,
                      type: 'training',
                      startTime: new Date(Date.now() + (i * 1000)).toISOString(),
                      endTime: new Date(Date.now() + ((i + 1) * 1000)).toISOString(),
                      trainerId: `trainer${(i % 3) + 1}`,
                      clientId: `client${(i % 5) + 1}`,
                      location: `Стресс зал ${i % 3 + 1}`
                    })
                  );
                  
                  await Promise.all(promises);
                  const end = performance.now();
                  console.log(`✅ Стресс-тест завершен за ${(end - start).toFixed(2)}ms`);
                  
                  // Проверяем состояние после стресс-теста
                  setTimeout(() => {
                    window.fitAccessDebug.checkSync();
                  }, 1000);
                  
                } catch (error) {
                  console.error('❌ Ошибка стресс-теста:', error);
                }
              },
        
              refreshAll: async () => {
                console.log('🔄 Обновляем все контексты...');
                try {
                  const promises = [];
                  
                  if (schedule.refreshData) promises.push(schedule.refreshData());
                  if (dashboard.syncAllData) promises.push(dashboard.syncAllData());
                  if (superAdmin.refreshData) promises.push(superAdmin.refreshData());
                  
                  await Promise.all(promises);
                  console.log('✅ Все контексты обновлены');
                  
                  // Проверяем синхронизацию после обновления
                  setTimeout(() => {
                    window.fitAccessDebug.checkSync();
                  }, 500);
                  
                } catch (error) {
                  console.error('❌ Ошибка обновления контекстов:', error);
                }
              }
            };
        
            console.log(`
        🎯 FitAccess Debug Commands:
        • fitAccessDebug.addEvents(5) - добавить 5 тестовых событий
        • fitAccessDebug.clearEvents() - очистить все события  
        • fitAccessDebug.simulateError() - симулировать ошибку
        • fitAccessDebug.checkSync() - проверить синхронизацию
        • fitAccessDebug.stressTest() - запустить стресс-тест (50 событий)
        • fitAccessDebug.refreshAll() - обновить все контексты
        
        📊 Дополнительные команды:
        • console.log(schedule) - посмотреть Schedule контекст
        • console.log(dashboard) - посмотреть Dashboard контекст
        • console.log(superAdmin) - посмотреть SuperAdmin контекст
            `);
          }
        };
        
