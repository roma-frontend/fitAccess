// components/admin/SuperAdminEventManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User, MapPin, DollarSign, Eye } from "lucide-react";
import { CreateEventModal } from './CreateEventModal';
import { useMessaging } from '@/contexts/MessagingContext';

export function SuperAdminEventManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { messages } = useMessaging();

  useEffect(() => {
    // Загружаем существующие события
    loadEvents();
  }, []);

  const loadEvents = () => {
    // Имитация загрузки событий
    const mockEvents = [
      {
        _id: 'event_existing_1',
        title: 'Утренняя йога',
        type: 'group',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        trainerId: 'trainer_3',
        trainerName: 'Елена Сидорова',
        location: 'Зал йоги',
        price: 800,
        status: 'scheduled',
        createdBy: 'manager_1'
      }
    ];
    setEvents(mockEvents);
  };

  const handleEventCreated = (newEvent: any) => {
    setEvents(prev => [newEvent, ...prev]);
    
    // Показываем уведомление о синхронизации
    setTimeout(() => {
      console.log('🔄 СИНХРОНИЗАЦИЯ: Событие синхронизировано со всеми ролями');
      alert('✅ Событие создано и синхронизировано!\n\n' +
            '📨 Уведомления отправлены:\n' +
            '• Тренеру - о новом событии в расписании\n' +
            '• Клиенту - подтверждение записи\n' +
            '• Менеджерам - информация о новом событии\n\n' +
            'Проверьте панели других ролей для просмотра синхронизации!');
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return '🏋️';
      case 'group': return '👥';
      case 'consultation': return '💬';
      case 'assessment': return '📊';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление событиями</h2>
          <p className="text-gray-600">Создание и управление событиями в системе</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Создать событие
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего событий</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Запланировано</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'scheduled').length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершено</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'completed').length}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Доход</p>
                <p className="text-2xl font-bold">{events.reduce((sum, e) => sum + (e.price || 0), 0)} ₽</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список событий */}
      <Card>
        <CardHeader>
          <CardTitle>Все события</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет созданных событий</p>
              <p className="text-sm">Создайте первое событие для начала работы</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getTypeIcon(event.type)}</span>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === 'scheduled' ? 'Запланировано' : 
                           event.status === 'completed' ? 'Завершено' : 'Отменено'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.startTime).toLocaleDateString('ru')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(event.startTime).toLocaleTimeString('ru', {hour: '2-digit', minute: '2-digit'})} - 
                            {new Date(event.endTime).toLocaleTimeString('ru', {hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{event.trainerName}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.clientName && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Клиент:</span> {event.clientName}
                        </div>
                      )}

                      {event.price > 0 && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                          💰 {event.price} ₽
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно создания события */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
