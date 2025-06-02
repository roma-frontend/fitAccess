// components/admin/schedule/SchedulePage/ScheduleTabsContainer.tsx
import React, { memo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleEvent } from "../types";

// Импортируем компоненты напрямую
import CalendarView from "../CalendarView";
import EventsList from "../EventsList";
import TrainerWorkload from "../TrainerWorkload";
import AnalyticsView from "./AnalyticsView";

interface ScheduleTabsContainerProps {
  events: ScheduleEvent[];
  trainers: any[];
  stats: any;
  pageState: any;
  onDeleteEvent: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
}

const ScheduleTabsContainer = memo(function ScheduleTabsContainer({
  events,
  trainers,
  stats,
  pageState,
  onDeleteEvent,
  onStatusChange,
}: ScheduleTabsContainerProps) {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="container mx-auto px-6 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <span>📅</span>
            <span>Календарь</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <span>📋</span>
            <span>Список</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <span>📊</span>
            <span>Аналитика</span>
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex items-center space-x-2">
            <span>👥</span>
            <span>Загрузка</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-0">
          <CalendarView
            events={events}
            onEventClick={(event) => pageState.openEventDetails(event)}
            onCreateEvent={(date, hour) => pageState.openEventForm(null, date, hour)}
            onEditEvent={(event) => pageState.openEventForm(event)}
            onDeleteEvent={onDeleteEvent}
            onViewEventDetails={(event) => pageState.openEventDetails(event)}
            userRole="super-admin"
          />
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <EventsList
            events={events}
            onEdit={(event) => pageState.openEventForm(event)}
            onDelete={onDeleteEvent}
            onStatusChange={onStatusChange}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <AnalyticsView
            events={events}
            trainers={trainers}
            stats={stats}
          />
        </TabsContent>

        <TabsContent value="workload" className="mt-0">
          <TrainerWorkload
            trainers={trainers}
            events={events}
            onEventClick={(event) => pageState.openEventDetails(event)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default ScheduleTabsContainer;
