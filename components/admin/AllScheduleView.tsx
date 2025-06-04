"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";
import { useSchedule } from "@/contexts/ScheduleContext"; // Используем единый контекст
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import {
  ScheduleEvent,
  CreateEventData,
} from "@/components/admin/schedule/types";
import { QuickMessageModal } from "./messaging/QuickMessageModal";
import CalendarView from "./schedule/CalendarView";
import EventsList from "./schedule/EventsList";
import TrainerWorkload from "./schedule/TrainerWorkload";
import { EventDetailsModal } from "./schedule/EventDetailsModal";
import { EventForm } from "./schedule/EventForm";

export default function AllScheduleView() {
  // Используем данные из единого контекста расписания
  const {
    events,
    trainers: scheduleTrainers,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    refreshData
  } = useSchedule();

  const { trainers: adminTrainers, clients } = useSuperAdmin();

  const [activeView, setActiveView] = useState("calendar");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [messageEvent, setMessageEvent] = useState<ScheduleEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState<string>("all");

  // Фильтрация событий
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.clientName &&
        event.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTrainer =
      selectedTrainerFilter === "all" ||
      event.trainerId === selectedTrainerFilter;

    return matchesSearch && matchesTrainer;
  });

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCreateEvent = (date: Date, hour: number) => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Вы уверены, что хотите удалить это событие?")) {
      await deleteEvent(eventId);
    }
  };

  const handleStatusChange = async (
    eventId: string,
    status: ScheduleEvent["status"]
  ) => {
    await updateEventStatus(eventId, status);
  };

  const handleSendMessage = (event: ScheduleEvent) => {
    setMessageEvent(event);
    setShowQuickMessage(true);
  };

  const handleSubmitEvent = async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, data);
        setShowEventForm(false);
        setEditingEvent(null);

        return {
          success: true,
          id: editingEvent._id
        };
      } else {
        const result = await createEvent(data);
        setShowEventForm(false);
        setEditingEvent(null);

        return {
          success: true,
          id: typeof result === 'string' ? result : undefined
        };
      }
    } catch (error) {
      console.error("Ошибка сохранения события:", error);
      return {
        success: false
      };
    }
  };

  const getMessageRecipients = () => {
    if (!messageEvent) return [];

    const recipients = [];

    // Добавляем тренера
    const trainer = adminTrainers.find((t) => t.id === messageEvent.trainerId);
    if (trainer) {
      recipients.push({
        id: trainer.id,
        name: trainer.name,
        role: trainer.role,
        phone: trainer.phone,
        email: trainer.email,
      });
    }

    // Добавляем клиента, если есть
    if (messageEvent.clientId) {
      const client = clients.find((c) => c.id === messageEvent.clientId);
      if (client) {
        recipients.push({
          id: client.id,
          name: client.name,
          role: "Клиент",
          phone: client.phone,
          email: client.email,
        });
      }
    }

    return recipients;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка расписания...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Общее расписание</h2>
          <p className="text-gray-600">
            {filteredEvents.length} событий • {scheduleTrainers.length} тренеров
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск событий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={selectedTrainerFilter}
            onChange={(e) => setSelectedTrainerFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все тренеры</option>
            {adminTrainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>

          <Button
            onClick={refreshData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить
          </Button>

          <Button
            onClick={() => setShowEventForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Создать событие
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Календарь
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Список
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Загрузка
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <CalendarView
            events={filteredEvents}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewEventDetails={handleEventClick}
            userRole="super-admin"
          />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <EventsList
            events={filteredEvents}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        {/* Workload View */}
        <TabsContent value="workload">
          <TrainerWorkload
            trainers={scheduleTrainers}
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onStatusChange={handleStatusChange}
        onSendMessage={handleSendMessage}
        userRole="super-admin"
      />

      {/* Event Form Modal */}
      <EventForm
        event={editingEvent} // Changed from 'editingEvent' to 'event'
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmitEvent}
        trainers={adminTrainers.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
        }))}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        isApiAvailable={true} // Added required prop
      />

      {/* Quick Message Modal */}
      <QuickMessageModal
        isOpen={showQuickMessage}
        onClose={() => {
          setShowQuickMessage(false);
          setMessageEvent(null);
        }}
        recipients={getMessageRecipients()}
        relatedTo={
          messageEvent
            ? {
              type: "event",
              id: messageEvent._id,
              title: messageEvent.title,
            }
            : undefined
        }
        defaultSubject={
          messageEvent
            ? `Касательно тренировки: ${messageEvent.title}`
            : undefined
        }
      />
    </div>
  );
}
