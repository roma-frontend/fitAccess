// components/admin/CreateEventModal.tsx
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, MapPin, DollarSign } from "lucide-react";
import { useMessaging } from '@/contexts/MessagingContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const { sendMessage } = useMessaging();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    type: 'training',
    startTime: '',
    endTime: '',
    trainerId: '',
    trainerName: '',
    clientId: '',
    clientName: '',
    location: '',
    price: 0,
    duration: 60,
    status: 'scheduled'
  });

  // Mock данные для демонстрации
  const trainers = [
    { id: 'trainer_1', name: 'Анна Петрова', specialization: 'Фитнес' },
    { id: 'trainer_2', name: 'Михаил Волков', specialization: 'Силовые тренировки' },
    { id: 'trainer_3', name: 'Елена Сидорова', specialization: 'Йога' }
  ];

  const clients = [
    { id: 'client_1', name: 'Иван Иванов', membership: 'Premium' },
    { id: 'client_2', name: 'Мария Смирнова', membership: 'Standard' },
    { id: 'client_3', name: 'Алексей Козлов', membership: 'Basic' }
  ];

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.startTime || !eventData.trainerId) {
      alert('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    try {
      // 1. Создаем событие
      const newEvent = {
        _id: `event_${Date.now()}`,
        ...eventData,
        createdBy: 'super-admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🎯 СУПЕР АДМИН: Создание события', newEvent);

      // 2. Сохраняем в базу данных (имитация)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Отправляем уведомления всем заинтересованным сторонам
      await sendEventNotifications(newEvent);

      // 4. Уведомляем о создании события
      onEventCreated(newEvent);
      
      // 5. Логируем в debug систему
      if (typeof window !== 'undefined' && window.fitAccessDebug) {
        window.fitAccessDebug.events = window.fitAccessDebug.events || [];
        window.fitAccessDebug.events.push({
          action: 'created',
          event: newEvent,
          timestamp: new Date().toISOString(),
          createdBy: 'super-admin'
        });
      }

      alert('✅ Событие успешно создано! Уведомления отправлены всем участникам.');
      onClose();
      
    } catch (error) {
      console.error('Ошибка создания события:', error);
      alert('❌ Ошибка создания события');
    } finally {
      setLoading(false);
    }
  };

  const sendEventNotifications = async (event: any) => {
    const notifications = [];

    // ✅ ИСПРАВЛЕННАЯ ТИПИЗАЦИЯ - добавляем все обязательные поля
    // Уведомление тренеру
    const trainerNotification = {
      type: 'notification' as const,
      subject: '📅 Новое событие в вашем расписании',
      content: `Для вас запланировано новое событие: "${event.title}"\n\n` +
               `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
               `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru')} - ${new Date(event.endTime).toLocaleTimeString('ru')}\n` +
               `👤 Клиент: ${event.clientName || 'Групповое занятие'}\n` +
               `📍 Место: ${event.location || 'Основной зал'}\n\n` +
               `Подготовьтесь к тренировке заранее!`,
      senderId: 'system',
      senderName: 'Система FitAccess',
      senderRole: 'system' as const,
      recipientIds: [event.trainerId],
      recipientNames: [event.trainerName],
      priority: 'high' as const,
      relatedTo: {
        type: 'event' as const,
        id: event._id,
        title: event.title
      },
      isRead: false, // ✅ Добавляем обязательное поле
      isArchived: false
    };
    notifications.push(trainerNotification);

    // Уведомление клиенту (если есть)
    if (event.clientId && event.clientName) {
      const clientNotification = {
        type: 'notification' as const,
        subject: '✅ Подтверждение записи на тренировку',
        content: `Вы успешно записаны на тренировку!\n\n` +
                 `🏋️ Тренировка: ${event.title}\n` +
                 `👨‍💼 Тренер: ${event.trainerName}\n` +
                 `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
                 `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru')} - ${new Date(event.endTime).toLocaleTimeString('ru')}\n` +
                 `📍 Место: ${event.location || 'Основной зал'}\n` +
                 `💰 Стоимость: ${event.price} ₽\n\n` +
                 `Не забудьте прийти за 10 минут до начала!`,
        senderId: 'system',
        senderName: 'Система FitAccess',
        senderRole: 'system' as const,
        recipientIds: [event.clientId],
        recipientNames: [event.clientName],
        priority: 'high' as const,
        relatedTo: {
          type: 'event' as const,
          id: event._id,
          title: event.title
        },
        isRead: false, // ✅ Добавляем обязательное поле
        isArchived: false
      };
      notifications.push(clientNotification);
    }

    // Уведомление менеджерам
    const managerNotification = {
      type: 'notification' as const,
      subject: '📊 Новое событие добавлено в расписание',
      content: `Супер админ создал новое событие в системе:\n\n` +
               `🏋️ Событие: ${event.title}\n` +
               `👨‍💼 Тренер: ${event.trainerName}\n` +
               `👤 Клиент: ${event.clientName || 'Групповое занятие'}\n` +
               `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
               `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru')}\n` +
               `💰 Стоимость: ${event.price} ₽`,
      senderId: 'system',
      senderName: 'Система FitAccess',
      senderRole: 'system' as const,
      recipientIds: ['manager_1', 'manager_2'], // ID менеджеров
      recipientNames: ['Менеджер 1', 'Менеджер 2'],
      priority: 'normal' as const,
      relatedTo: {
        type: 'event' as const,
        id: event._id,
        title: event.title
      },
      isRead: false, // ✅ Добавляем обязательное поле
      isArchived: false
    };
    notifications.push(managerNotification);

    // Отправляем все уведомления
    for (const notification of notifications) {
      try {
        await sendMessage(notification);
        console.log(`📨 Уведомление отправлено: ${notification.recipientNames.join(', ')}`);
      } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
      }
    }

    // Логируем в debug систему
    if (typeof window !== 'undefined' && window.fitAccessDebug) {
      window.fitAccessDebug.notifications = window.fitAccessDebug.notifications || [];
      // Добавляем _id и другие поля для debug системы
      const debugNotifications = notifications.map(notif => ({
        ...notif,
        _id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent' as const,
        createdAt: new Date().toISOString()
      }));
      window.fitAccessDebug.notifications.push(...debugNotifications);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Создание нового события
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Основная информация */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название события *</label>
              <Input
                value={eventData.title}
                onChange={(e) => setEventData({...eventData, title: e.target.value})}
                placeholder="Персональная тренировка"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Тип события</label>
              <Select value={eventData.type} onValueChange={(value) => setEventData({...eventData, type: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Персональная тренировка</SelectItem>
                  <SelectItem value="group">Групповое занятие</SelectItem>
                  <SelectItem value="consultation">Консультация</SelectItem>
                  <SelectItem value="assessment">Оценка физической формы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
                placeholder="Дополнительная информация о событии"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Время и участники */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Начало *</label>
                <Input
                  type="datetime-local"
                  value={eventData.startTime}
                  onChange={(e) => {
                    const startTime = e.target.value;
                    const endTime = new Date(new Date(startTime).getTime() + eventData.duration * 60000).toISOString().slice(0, 16);
                    setEventData({...eventData, startTime, endTime});
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Окончание</label>
                <Input
                  type="datetime-local"
                  value={eventData.endTime}
                  onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Тренер *</label>
              <Select 
                value={eventData.trainerId} 
                onValueChange={(value) => {
                  const trainer = trainers.find(t => t.id === value);
                  setEventData({
                    ...eventData, 
                    trainerId: value,
                    trainerName: trainer?.name || ''
                  });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите тренера" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map(trainer => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.name} - {trainer.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Клиент (опционально)</label>
              <Select 
                value={eventData.clientId} 
                onValueChange={(value) => {
                  const client = clients.find(c => c.id === value);
                  setEventData({
                    ...eventData, 
                    clientId: value,
                    clientName: client?.name || ''
                  });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Групповое занятие</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.membership}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Место проведения
              </label>
              <Input
                value={eventData.location}
                onChange={(e) => setEventData({...eventData, location: e.target.value})}
                placeholder="Основной зал"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Стоимость (₽)
              </label>
              <Input
                type="number"
                value={eventData.price}
                onChange={(e) => setEventData({...eventData, price: Number(e.target.value)})}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Длительность (мин)
              </label>
              <Select 
                value={eventData.duration.toString()} 
                onValueChange={(value) => setEventData({...eventData, duration: Number(value)})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 минут</SelectItem>
                  <SelectItem value="45">45 минут</SelectItem>
                  <SelectItem value="60">60 минут</SelectItem>
                  <SelectItem value="90">90 минут</SelectItem>
                  <SelectItem value="120">120 минут</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleCreateEvent} disabled={loading}>
            {loading ? 'Создание...' : 'Создать событие'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

