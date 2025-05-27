// components/debug/TestButtons.tsx (исправленная версия)
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchedule } from '@/contexts/ScheduleContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useState } from 'react';
import { Plus, Trash2, RefreshCw, Zap, Database } from 'lucide-react';

export default function TestButtons() {
  const schedule = useSchedule();
  const dashboard = useDashboard();
  const superAdmin = useSuperAdmin();
  const [loading, setLoading] = useState<string | null>(null);

  // ✅ ИСПРАВЛЕНО: используем createEvent вместо addEvent
  const addTestEvent = async () => {
    setLoading('event');
    try {
      await schedule.createEvent({
        title: `Тест событие ${new Date().toLocaleTimeString()}`,
        description: 'Автоматически созданное тестовое событие',
        type: 'training',
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer1',
        clientId: 'client1',
        location: 'Тестовый зал'
      });
      console.log('✅ Тестовое событие добавлено');
    } catch (error) {
      console.error('❌ Ошибка добавления события:', error);
    } finally {
      setLoading(null);
    }
  };

  const updateEventStatus = async () => {
    setLoading('update');
    try {
      const lastEvent = schedule.events[schedule.events.length - 1];
      if (lastEvent) {
        await schedule.updateEvent(lastEvent._id, { 
          status: 'completed',
          title: `${lastEvent.title} (Обновлено)`
        });
        console.log('✅ Статус события обновлен');
      }
    } catch (error) {
      console.error('❌ Ошибка обновления события:', error);
    } finally {
      setLoading(null);
    }
  };

  const deleteLastEvent = async () => {
    setLoading('delete');
    try {
      const lastEvent = schedule.events[schedule.events.length - 1];
      if (lastEvent) {
        await schedule.deleteEvent(lastEvent._id);
        console.log('✅ Событие удалено');
      }
    } catch (error) {
      console.error('❌ Ошибка удаления события:', error);
    } finally {
      setLoading(null);
    }
  };

  // ✅ ИСПРАВЛЕНО: используем refreshData вместо refreshEvents
  const refreshAllData = async () => {
    setLoading('refresh');
    try {
      await Promise.all([
        schedule.refreshData(),
        dashboard.syncAllData(),
        superAdmin.refreshData?.()
      ]);
      console.log('✅ Все данные обновлены');
    } catch (error) {
      console.error('❌ Ошибка обновления данных:', error);
    } finally {
      setLoading(null);
    }
  };

  const simulateDataCorruption = async () => {
    setLoading('corrupt');
    try {
      // Симулируем рассинхронизацию данных
      await schedule.createEvent({
        title: 'Только в Schedule',
        description: 'Событие для симуляции рассинхронизации',
        type: 'training',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer1',
        clientId: 'client1',
        location: 'Тестовый зал'
      });
      
      // Не добавляем в dashboard - создаем рассинхронизацию
      console.log('⚠️ Симуляция рассинхронизации данных');
    } catch (error) {
      console.error('❌ Ошибка симуляции:', error);
    } finally {
      setLoading(null);
    }
  };

  const stressTest = async () => {
    setLoading('stress');
    try {
      console.log('🔥 Запуск стресс-теста...');
      
      // Добавляем 10 событий быстро
      const promises = Array.from({ length: 10 }, (_, i) =>
        schedule.createEvent({
          title: `Стресс тест ${i + 1}`,
          description: `Автоматическое событие для стресс-теста #${i + 1}`,
          type: 'training',
          startTime: new Date(Date.now() + (i * 60 * 60 * 1000)).toISOString(),
          endTime: new Date(Date.now() + ((i + 1) * 60 * 60 * 1000)).toISOString(),
          trainerId: `trainer${(i % 3) + 1}`,
          clientId: `client${(i % 5) + 1}`,
          location: `Зал ${(i % 3) + 1}`
        })
      );
      
      await Promise.all(promises);
      console.log('✅ Стресс-тест завершен');
    } catch (error) {
      console.error('❌ Ошибка стресс-теста:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="fixed bottom-20 right-4 w-64 z-30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Тестирование данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={addTestEvent}
          disabled={loading === 'event'}
          size="sm"
          className="w-full flex items-center gap-2"
        >
          {loading === 'event' ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          Добавить событие
        </Button>

        <Button
          onClick={updateEventStatus}
          disabled={loading === 'update' || schedule.events.length === 0}
          size="sm"
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          {loading === 'update' ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Обновить последнее
        </Button>

        <Button
          onClick={deleteLastEvent}
          disabled={loading === 'delete' || schedule.events.length === 0}
          size="sm"
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          {loading === 'delete' ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Удалить последнее
        </Button>

        <div className="border-t pt-2 space-y-2">
          <Button
            onClick={refreshAllData}
            disabled={loading === 'refresh'}
            size="sm"
            variant="secondary"
            className="w-full flex items-center gap-2"
          >
            {loading === 'refresh' ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Обновить все
          </Button>

          <Button
            onClick={simulateDataCorruption}
            disabled={loading === 'corrupt'}
            size="sm"
            variant="outline"
            className="w-full flex items-center gap-2 text-orange-600 border-orange-300"
          >
            {loading === 'corrupt' ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            Симуляция рассинхр.
          </Button>

          <Button
            onClick={stressTest}
            disabled={loading === 'stress'}
            size="sm"
            variant="outline"
            className="w-full flex items-center gap-2 text-red-600 border-red-300"
          >
            {loading === 'stress' ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            Стресс-тест
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          События: {schedule.events?.length || 0} | 
          Загрузка: {schedule.loading ? 'Да' : 'Нет'}
        </div>
      </CardContent>
    </Card>
  );
}
