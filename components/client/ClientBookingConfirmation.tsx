// components/client/ClientBookingConfirmation.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, DollarSign, CheckCircle, Star } from "lucide-react";
import { useMessaging } from '@/contexts/MessagingContext';

export function ClientBookingConfirmation() {
  const { messages } = useMessaging();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    // Фильтруем уведомления о записях для клиента
    const clientBookings = messages.filter((msg: any) => 
      msg.recipientIds?.includes('client_1') && 
      msg.relatedTo?.type === 'event'
    );
    
    setBookings(clientBookings);
  }, [messages]);

  const handleConfirmBooking = (bookingId: string) => {
    console.log('✅ КЛИЕНТ: Запись подтверждена', bookingId);
    
    // Имитация подтверждения записи
    setTimeout(() => {
      alert('✅ Запись подтверждена!\n\n' +
            'Вы успешно записались на тренировку.\n' +
            'Уведомление отправлено тренеру и менеджеру.');
    }, 500);
  };

  const handleCancelBooking = (bookingId: string) => {
    console.log('❌ КЛИЕНТ: Запись отменена', bookingId);
    
    setTimeout(() => {
      alert('❌ Запись отменена\n\n' +
            'Ваша запись была отменена.\n' +
            'Уведомление отправлено тренеру и менеджеру.');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Мои записи
          </h2>
          <p className="text-gray-600">Подтверждение и управление записями на тренировки</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {bookings.length} записей
        </Badge>
      </div>

      {/* Список записей */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">Нет активных записей</p>
              <p className="text-sm text-gray-400">Записи на тренировки появятся здесь</p>
              <Button className="mt-4">
                Записаться на тренировку
              </Button>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking._id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.relatedTo.title}
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      Подтверждено
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    Запись от: {new Date(booking.createdAt).toLocaleDateString('ru')}
                  </div>
                </div>

                {/* Детали тренировки */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3">Детали тренировки</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {new Date(booking.relatedTo.startTime).toLocaleDateString('ru', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">
                          {new Date(booking.relatedTo.startTime).toLocaleTimeString('ru', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(booking.relatedTo.endTime).toLocaleTimeString('ru', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          Длительность: {Math.round((new Date(booking.relatedTo.endTime).getTime() - new Date(booking.relatedTo.startTime).getTime()) / (1000 * 60))} мин
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">{booking.relatedTo.trainerName}</div>
                        <div className="text-sm text-gray-500">Персональный тренер</div>
                      </div>
                    </div>

                    {booking.relatedTo.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">{booking.relatedTo.location}</div>
                          <div className="text-sm text-gray-500">Место проведения</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Стоимость */}
                {booking.relatedTo.price > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">Стоимость тренировки</div>
                          <div className="text-sm text-green-600">Оплата при посещении</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {booking.relatedTo.price} ₽
                      </div>
                    </div>
                  </div>
                )}

                {/* Описание */}
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {booking.content}
                  </p>
                </div>

                {/* Действия */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleConfirmBooking(booking._id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Подтвердить участие
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleCancelBooking(booking._id)}
                    className="flex items-center gap-2"
                  >
                    Отменить запись
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Добавить в избранное
                  </Button>
                </div>

                {/* Дополнительная информация */}
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  <div className="flex flex-wrap gap-4">
                    <span>📱 SMS напоминание за 2 часа</span>
                    <span>📧 Email подтверждение отправлено</span>
                    <span>🔄 Можно перенести за 24 часа</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации для вас</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🏋️</div>
              <h4 className="font-medium">Силовые тренировки</h4>
              <p className="text-sm text-gray-600 mt-1">Подходят для ваших целей</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🧘</div>
              <h4 className="font-medium">Йога</h4>
              <p className="text-sm text-gray-600 mt-1">Восстановление и гибкость</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-2">🏃</div>
              <h4 className="font-medium">Кардио</h4>
              <p className="text-sm text-gray-600 mt-1">Улучшение выносливости</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
