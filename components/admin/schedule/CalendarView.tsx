// components/admin/schedule/CalendarView.tsx (исправленная версия)
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User,
  MapPin,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScheduleEvent } from "./types";

interface CalendarViewProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEventDetails: (event: ScheduleEvent) => void;
  userRole: string;
}

export function CalendarView({ 
  events, 
  onEventClick, 
  onCreateEvent, 
  onEditEvent, 
  onDeleteEvent, 
  onViewEventDetails,
  userRole 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<{ date: Date; hour: number } | null>(null);

  // Получить дни недели для текущей недели
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  // Фильтровать события для текущей недели
  const weekEvents = useMemo(() => {
    console.log('Все события:', events); // Отладка
    
    const startOfWeek = new Date(weekDays[0]);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(weekDays[6]);
    endOfWeek.setHours(23, 59, 59, 999);

    const filtered = events.filter(event => {
      const eventDate = new Date(event.startTime);
      const isInWeek = eventDate >= startOfWeek && eventDate <= endOfWeek;
      
      console.log(`Событие "${event.title}":`, {
        eventDate: eventDate.toISOString(),
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
        isInWeek
      });
      
      return isInWeek;
    });

    console.log('Отфильтрованные события для недели:', filtered);
    return filtered;
  }, [events, weekDays]);

  // Получить события для конкретного дня и часа
const getEventsForSlot = (date: Date, hour: number) => {
  const slotEvents = weekEvents.filter(event => {
    const eventStart = new Date(event.startTime);
    const eventHour = eventStart.getHours();
    const eventDate = eventStart.toDateString();
    const slotDate = date.toDateString();
    
    const matches = eventDate === slotDate && eventHour === hour;
    
    return matches;
  });
  return slotEvents;
};

  const getEventTypeColor = (type: ScheduleEvent['type']) => {
    const colors = {
    training: 'bg-blue-100 text-blue-800 border-blue-200',
    consultation: 'bg-green-100 text-green-800 border-green-200',
    group: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      meeting: 'bg-purple-100 text-purple-800 border-purple-200',
      break: 'bg-gray-100 text-gray-800 border-gray-200',
      other: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type];
  };

  const getStatusColor = (status: ScheduleEvent['status']) => {
    const colors = {
      scheduled: 'bg-blue-500',
      confirmed: 'bg-green-500',
      completed: 'bg-emerald-500',
      cancelled: 'bg-red-500',
      'no-show': 'bg-gray-500'
    };
    return colors[status];
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const canCreateEvent = userRole === 'super-admin' || userRole === 'admin';

  
  const canEditEvent = (event: ScheduleEvent) => {
    return userRole === 'super-admin' || userRole === 'admin' || 
           (userRole === 'manager' && !['super-admin', 'admin'].includes(event.createdBy));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Календарь расписания
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Сегодня
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {weekDays[0].toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        {/* Отладочная информация */}
        <div className="text-xs text-gray-500">
          Всего событий: {events.length} | События на неделе: {weekEvents.length}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header с днями недели */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-sm font-medium text-gray-500">Время</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-2 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('ru', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    day.toDateString() === new Date().toDateString() 
                      ? 'text-blue-600' 
                      : 'text-gray-700'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Сетка расписания */}
            <div className="space-y-1">
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-1">
                  {/* Колонка времени */}
                  <div className="p-2 text-sm text-gray-500 border-r">
                    {hour}:00
                  </div>
                  
                  {/* Колонки дней */}
                  {weekDays.map((day, dayIndex) => {
                    const slotEvents = getEventsForSlot(day, hour);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isPast = day < new Date() || (isToday && hour < new Date().getHours());
                    const isHovered = hoveredSlot?.date.toDateString() === day.toDateString() && 
                                    hoveredSlot?.hour === hour;
                    
                    return (
                      <div 
                        key={dayIndex}
                        className={`min-h-[60px] p-1 border border-gray-200 relative transition-all ${
                          isPast ? 'bg-gray-50' : 'hover:bg-blue-50'
                        } ${isHovered ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
                        onMouseEnter={() => !isPast && canCreateEvent && setHoveredSlot({ date: day, hour })}
                        onMouseLeave={() => setHoveredSlot(null)}
                        onClick={() => {
                          console.log('Клик по слоту:', { day: day.toDateString(), hour, hasEvents: slotEvents.length > 0 });
                          if (!isPast && canCreateEvent && slotEvents.length === 0) {
                            onCreateEvent(day, hour);
                          }
                        }}
                      >
                        {slotEvents.map(event => (
                          <div
                            key={event._id}
                            className={`p-1 rounded text-xs cursor-pointer hover:shadow-md transition-all ${getEventTypeColor(event.type)} mb-1 relative group`}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Клик по событию:', event);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{event.title}</span>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                            </div>
                            
                            {event.clientName && (
                              <div className="flex items-center mt-1 text-xs opacity-75">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate">{event.clientName}</span>
                              </div>
                            )}
                            
                            {event.location && (
                              <div className="flex items-center mt-1 text-xs opacity-75">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}

                            {/* Dropdown меню для действий с событием */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Plus className="h-3 w-3 rotate-45" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    onViewEventDetails(event);
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Подробности
                                  </DropdownMenuItem>
                                  
                                  {canEditEvent(event) && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      onEditEvent(event);
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Редактировать
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {canEditEvent(event) && (
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteEvent(event._id);
                                      }}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Удалить
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                        
                        {/* Кнопка добавления события */}
                        {slotEvents.length === 0 && !isPast && canCreateEvent && (
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                            isHovered ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                          }`}>
                            <div className="bg-blue-500 text-white rounded-full p-1 shadow-md">
                              <Plus className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                        
                        {/* Отладочная информация для каждого слота */}
                        {process.env.NODE_ENV === 'development' && slotEvents.length > 0 && (
                          <div className="absolute bottom-0 left-0 text-xs bg-red-100 text-red-600 px-1 rounded">
                            {slotEvents.length}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Легенда и подсказки остаются без изменений */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Типы событий:</span>
          </div>
                    <Badge className="bg-blue-100 text-blue-800">Тренировка</Badge>
          <Badge className="bg-green-100 text-green-800">Консультация</Badge>
          <Badge className="bg-purple-100 text-purple-800">Встреча</Badge>
          <Badge className="bg-gray-100 text-gray-800">Перерыв</Badge>
          <Badge className="bg-orange-100 text-orange-800">Другое</Badge>
        </div>

        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Статусы:</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Запланировано</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Подтверждено</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Завершено</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Отменено</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Не явился</span>
          </div>
        </div>

        {/* Подсказки для пользователя */}
        {canCreateEvent && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Подсказки:</span>
            </div>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Нажмите на пустую ячейку, чтобы создать новое событие</li>
              <li>• Наведите курсор на событие и нажмите на меню для действий</li>
              <li>• Серые ячейки - прошедшее время (недоступно для создания)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

