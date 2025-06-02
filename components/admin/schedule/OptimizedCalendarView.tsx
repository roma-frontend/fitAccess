// components/admin/schedule/OptimizedCalendarView.tsx
import React, { memo, useMemo, useCallback } from "react";
import { ScheduleEvent } from "./types";

interface OptimizedCalendarViewProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEventDetails: (event: ScheduleEvent) => void;
  userRole: string;
}

// Мемоизированный компонент для отдельного события
const CalendarEvent = memo(function CalendarEvent({
  event,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
}: {
  event: ScheduleEvent;
  onEventClick: (event: ScheduleEvent) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEventDetails: (event: ScheduleEvent) => void;
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
    onViewEventDetails(event);
  }, [event, onViewEventDetails]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEvent(event);
  }, [event, onEditEvent]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteEvent(event._id);
  }, [event._id, onDeleteEvent]);

  return (
    <div
      className={`p-2 rounded border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
        statusColors[event.status]
      }`}
      onClick={handleClick}
    >
      <div className="font-semibold text-sm truncate">{event.title}</div>
      <div className="text-xs opacity-75">{event.trainerName}</div>
      {event.clientName && (
        <div className="text-xs opacity-75">{event.clientName}</div>
      )}
      <div className="text-xs opacity-75">
        {new Date(event.startTime).toLocaleTimeString("ru", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      
      <div className="flex space-x-1 mt-1">
        <button
          onClick={handleEdit}
          className="text-xs px-1 py-0.5 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-1 py-0.5 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

// Мемоизированный компонент для дня календаря
const CalendarDay = memo(function CalendarDay({
  date,
  events,
  onEventClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  isToday,
  isCurrentMonth,
}: {
  date: Date;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEventDetails: (event: ScheduleEvent) => void;
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
          +
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
            onViewEventDetails={onViewEventDetails}
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

export const OptimizedCalendarView = memo(function OptimizedCalendarView({
  events,
  onEventClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  userRole,
}: OptimizedCalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

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
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            →
          </button>
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
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            onViewEventDetails={onViewEventDetails}
            isToday={date.toDateString() === today.toDateString()}
            isCurrentMonth={date.getMonth() === calendarData.currentMonth}
          />
        ))}
      </div>
    </div>
  );
});
