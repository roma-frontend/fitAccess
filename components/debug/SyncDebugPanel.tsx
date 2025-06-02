// components/debug/SyncDebugPanel.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, MessageSquare, Users, Activity } from "lucide-react";

// ✅ ПРАВИЛЬНАЯ ТИПИЗАЦИЯ
interface DebugEvent {
  _id?: string;
  id?: string;
  title?: string;
  status?: string;
  type?: string;
  trainerName?: string;
  clientName?: string;
  startTime?: string;
  createdAt?: string;
  price?: number;
}

interface DebugNotification {
  id?: string;
  subject?: string;
  content?: string;
  senderRole?: string;
  senderName?: string;
  status?: string;
  createdAt?: string;
  recipientNames?: string[];
}

interface SyncStatus {
  role: string;
  synced: boolean;
}

interface DebugData {
  events: DebugEvent[];
  notifications: DebugNotification[];
  syncStatus: SyncStatus[];
}

export function SyncDebugPanel() {
  const [debugData, setDebugData] = useState<DebugData>({
    events: [],
    notifications: [],
    syncStatus: []
  });

  const refreshDebugData = () => {
    if (typeof window !== 'undefined' && window.fitAccessDebug) {
      // ✅ БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ДАННЫХ С ТИПИЗАЦИЕЙ
      const schedule = window.fitAccessDebug.schedule;
      const dashboard = window.fitAccessDebug.dashboard;
      
      setDebugData({
        events: (schedule?.events || []) as DebugEvent[],
        notifications: (dashboard?.notifications || []) as DebugNotification[],
        syncStatus: Object.entries({
          schedule: !!schedule,
          dashboard: !!dashboard,
          superAdmin: !!window.fitAccessDebug.superAdmin
        }).map(([key, value]) => ({ role: key, synced: value }))
      });
    }
  };

  useEffect(() => {
    // Инициализируем debug объект если его нет
    if (typeof window !== 'undefined') {
      if (!window.fitAccessDebug) {
        // Создаем базовую структуру
        window.fitAccessDebug = {
          help: () => console.log('Debug система инициализирована'),
          checkSync: () => console.log('Проверка синхронизации...'),
          sync: async () => console.log('Синхронизация...'),
          clear: async () => console.log('Очистка...'),
          test: async () => console.log('Тест...'),
          stats: () => ({}),
          check: () => console.log('Проверка...'),
          addEvents: async () => console.log('Добавление событий...'),
          updateLastEvent: async () => console.log('Обновление события...'),
          deleteLastEvent: async () => console.log('Удаление события...'),
          clearEvents: async () => console.log('Очистка событий...'),
          refreshAll: async () => console.log('Обновление всех данных...'),
          stressTest: async () => console.log('Стресс-тест...'),
          simulateDesync: () => console.log('Симуляция рассинхронизации...'),
          getStats: () => ({}),
          forceSyncContexts: async () => console.log('Принудительная синхронизация...'),
          diagnoseSync: () => ({}),
          clearAllEvents: async () => console.log('Очистка всех событий...')
        };
      }
    }

    refreshDebugData();
    
    // Обновляем каждые 2 секунды
    const interval = setInterval(refreshDebugData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getRoleColor = (role: string = 'system') => {
    switch (role) {
      case 'super-admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'trainer': return 'bg-orange-100 text-orange-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      case 'system': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string = 'sent') => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Панель синхронизации
          </h2>
          <p className="text-gray-600">Отслеживание событий и уведомлений в реальном времени</p>
        </div>
        <Button onClick={refreshDebugData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Обновить
        </Button>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            События ({debugData.events.length})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Уведомления ({debugData.notifications.length})
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Синхронизация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История событий</CardTitle>
            </CardHeader>
            <CardContent>
              {debugData.events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет событий для отображения</p>
                  <p className="text-sm">Создайте событие для начала отслеживания</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {debugData.events.map((event: DebugEvent, index: number) => (
                    <div key={event._id || event.id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">
                            Событие
                          </Badge>
                          <Badge variant="outline">
                            {event.status || 'scheduled'}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {event.createdAt ? new Date(event.createdAt).toLocaleString('ru') : 'Недавно'}
                        </span>
                      </div>
                      
                      <div className="bg-white rounded p-3">
                        <h4 className="font-semibold mb-2">🏋️ {event.title || 'Без названия'}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">ID:</span> {event._id || event.id || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Тип:</span> {event.type || 'training'}
                          </div>
                          <div>
                            <span className="font-medium">Тренер:</span> {event.trainerName || 'Не указан'}
                          </div>
                          <div>
                            <span className="font-medium">Клиент:</span> {event.clientName || 'Групповое'}
                          </div>
                          {event.startTime && (
                            <div>
                              <span className="font-medium">Время:</span> {new Date(event.startTime).toLocaleString('ru')}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Стоимость:</span> {event.price || 0} ₽
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История уведомлений</CardTitle>
            </CardHeader>
            <CardContent>
              {debugData.notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет уведомлений для отображения</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {debugData.notifications.map((notification: DebugNotification, index: number) => (
                    <div key={notification.id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getRoleColor(notification.senderRole)}>
                            {notification.senderName || 'Система'}
                          </Badge>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status === 'sent' ? '📤 Отправлено' :
                             notification.status === 'delivered' ? '📥 Доставлено' :
                             notification.status === 'read' ? '👁️ Прочитано' : '📤 Отправлено'}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString('ru') : 'Недавно'}
                        </span>
                      </div>

                      <div className="bg-white rounded p-3">
                        <h4 className="font-semibold mb-2">{notification.subject || 'Уведомление'}</h4>
                        <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                          {notification.content ? (
                            notification.content.length > 200 
                              ? notification.content.substring(0, 200) + '...'
                              : notification.content
                          ) : 'Содержимое недоступно'}
                        </p>
                        
                        {notification.recipientNames && notification.recipientNames.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <div className="text-xs">
                              <span className="font-medium">Получатели:</span>
                              {notification.recipientNames.map((name: string, i: number) => (
                                <Badge key={i} variant="secondary" className="ml-1 text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Статус синхронизации по компонентам */}
            {debugData.syncStatus.map((item: SyncStatus, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="mb-2">
                      {item.role === 'schedule' && '📅'}
                      {item.role === 'dashboard' && '📊'}
                      {item.role === 'superAdmin' && '👑'}
                    </div>
                    <h3 className="font-semibold capitalize">
                      {item.role === 'schedule' ? 'Расписание' :
                       item.role === 'dashboard' ? 'Дашборд' :
                       item.role === 'superAdmin' ? 'Супер Админ' : item.role}
                    </h3>
                    <div className="mt-2">
                      <Badge className={item.synced ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {item.synced ? '✅ Синхронизировано' : '❌ Не синхронизировано'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Лог синхронизации */}
          <Card>
            <CardHeader>
              <CardTitle>Лог синхронизации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debugData.events.length > 0 && (
                  <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                    <div className="flex items-center gap-2 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-medium">События загружены и синхронизированы</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Всего событий: {debugData.events.length}
                    </div>
                  </div>
                )}

                                {debugData.notifications.length > 0 && (
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="font-medium">Уведомления отправлены</span>
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Всего отправлено: {debugData.notifications.length} уведомлений
                    </div>
                  </div>
                )}

                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                  <div className="flex items-center gap-2 text-purple-800">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="font-medium">Система готова к работе</span>
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Все компоненты инициализированы
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

