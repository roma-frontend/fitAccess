// components/admin/schedule/EventsList.tsx
import React, { memo, useRef, useEffect, useState } from "react";
import { VirtualizedEventsList } from "./VirtualizedEventsList";
import { ScheduleEvent } from "./types";

interface EventsListProps {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
}

const EventsList = memo(function EventsList({
  events,
  onEdit,
  onDelete,
  onStatusChange,
}: EventsListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Получаем ширину контейнера для react-window
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Список событий ({events.length})
        </h2>
        <div className="text-sm text-gray-500">
          Отсортировано по времени начала
        </div>
      </div>
      
      <VirtualizedEventsList
        events={events}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        height={600}
        width={containerWidth} // Передаем числовое значение
        itemHeight={140}
      />
    </div>
  );
});

export default EventsList;
