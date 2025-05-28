// contexts/MessagingContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Message {
  _id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientNames: string[];
  createdAt: string;
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'normal' | 'high';
  relatedTo?: {
    type: 'event' | 'booking' | 'payment' | 'general';
    id: string;
    title: string;
    startTime?: string;
    endTime?: string;
    trainerName?: string;
    clientName?: string;
    location?: string;
    price?: number;
  };
}

interface EventLog {
  _id: string;
  action: 'created' | 'updated' | 'deleted';
  createdBy: string;
  timestamp: string;
  event: {
    _id: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    trainerName: string;
    trainerId: string;
    clientName?: string;
    clientId?: string;
    location?: string;
    price: number;
    status: string;
  };
}

interface MessagingContextType {
  messages: Message[];
  eventLogs: EventLog[];
  sendMessage: (message: Omit<Message, '_id' | 'createdAt' | 'status'>) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  logEvent: (eventLog: Omit<EventLog, '_id' | 'timestamp'>) => Promise<void>;
  getDebugData: () => {
    events: EventLog[];
    notifications: Message[];
    syncStatus: Record<string, boolean>;
  };
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  // Имитация автоматических уведомлений при создании событий
  useEffect(() => {
    const interval = setInterval(() => {
      // Проверяем новые события и отправляем уведомления
      eventLogs.forEach(async (eventLog) => {
        const existingNotification = messages.find(msg => 
          msg.relatedTo?.id === eventLog.event._id
        );

        if (!existingNotification && eventLog.action === 'created') {
          await sendAutoNotification(eventLog);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [eventLogs, messages]);

  const sendMessage = async (messageData: Omit<Message, '_id' | 'createdAt' | 'status'>) => {
    const newMessage: Message = {
      ...messageData,
      _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);

    // Имитация доставки
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg._id === newMessage._id 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    }, 1000);

    console.log('📤 Сообщение отправлено:', {
      от: newMessage.senderName,
      кому: newMessage.recipientNames,
      тема: newMessage.subject,
      связано_с: newMessage.relatedTo?.type
    });
  };

  const sendAutoNotification = async (eventLog: EventLog) => {
    const event = eventLog.event;
    
    // Определяем получателей в зависимости от типа события
    let recipientIds: string[] = [];
    let recipientNames: string[] = [];

    if (event.type === 'personal') {
      // Персональная тренировка - уведомляем тренера и клиента
      recipientIds = [`trainer_${event.trainerId}`, `client_${event.clientId}`];
      recipientNames = [event.trainerName, event.clientName || 'Клиент'];
    } else {
      // Групповая тренировка - уведомляем всех тренеров
      recipientIds = ['trainer_1', 'trainer_2', 'trainer_3'];
      recipientNames = ['Тренер 1', 'Тренер 2', 'Тренер 3'];
    }

    // Всегда добавляем менеджеров и админов
    recipientIds.push('manager_1', 'admin_1');
    recipientNames.push('Менеджер', 'Администратор');

    const notificationContent = event.type === 'personal' 
      ? `Новая персональная тренировка!\n\n` +
        `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
        `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}\n` +
        `👤 Тренер: ${event.trainerName}\n` +
        `👥 Клиент: ${event.clientName}\n` +
        `💰 Стоимость: ${event.price} ₽\n\n` +
        `Пожалуйста, подтвердите участие.`
      : `Новая групповая тренировка!\n\n` +
        `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
        `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}\n` +
        `🏋️ Тип: ${event.title}\n` +
        `👤 Тренер: ${event.trainerName}\n` +
        `💰 Стоимость: ${event.price} ₽\n\n` +
        `Запись открыта для всех участников.`;

    await sendMessage({
      subject: `🏋️ ${event.type === 'personal' ? 'Персональная' : 'Групповая'} тренировка: ${event.title}`,
      content: notificationContent,
      senderId: 'system',
      senderName: 'Система уведомлений',
      senderRole: 'system',
      recipientIds,
      recipientNames,
      isRead: false,
      priority: 'normal',
      relatedTo: {
        type: 'event',
        id: event._id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        trainerName: event.trainerName,
        clientName: event.clientName,
        location: event.location,
        price: event.price
      }
    });
  };

  const markAsRead = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId 
        ? { ...msg, isRead: true, status: 'read' }
        : msg
    ));

    console.log('👁️ Сообщение прочитано:', messageId);
  };

  const logEvent = async (eventLogData: Omit<EventLog, '_id' | 'timestamp'>) => {
    const newEventLog: EventLog = {
      ...eventLogData,
      _id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setEventLogs(prev => [...prev, newEventLog]);

    console.log('📝 Событие зарегистрировано:', {
      действие: newEventLog.action,
      создано: newEventLog.createdBy,
      событие: newEventLog.event.title,
      тип: newEventLog.event.type
    });
  };

  const getDebugData = () => {
    return {
      events: eventLogs,
      notifications: messages,
      syncStatus: {
        super_admin: true,
        admin: true,
        manager: true,
        trainer: true,
        client: true
      }
    };
  };

  return (
    <MessagingContext.Provider value={{
      messages,
      eventLogs,
      sendMessage,
      markAsRead,
      logEvent,
      getDebugData
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
