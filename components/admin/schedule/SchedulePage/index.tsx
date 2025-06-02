// components/admin/schedule/SchedulePage/index.tsx
import React, { memo, lazy, Suspense, useCallback } from "react";
import { useUnifiedScheduleData } from "@/hooks/useUnifiedScheduleData";
import { useSchedulePageState } from "@/hooks/useSchedulePageState";
import { SchedulePageHeader } from "./SchedulePageHeader";
import { ScheduleNotifications } from "./ScheduleNotifications";
import { ScheduleStats } from "../ScheduleStats";
import { ScheduleEvent, CreateEventData } from "../types";
import ScheduleTabsContainer from "./ScheduleTabsContainer";
import LoadingOverlay from "./LoadingOverlay";

// Ленивая загрузка модалов
const LazyModals = lazy(() => import("./LazyModals"));

const SchedulePage = memo(function SchedulePage() {
  const data = useUnifiedScheduleData();
  const pageState = useSchedulePageState();

  const {
    events,
    trainers,
    clients,
    stats,
    isApiAvailable,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    isLoading: isMutationLoading,
    error: mutationError,
    clearError,
  } = data;

  // Мемоизированные обработчики
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleExport = useCallback(() => {
    const csvData = events.map((event) => ({
      title: event.title,
      type: event.type,
      trainer: event.trainerName,
      client: event.clientName || "",
      startTime: new Date(event.startTime).toLocaleString("ru"),
      endTime: new Date(event.endTime).toLocaleString("ru"),
      status: event.status,
      location: event.location || "",
    }));

    const csv = [
      ["Название", "Тип", "Тренер", "Клиент", "Начало", "Конец", "Статус", "Место"],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schedule-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const handleCreateEvent = useCallback(() => {
    pageState.openEventForm();
  }, [pageState]);

  // Обработчики для событий с правильными типами
  const handleCreateEventSubmit = useCallback(async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
    try {
      const result = await createEvent(data);
      
      // Если createEvent возвращает void, считаем это успехом
      if (result === undefined || result === null) {
        pageState.closeEventForm();
        return { success: true };
      }
      
      // Если возвращает объект с success
      if (typeof result === 'object' && 'success' in result) {
        if (result.success) {
          pageState.closeEventForm();
          return { success: true, id: result.id };
        } else {
          throw new Error("Не удалось создать событие");
        }
      }
      
      // Fallback - считаем успехом
      pageState.closeEventForm();
      return { success: true };
      
    } catch (error) {
      console.error("Ошибка создания события:", error);
      return { success: false };
    }
  }, [createEvent, pageState]);

  const handleUpdateEventSubmit = useCallback(async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
    if (!pageState.editingEvent) {
      return { success: false };
    }

    try {
      const result = await updateEvent(pageState.editingEvent._id, data);
      
      // Если updateEvent возвращает void, считаем это успехом
      if (result === undefined || result === null) {
        pageState.closeEventForm();
        return { success: true, id: pageState.editingEvent._id };
      }
      
      // Если возвращает объект с success
      if (typeof result === 'object' && 'success' in result) {
        if (result.success) {
          pageState.closeEventForm();
          return { success: true, id: pageState.editingEvent._id };
        } else {
          throw new Error("Не удалось обновить событие");
        }
      }
      
      // Fallback - считаем успехом
      pageState.closeEventForm();
      return { success: true, id: pageState.editingEvent._id };
      
    } catch (error) {
      console.error("Ошибка обновления события:", error);
      return { success: false };
    }
  }, [updateEvent, pageState]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это событие?")) return;

    try {
      const result = await deleteEvent(eventId);
      
      // Если deleteEvent возвращает void, считаем это успехом
      if (result === undefined || result === null) {
        return;
      }
      
      // Если возвращает объект с success
      if (typeof result === 'object' && 'success' in result && !result.success) {
        throw new Error("Не удалось удалить событие");
      }
      
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      alert(`Ошибка удаления события: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    }
  }, [deleteEvent]);

  const handleStatusChange = useCallback(async (eventId: string, status: ScheduleEvent["status"]) => {
    try {
      const result = await updateEventStatus(eventId, status);
      
      // Если updateEventStatus возвращает void, считаем это успехом
      if (result === undefined || result === null) {
        return;
      }
      
      // Если возвращает объект с success
      if (typeof result === 'object' && 'success' in result && !result.success) {
        throw new Error("Не удалось обновить статус");
      }
      
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      alert(`Ошибка обновления статуса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    }
  }, [updateEventStatus]);

  const handleSendMessage = useCallback((event: ScheduleEvent) => {
    const recipients = [];

    if (event.clientId && event.clientName) {
      recipients.push({
        id: event.clientId,
        name: event.clientName,
        role: "member",
        phone: "+7 (999) 123-45-67",
        email: "client@example.com",
      });
    }

    recipients.push({
      id: event.trainerId,
      name: event.trainerName,
      role: "trainer",
      phone: "+7 (999) 987-65-43",
      email: "trainer@fitaccess.ru",
    });

    pageState.openQuickMessage(recipients, {
      type: "event",
      id: event._id,
      title: event.title,
    });
  }, [pageState]);

  // Показываем загрузку только при первоначальной загрузке
  if (!events && !trainers) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка расписания...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <SchedulePageHeader
        isApiAvailable={isApiAvailable}
        isMutationLoading={isMutationLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onCreateEvent={handleCreateEvent}
      />

      {/* Notifications */}
      <ScheduleNotifications
        isApiAvailable={isApiAvailable}
        mutationError={mutationError}
        onClearError={clearError}
        isDevelopment={process.env.NODE_ENV === "development"}
        debugInfo={{
          eventsCount: events.length,
          trainersCount: trainers.length,
          clientsCount: clients.length,
          isMutationLoading,
          lastEvent: events[events.length - 1],
        }}
      />

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <ScheduleStats stats={stats} />
        </div>
      )}

      {/* Main Content */}
      <ScheduleTabsContainer
        events={events}
        trainers={trainers}
        stats={stats}
        pageState={pageState}
        onDeleteEvent={handleDeleteEvent}
        onStatusChange={handleStatusChange}
      />

      {/* Modals - Lazy Loaded */}
      {(pageState.showEventForm || pageState.showEventDetails || pageState.showQuickMessage) && (
        <Suspense fallback={null}>
          <LazyModals
            // EventForm props
            showEventForm={pageState.showEventForm}
            editingEvent={pageState.editingEvent}
            formInitialDate={pageState.formInitialDate}
            formInitialHour={pageState.formInitialHour}
            trainers={trainers}
            clients={clients}
            isApiAvailable={isApiAvailable}
            onCloseEventForm={pageState.closeEventForm}
            onSubmitEvent={pageState.editingEvent ? handleUpdateEventSubmit : handleCreateEventSubmit}
            // EventDetailsModal props
            showEventDetails={pageState.showEventDetails}
            selectedEvent={pageState.selectedEvent}
            onCloseEventDetails={pageState.closeEventDetails}
            onEditEvent={pageState.openEventForm}
            onDeleteEvent={handleDeleteEvent}
            onStatusChange={handleStatusChange}
            onSendMessage={handleSendMessage}
            userRole="super-admin"
            // QuickMessageModal props
            showQuickMessage={pageState.showQuickMessage}
            messageRecipients={pageState.messageRecipients}
            messageRelatedTo={pageState.messageRelatedTo}
            onCloseQuickMessage={pageState.closeQuickMessage}
          />
        </Suspense>
      )}

      {/* Loading Overlay */}
      {isMutationLoading && <LoadingOverlay />}
    </div>
  );
});

export default SchedulePage;
