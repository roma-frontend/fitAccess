// components/trainer/TrainerNotifications.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Clock, Users, MessageSquare, Calendar } from "lucide-react";
import { useTrainer } from '@/contexts/TrainerContext';

interface Notification {
  id: string;
  type: 'workout' | 'message' | 'client' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function TrainerNotifications() {
  const { workouts, messages, clients } = useTrainer();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [workouts, messages, clients]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Уведомления о предстоящих тренировках
    const upcomingWorkouts = workouts.filter(w => {
      if (!w.date || !w.time) return false;
      
      try {
        const workoutDateTime = new Date(`${w.date}T${w.time}`);
        const timeDiff = workoutDateTime.getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 60 * 60 * 1000; // В течение часа
      } catch (error) {
        console.warn('Ошибка парсинга даты тренировки:', w);
        return false;
      }
    });

    upcomingWorkouts.forEach(workout => {
      if (workout.id) {
        newNotifications.push({
          id: `workout-${workout.id}`,
          type: 'workout',
          title: 'Скоро тренировка',
          message: `Тренировка с ${workout.clientName || 'клиентом'} в ${workout.time}`,
          time: new Date().toISOString(),
          read: false,
          priority: 'high'
        });
      }
    });

    // Уведомления о новых сообщениях (с проверкой наличия свойств)
    const unreadMessages = messages.filter(m => {
      // Проверяем наличие свойств с fallback значениями
      const isRead = 'read' in m ? m.read : false;
      const isFromTrainer = 'isFromTrainer' in m ? m.isFromTrainer : false;
      return !isRead && !isFromTrainer;
    });

    if (unreadMessages.length > 0) {
      newNotifications.push({
        id: 'messages-unread',
        type: 'message',
        title: 'Новые сообщения',
        message: `У вас ${unreadMessages.length} непрочитанных сообщений`,
        time: new Date().toISOString(),
        read: false,
        priority: 'medium'
      });
    }

    // Уведомления о новых клиентах
    const trialClients = clients.filter(c => c.status === 'trial');
    if (trialClients.length > 0) {
      newNotifications.push({
        id: 'trial-clients',
        type: 'client',
        title: 'Пробные клиенты',
        message: `${trialClients.length} клиентов на пробном периоде`,
        time: new Date().toISOString(),
        read: false,
        priority: 'low'
      });
    }

    // Напоминания о планировании
    const todayWorkouts = workouts.filter(w => w.date === today);
    if (todayWorkouts.length === 0) {
      newNotifications.push({
        id: 'no-workouts-today',
        type: 'reminder',
        title: 'Свободный день',
        message: 'На сегодня тренировок не запланировано',
        time: new Date().toISOString(),
        read: false,
        priority: 'low'
      });
    }

    setNotifications(newNotifications.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    ));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'workout': return Clock;
      case 'message': return MessageSquare;
      case 'client': return Users;
      case 'reminder': return Calendar;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Свернуть' : 'Показать все'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayNotifications.length > 0 ? (
          <div className="space-y-3">
            {displayNotifications.map((notification) => {
              const IconComponent = getIcon(notification.type);
              return (
                <div 
                  key={notification.id}
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : getPriorityColor(notification.priority)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.time).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          ✓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Нет новых уведомлений</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
