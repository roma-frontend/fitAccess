"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw,  // ← Добавить этот импорт
  Database, 
  Users, 
  Calendar, 
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

// Импортируем все контексты
import { useDashboard } from '@/contexts/DashboardContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useManager } from '@/contexts/ManagerContext';
import { useTrainer } from '@/contexts/TrainerContext';

export default function DataDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Получаем данные из всех контекстов
  const dashboard = useDashboard();
  const schedule = useSchedule();
  const superAdmin = useSuperAdmin();
  const admin = useAdmin();
  const manager = useManager();
  const trainer = useTrainer();

  const contexts = {
    dashboard: {
      name: 'Dashboard',
      data: dashboard,
      icon: <Database className="h-4 w-4" />
    },
    schedule: {
      name: 'Schedule',
      data: schedule,
      icon: <Calendar className="h-4 w-4" />
    },
    superAdmin: {
      name: 'SuperAdmin',
      data: superAdmin,
      icon: <Users className="h-4 w-4" />
    },
    admin: {
      name: 'Admin',
      data: admin,
      icon: <Activity className="h-4 w-4" />
    },
    manager: {
      name: 'Manager',
      data: manager,
      icon: <Users className="h-4 w-4" />
    },
    trainer: {
      name: 'Trainer',
      data: trainer,
      icon: <Users className="h-4 w-4" />
    }
  };

  const refreshAllData = async () => {
    setLastUpdate(new Date());
    
    // Обновляем данные во всех контекстах
    const promises = [];
    
    // ✅ ИСПРАВЛЕНО: используем правильные методы
    if (dashboard?.syncAllData) promises.push(dashboard.syncAllData());
    if (schedule?.refreshData) promises.push(schedule.refreshData()); // ← refreshData вместо refreshEvents
    if (superAdmin?.refreshData) promises.push(superAdmin.refreshData());
    if (admin?.refreshData) promises.push(admin.refreshData());
    if (manager?.refreshData) promises.push(manager.refreshData());
    
    try {
      await Promise.all(promises);
      console.log('🔄 Все данные обновлены');
    } catch (error) {
      console.error('❌ Ошибка обновления данных:', error);
    }
  };

  const getContextStatus = (contextData: any) => {
    if (!contextData) return { status: 'error', message: 'Контекст недоступен' };
    if (contextData.loading) return { status: 'loading', message: 'Загрузка...' };
    if (contextData.error) return { status: 'error', message: contextData.error };
    return { status: 'success', message: 'Данные загружены' };
  };

  const getDataCounts = (contextData: any) => {
    const counts = {
      trainers: 0,
      clients: 0,
      events: 0
    };

    if (contextData?.trainers) counts.trainers = contextData.trainers.length;
    if (contextData?.clients) counts.clients = contextData.clients.length;
    if (contextData?.events) counts.events = contextData.events.length;

    return counts;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Открыть отладчик данных"
        >
          <Database className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Отладчик данных
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={refreshAllData}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить все
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="outline"
            >
              Закрыть
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh]">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Последнее обновление:</span>
              <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="details">Детали</TabsTrigger>
              <TabsTrigger value="sync">Синхронизация</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(contexts).map(([key, context]) => {
                  const status = getContextStatus(context.data);
                  const counts = getDataCounts(context.data);

                  return (
                    <Card key={key} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {context.icon}
                          <span className="font-medium">{context.name}</span>
                        </div>
                        <Badge 
                          variant={
                            status.status === 'success' ? 'default' :
                            status.status === 'loading' ? 'secondary' : 'destructive'
                          }
                        >
                          {status.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {status.status === 'loading' && <Clock className="h-3 w-3 mr-1" />}
                          {status.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                          {status.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Тренеры:</span>
                          <span className="font-mono">{counts.trainers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Клиенты:</span>
                          <span className="font-mono">{counts.clients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>События:</span>
                          <span className="font-mono">{counts.events}</span>
                        </div>
                      </div>

                      {status.status === 'error' && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                          {status.message}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                {Object.entries(contexts).map(([key, context]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {context.icon}
                        {context.name} Context
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                        {JSON.stringify(context.data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sync">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Тесты синхронизации</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SyncTestComponent />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ ИСПРАВЛЕННЫЙ компонент для тестирования синхронизации
function SyncTestComponent() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'running' | 'success' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  const schedule = useSchedule();
  const dashboard = useDashboard();

  const runSyncTest = async () => {
    const results: typeof testResults = [];
    
    // Тест 1: Добавление события
    results.push({
      test: 'Добавление события',
      status: 'running',
      message: 'Добавляем новое событие...',
      timestamp: new Date()
    });
    setTestResults([...results]);

    try {
      // ✅ ИСПРАВЛЕНО: используем createEvent вместо addEvent
      await schedule.createEvent({
        title: `Тест событие ${Date.now()}`,
        description: 'Тестовое событие для проверки синхронизации',
        type: 'training',
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Через час
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Через 2 часа
        trainerId: 'trainer1',
        clientId: 'client1',
        location: 'Тестовый зал'
      });

      results[results.length - 1] = {
        ...results[results.length - 1],
        status: 'success',
        message: 'Событие успешно добавлено'
      };
    } catch (error) {
      results[results.length - 1] = {
        ...results[results.length - 1],
        status: 'error',
        message: `Ошибка: ${error}`
      };
    }

    // Тест 2: Проверка синхронизации между контекстами
    results.push({
      test: 'Синхронизация контекстов',
      status: 'running',
      message: 'Проверяем синхронизацию данных...',
      timestamp: new Date()
    });
    setTestResults([...results]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const scheduleEvents = schedule.events?.length || 0;
    const dashboardEvents = dashboard.events?.length || 0;

    if (scheduleEvents === dashboardEvents) {
      results[results.length - 1] = {
        ...results[results.length - 1],
        status: 'success',
        message: `Данные синхронизированы (${scheduleEvents} событий)`
      };
    } else {
      results[results.length - 1] = {
        ...results[results.length - 1],
        status: 'error',
        message: `Рассинхронизация: Schedule(${scheduleEvents}) ≠ Dashboard(${dashboardEvents})`
      };
    }

    // Тест 3: Проверка обновления данных
    results.push({
      test: 'Обновление данных',
      status: 'running',
      message: 'Проверяем обновление данных...',
      timestamp: new Date()
    });
    setTestResults([...results]);

    try {
      await Promise.all([
        schedule.refreshData(),
        dashboard.syncAllData()
      ]);

      results[results.length - 1] = {
        ...results[results.length - 1],
        status: 'success',
        message: 'Данные успешно обновлены'
      };
    } catch (error) {
      results[results.length - 1] = {
        ...results[results.length - 1],
        status: 'error',
        message: `Ошибка обновления: ${error}`
      };
    }

    setTestResults([...results]);
  };

  return (
    <div className="space-y-4">
      <Button onClick={runSyncTest} className="w-full">
        Запустить тест синхронизации
      </Button>

      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Результаты тестов:</h4>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border-l-4 ${
                result.status === 'success' ? 'border-green-500 bg-green-50' :
                result.status === 'error' ? 'border-red-500 bg-red-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.test}</span>
                <span className="text-xs text-gray-500">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm mt-1">{result.message}</p>
            </div>
          ))}
        </div>
      )}

            {/* Дополнительная информация о состоянии */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Текущее состояние контекстов:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700">Schedule Context:</div>
            <div>События: {schedule.events?.length || 0}</div>
            <div>Тренеры: {schedule.trainers?.length || 0}</div>
            <div>Загрузка: {schedule.loading ? 'Да' : 'Нет'}</div>
            <div>Ошибка: {schedule.error || 'Нет'}</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">Dashboard Context:</div>
            <div>События: {dashboard.events?.length || 0}</div>
            <div>Тренеры: {dashboard.trainers?.length || 0}</div>
            <div>Клиенты: {dashboard.clients?.length || 0}</div>
            <div>Загрузка: {dashboard.loading ? 'Да' : 'Нет'}</div>
            <div>Ошибка: {dashboard.error || 'Нет'}</div>
          </div>
        </div>
      </div>

      {/* Быстрые действия для тестирования */}
      <div className="mt-4 space-y-2">
        <h4 className="font-medium">Быстрые действия:</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => schedule.refreshData()}
          >
            Обновить Schedule
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => dashboard.syncAllData()}
          >
            Обновить Dashboard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('📊 Schedule Events:', schedule.events);
              console.log('📊 Dashboard Events:', dashboard.events);
              console.log('📊 Schedule Trainers:', schedule.trainers);
              console.log('📊 Dashboard Trainers:', dashboard.trainers);
            }}
          >
            Логировать данные
          </Button>
        </div>
      </div>
    </div>
  );
}
