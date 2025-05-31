"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScheduleEvent, TrainerSchedule, Client } from "@/hooks/useScheduleData";

interface CalendarViewProps {
  events: ScheduleEvent[];
  trainers: TrainerSchedule[];
  clients: Client[];
  currentView: 'month' | 'week' | 'day';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
  onDateClick: (date: Date, hour?: number) => void;
  onEventStatusChange: (eventId: string, status: string) => void;
}

export function CalendarView({ 
  events, 
  currentView, 
  currentDate, 
  onDateChange, 
  onEventClick, 
  onDateClick 
}: CalendarViewProps) {
  // ✅ СТАТУСЫ СОБЫТИЙ
  const statusConfig = {
    scheduled: { label: "Запланировано", color: "bg-blue-100 text-blue-800 border-blue-200" },
    confirmed: { label: "Подтверждено", color: "bg-green-100 text-green-800 border-green-200" },
    completed: { label: "Завершено", color: "bg-gray-100 text-gray-800 border-gray-200" },
    cancelled: { label: "Отменено", color: "bg-red-100 text-red-800 border-red-200" },
    "no-show": { label: "Не явился", color: "bg-orange-100 text-orange-800 border-orange-200" },
  };

  useEffect(() => {
    console.log("📅 CalendarView получил события:", {
      count: events.length,
      currentDate: currentDate.toISOString(),
      events: events.map(e => ({
        id: e._id,
        title: e.title,
        startTime: e.startTime
      }))
    });
  }, [events, currentDate]);


  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    const currentDateStart = new Date(currentDate);
    currentDateStart.setHours(0, 0, 0, 0);
    
    const currentDateEnd = new Date(currentDate);
    currentDateEnd.setHours(23, 59, 59, 999);
    
    const isToday = eventDate >= currentDateStart && eventDate <= currentDateEnd;
    
    console.log("🔍 Проверка события:", {
      eventTitle: event.title,
      eventDate: eventDate.toISOString(),
      currentDateStart: currentDateStart.toISOString(),
      currentDateEnd: currentDateEnd.toISOString(),
      isToday
    });
    
    return isToday;
  });

  console.log("📅 События на выбранную дату:", {
    selectedDate: currentDate.toISOString(),
    totalEvents: events.length,
    todayEvents: todayEvents.length
  });

  // ✅ НАВИГАЦИЯ ПО ДАТАМ
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  // ✅ ФОРМАТИРОВАНИЕ ЗАГОЛОВКА
  const getHeaderTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };

    if (currentView === 'day') {
      return currentDate.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    return currentDate.toLocaleDateString('ru-RU', options);
  };

  // ✅ ПОЛУЧЕНИЕ СОБЫТИЙ ДЛЯ ДАТЫ
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.startTime.startsWith(dateString)
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // ✅ РЕНДЕР СОБЫТИЯ
  const renderEvent = (event: ScheduleEvent, isCompact = false) => {
    const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.scheduled;
    const startTime = new Date(event.startTime).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = new Date(event.endTime).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div
        key={event._id}
        onClick={() => onEventClick(event)}
        className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all ${status.color} ${
          isCompact ? 'text-xs' : 'text-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{event.title}</p>
            <p className="text-xs opacity-75">
              {startTime} - {endTime}
            </p>
            {!isCompact && (
              <p className="text-xs opacity-75 truncate">
                {event.trainerName}
                {event.clientName && ` • ${event.clientName}`}
              </p>
            )}
          </div>
          {!isCompact && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {status.label}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  // ✅ РЕНДЕР МЕСЯЧНОГО ВИДА
  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Заголовки дней недели */}
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
            {day}
          </div>
        ))}
        
        {/* Дни месяца */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDate(day);

          return (
            <div
              key={index}
              onClick={() => onDateClick(day)}
              className={`min-h-[100px] p-1 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
              } ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => renderEvent(event, true))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 2} еще
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ✅ РЕНДЕР НЕДЕЛЬНОГО ВИДА
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDate(day);

          return (
            <div key={index} className="space-y-2">
              <div
                onClick={() => onDateClick(day)}
                className={`p-3 text-center border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  // components/admin/CalendarView.tsx (продолжение)

                  isToday ? 'bg-blue-50 border-blue-200 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-xs text-gray-500">
                  {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-medium ${
                  isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayEvents.map(event => renderEvent(event))}
                {dayEvents.length === 0 && (
                  <div
                    onClick={() => onDateClick(day, 9)}
                    className="p-2 border-2 border-dashed border-gray-300 rounded text-center text-gray-500 text-sm cursor-pointer hover:border-blue-400 hover:text-blue-600"
                  >
                    Добавить событие
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ✅ РЕНДЕР ДНЕВНОГО ВИДА
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

    return (
      <div className="space-y-4">
        {/* Заголовок дня */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium">
            {currentDate.toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {dayEvents.length} событий запланировано
          </p>
        </div>

        {/* Временная сетка */}
        <div className="space-y-2">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = new Date(event.startTime).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex gap-4">
                <div className="w-16 text-sm text-gray-500 pt-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1">
                  {hourEvents.length > 0 ? (
                    <div className="space-y-2">
                      {hourEvents.map(event => renderEvent(event))}
                    </div>
                  ) : (
                    <div
                      onClick={() => onDateClick(currentDate, hour)}
                      className="h-12 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center justify-center text-gray-500 text-sm transition-colors"
                    >
                      Добавить событие
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ✅ ЗАГОЛОВОК И НАВИГАЦИЯ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {getHeaderTitle()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Сегодня
        </Button>
      </div>

      {/* ✅ КАЛЕНДАРЬ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
      </div>

      {/* ✅ ЛЕГЕНДА СТАТУСОВ */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${config.color.split(' ')[0]}`} />
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

