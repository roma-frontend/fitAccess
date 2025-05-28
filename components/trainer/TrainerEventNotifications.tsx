// components/trainer/TrainerEventNotifications.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, User, MapPin, CheckCircle } from "lucide-react";
import { useMessaging } from '@/contexts/MessagingContext';

export function TrainerEventNotifications() {
  const { messages, markAsRead } = useMessaging();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Фильтруем уведомления для тренера
    const trainerNotifications = messages.filter((msg: any) => 
      msg.recipientIds?.includes('trainer_1') || 
      msg.recipientIds?.includes('trainer_2') || 
      msg.recipientIds?.includes('trainer_3')
    );
    
    setNotifications(trainerNotifications);
  }, [messages]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    console.log('✅ ТРЕНЕР: Уведомление прочитано', notificationId);
  };

  const getNotificationIcon = (notification: any) => {
    if (notification.relatedTo?.type === 'event') {
      return <Calendar className="h-5 w-5 text-blue-500" />;
    }
    return <Bell className="h-5 w-5 text-orange-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Уведомления тренера
          </h2>
          <p className="text-gray-600">Новые события и обновления расписания</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          {notifications.filter(n => !n.isRead).length} новых
        </Badge>
      </div>

      {/* Список уведомлений */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">Нет уведомлений</p>
              <p className="text-sm text-gray-400">Новые уведомления появятся здесь</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification._id} className={`transition-all ${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{notification.subject}</h3>
                                            <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Badge className="bg-red-100 text-red-800">
                            Новое
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString('ru')}
                        </span>
                      </div>
                    </div>

                    <div className="text-gray-700 mb-3 whitespace-pre-line">
                      {notification.content}
                    </div>

                    {/* Информация о связанном событии */}
                    {notification.relatedTo && notification.relatedTo.type === 'event' && (
                      <div className="bg-white rounded-lg p-3 border mb-3">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Детали события
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Название:</span>
                            <span>{notification.relatedTo.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(notification.relatedTo.startTime).toLocaleString('ru')}</span>
                          </div>
                          {notification.relatedTo.clientName && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Клиент: {notification.relatedTo.clientName}</span>
                            </div>
                          )}
                          {notification.relatedTo.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{notification.relatedTo.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        От: <span className="font-medium">{notification.senderName}</span>
                      </div>
                      
                      {!notification.isRead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Отметить как прочитанное
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Мое расписание
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Мои клиенты
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Настройки уведомлений
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

