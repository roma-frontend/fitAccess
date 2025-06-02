// components/admin/schedule/CalendarView.tsx
import React, { memo, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const CalendarEvent = memo(function CalendarEvent({
  event,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
}: {
  event: ScheduleEvent;
  onEventClick: (event: ScheduleEvent) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}) {
  const statusColors = {
    scheduled: "bg-blue-100 border-blue-300 text-blue-800",
    confirmed: "bg-green-100 border-green-300 text-green-800",
    completed: "bg-emerald-100 border-emerald-300 text-emerald-800",
    cancelled: "bg-red-100 border-red-300 text-red-800",
    "no-show": "bg-gray-100 border-gray-300 text-gray-800",
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  }, [event, onEventClick]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEvent(event);
  }, [event, onEditEvent]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Удалить это событие?")) {
      onDeleteEvent(event._id);
    }
  }, [event._id, onDeleteEvent]);

  return (
    <div
      className={`p-2 rounded border-l-4 cursor-pointer hover:shadow-md transition-shadow text-xs ${
        statusColors[event.status]
      }`}
      onClick={handleClick}
      title={`${event.title} - ${event.trainerName}`}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="opacity-75 truncate">{event.trainerName}</div>
      {event.clientName && (
        <div className="opacity-75 truncate">{event.clientName}</div>
      )}
      <div className="opacity-75">
        {new Date(event.startTime).toLocaleTimeString("ru", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      
      <div className="flex space-x-1 mt-1">
        <button
          onClick={handleEdit}
          className="text-xs px-1 py-0.5 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
          title="Редактировать"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-1 py-0.5 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
          title="Удалить"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

const CalendarDay = memo(function CalendarDay({
  date,
  events,
  onEventClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  isToday,
  isCurrentMonth,
}: {
  date: Date;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isToday: boolean;
  isCurrentMonth: boolean;
}) {
  const handleCreateEvent = useCallback(() => {
    onCreateEvent(date, 10); // Создаем на 10:00 по умолчанию
  }, [date, onCreateEvent]);

  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events, date]);

  return (
    <div
      className={`min-h-[120px] border border-gray-200 p-2 ${
        isToday ? "bg-blue-50 border-blue-300" : "bg-white"
      } ${!isCurrentMonth ? "opacity-50" : ""}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-sm font-medium ${
            isToday ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {date.getDate()}
        </span>
        <button
          onClick={handleCreateEvent}
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
          title="Создать событие"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      
      <div className="space-y-1">
        {dayEvents.slice(0, 3).map(event => (
          <CalendarEvent
            key={event._id}
            event={event}
            onEventClick={onEventClick}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        ))}
        {dayEvents.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{dayEvents.length - 3} еще
          </div>
        )}
      </div>
    </div>
  );
});

const CalendarView = memo(function CalendarView({
  events,
  onEventClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  userRole,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Мемоизируем вычисления календаря
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString("ru", { 
        month: "long", 
        year: "numeric" 
      }),
      currentMonth: month,
      currentYear: year,
    };
  }, [currentDate]);

  const today = useMemo(() => new Date(), []);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">
          {calendarData.monthName}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleToday}
            variant="outline"
            size="sm"
          >
            Сегодня
          </Button>
          <Button
            onClick={handlePrevMonth}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleNextMonth}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b">
        {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarData.days.map((date, index) => (
          <CalendarDay
            key={index}
            date={date}
            events={events}
            onEventClick={onViewEventDetails}
            onCreateEvent={onCreateEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            isToday={date.toDateString() === today.toDateString()}
            isCurrentMonth={date.getMonth() === calendarData.currentMonth}
          />
        ))}
      </div>
    </div>
  );
});

export default CalendarView;
