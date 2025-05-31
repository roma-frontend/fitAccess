// app/admin/schedule/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  List,
  Users,
  Plus,
  RefreshCw,
  Download,
  Filter,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

// Импорт компонентов
import { ScheduleStats } from "@/components/admin/schedule/ScheduleStats";
import { CalendarView } from "@/components/admin/schedule/CalendarView";
import { EventsList } from "@/components/admin/schedule/EventsList";
import { EventForm } from "@/components/admin/schedule/EventForm";
import { TrainerWorkload } from "@/components/admin/schedule/TrainerWorkload";
import { EventDetailsModal } from "@/components/admin/schedule/EventDetailsModal";
import { QuickActions } from "@/components/admin/schedule/QuickActions";
import {
  ScheduleEvent,
  ScheduleStats as ScheduleStatsType,
  TrainerSchedule,
  CreateEventData,
} from "@/components/admin/schedule/types";
import { QuickMessageModal } from "@/components/admin/messaging/QuickMessageModal";
import { useRouter } from "next/navigation";
import {
  AdminSecondHeader,
  MobileActionGroup,
  ResponsiveButton,
} from "@/components/admin/users/AdminSecondHeader";
import {
  useClientsWithFallback,
  useScheduleAnalytics,
  useScheduleApiAvailability,
  useScheduleMutations,
  useScheduleStatsWithFallback,
  useScheduleWithFallback,
  useTrainersWithFallback,
} from "@/hooks/useSchedule";

export default function SchedulePage() {
  // Хуки для получения данных
  const events = useScheduleWithFallback();
  const stats = useScheduleStatsWithFallback("month");
  const trainersData = useTrainersWithFallback();
  const clients = useClientsWithFallback();
  const analytics = useScheduleAnalytics("month");
  const { isAvailable: isApiAvailable, isLoading: isApiLoading } =
    useScheduleApiAvailability();

  // Хуки для мутаций
  const {
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    isLoading: isMutationLoading,
    error: mutationError,
    clearError,
  } = useScheduleMutations();

  // Локальное состояние
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  );
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<Date | undefined>();
  const [formInitialHour, setFormInitialHour] = useState<number | undefined>();
  const [userRole] = useState("super-admin");
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [messageRecipients, setMessageRecipients] = useState<any[]>([]);
  const [messageRelatedTo, setMessageRelatedTo] = useState<any>(null);
  const router = useRouter();

  // Преобразуем данные тренеров в нужный формат
  const trainers: TrainerSchedule[] = trainersData.map((trainer) => ({
    trainerId: trainer.id,
    trainerName: trainer.name,
    trainerRole: trainer.role,
    events: events.filter((e) => e.trainerId === trainer.id),
    workingHours: {
      start: "09:00",
      end: "18:00",
      days: [1, 2, 3, 4, 5],
    },
  }));

  // Обработка ошибок мутаций
  useEffect(() => {
    if (mutationError) {
      console.error("Ошибка операции:", mutationError);
      // Можно показать toast или другое уведомление
      setTimeout(() => clearError(), 5000);
    }
  }, [mutationError, clearError]);

  // Отладка изменений событий
  useEffect(() => {
    console.log("События обновились:", events);
    console.log("API доступен:", isApiAvailable);
  }, [events, isApiAvailable]);

  const handleSendQuickMessage = (event: ScheduleEvent) => {
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

    setMessageRecipients(recipients);
    setMessageRelatedTo({
      type: "event",
      id: event._id,
      title: event.title,
    });
    setShowQuickMessage(true);
  };

const handleCreateEvent = async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
  try {
    console.log("=== НАЧАЛО СОЗДАНИЯ СОБЫТИЯ ===");
    console.log("1. Исходные данные из формы:", JSON.stringify(data, null, 2));
    console.log("2. trainerId из формы:", data.trainerId);
    console.log("3. Тип trainerId:", typeof data.trainerId);
    console.log("4. clientId из формы:", data.clientId);

    // Очищаем clientId если это специальное значение
    const cleanedData = {
      ...data,
      clientId: data.clientId === "no-client" ? undefined : data.clientId,
    };

    console.log("5. Очищенные данные:", JSON.stringify(cleanedData, null, 2));
    console.log("6. trainerId после очистки:", cleanedData.trainerId);
    console.log("7. clientId после очистки:", cleanedData.clientId);

    // Дополнительная валидация перед отправкой
    if (!cleanedData.trainerId) {
      throw new Error("trainerId обязателен");
    }

    if (typeof cleanedData.trainerId !== 'string') {
      console.warn("trainerId не является строкой, приводим к строке");
      cleanedData.trainerId = String(cleanedData.trainerId);
    }

    console.log("8. Финальные данные для createEvent:", JSON.stringify(cleanedData, null, 2));

    // Используем хук для создания события
    const result = await createEvent(cleanedData);
    
    if (result.success) {
      console.log("=== СОБЫТИЕ СОЗДАНО УСПЕШНО ===");
      console.log("ID созданного события:", result.id);
      
      // Закрываем форму
      setShowEventForm(false);
      setEditingEvent(null);
      setFormInitialDate(undefined);
      setFormInitialHour(undefined);
      
      return result; // ДОБАВЛЕНО: возвращаем результат
    } else {
      console.error("Создание события вернуло success: false");
      throw new Error("Не удалось создать событие");
    }
  } catch (error) {
    console.error("=== ОШИБКА СОЗДАНИЯ СОБЫТИЯ ===");
    console.error("Тип ошибки:", typeof error);
    console.error("Ошибка:", error);
    
    if (error instanceof Error) {
      console.error("Сообщение ошибки:", error.message);
      console.error("Стек ошибки:", error.stack);
    }
    
    // Показать ошибку пользователю
    alert(`Ошибка создания события: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    
    // Пробрасываем ошибку дальше
    throw error;
  }
};

const handleUpdateEvent = async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
  if (!editingEvent) {
    throw new Error("Нет события для редактирования");
  }

  try {
    console.log("Обновление события:", editingEvent._id, "с данными:", data);

    // Очищаем clientId если это специальное значение
    const cleanedData = {
      ...data,
      clientId: data.clientId === "no-client" ? undefined : data.clientId,
    };

    // Используем хук для обновления события
    const result = await updateEvent(editingEvent._id, cleanedData);
    
    if (result.success) {
      console.log("Событие обновлено успешно");
      setEditingEvent(null);
      setShowEventForm(false);
      setFormInitialDate(undefined);
      setFormInitialHour(undefined);
      
      return result; // ДОБАВЛЕНО: возвращаем результат
    } else {
      throw new Error("Не удалось обновить событие");
    }
  } catch (error) {
    console.error("Ошибка обновления события:", error);
    alert(`Ошибка обновления события: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    throw error;
  }
};

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это событие?")) return;

    try {
      const result = await deleteEvent(eventId);

      if (result.success) {
        console.log("Событие удалено успешно");
        // Закрываем модальные окна если они открыты
        setShowEventDetails(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      alert(
        `Ошибка удаления события: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
    }
  };

  const handleStatusChange = async (
    eventId: string,
    status: ScheduleEvent["status"]
  ) => {
    try {
      const result = await updateEventStatus(eventId, status);

      if (result.success) {
        console.log("Статус события обновлен");
      }
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      alert(
        `Ошибка обновления статуса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
    }
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleViewEventDetails = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCreateEventFromCalendar = (date: Date, hour: number) => {
    setFormInitialDate(date);
    setFormInitialHour(hour);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setFormInitialDate(undefined);
    setFormInitialHour(undefined);
  };

  const handleBulkAction = async (action: string, eventIds: string[]) => {
    switch (action) {
      case "confirm":
        try {
          await Promise.all(
            eventIds.map((id) => updateEventStatus(id, "confirmed"))
          );
          console.log(`${eventIds.length} событий подтверждено`);
        } catch (error) {
          console.error("Ошибка массового подтверждения:", error);
        }
        break;

      case "complete":
        try {
          await Promise.all(
            eventIds.map((id) => updateEventStatus(id, "completed"))
          );
          console.log(`${eventIds.length} событий завершено`);
        } catch (error) {
          console.error("Ошибка массового завершения:", error);
        }
        break;

      case "export":
        exportSchedule();
        break;
    }
  };

  const exportSchedule = () => {
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
      [
        "Название",
        "Тип",
        "Тренер",
        "Клиент",
        "Начало",
        "Конец",
        "Статус",
        "Место",
      ],
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
  };

  // Показываем загрузку только если API загружается
  if (isApiLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Проверка API расписания...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <AdminSecondHeader
        title="Расписание"
        description={`Планирование событий${!isApiAvailable ? " (тестовые данные)" : ""}`}
        icon={Calendar}
        actions={
          <MobileActionGroup>
            <ResponsiveButton
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isMutationLoading}
              hideTextOnMobile
            >
              <RefreshCw
                className={`h-4 w-4 ${isMutationLoading ? "animate-spin" : ""}`}
              />
              <span className="sm:ml-2">Обновить</span>
            </ResponsiveButton>

            <ResponsiveButton
              variant="outline"
              onClick={exportSchedule}
              hideTextOnMobile
            >
              <Download className="h-4 w-4" />
              <span className="sm:ml-2">Экспорт</span>
            </ResponsiveButton>

            <ResponsiveButton
              onClick={() => {
                setEditingEvent(null);
                setFormInitialDate(undefined);
                setFormInitialHour(undefined);
                setShowEventForm(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isMutationLoading}
            >
              <Plus className="h-4 w-4" />
              <span className="sm:ml-2">Создать</span>
            </ResponsiveButton>
          </MobileActionGroup>
        }
      />

      {/* API Status Banner */}
      {!isApiAvailable && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-amber-800 font-medium">
              Режим разработки: используются тестовые данные
            </span>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            API расписания недоступен. Все изменения временные и не сохраняются.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {mutationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-800 font-medium">Ошибка операции</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
          <p className="text-red-700 text-sm mt-1">{mutationError}</p>
        </div>
      )}

      {/* Отладочная панель - только для разработки */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">
            Отладочная информация:
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>API доступен: {isApiAvailable ? "Да" : "Нет"}</div>
            <div>Всего событий в состоянии: {events.length}</div>
            <div>Всего тренеров: {trainersData.length}</div>
            <div>Всего клиентов: {clients.length}</div>
            <div>Загрузка мутаций: {isMutationLoading ? "Да" : "Нет"}</div>
            <div>Последнее обновление: {new Date().toLocaleTimeString()}</div>
            {events.length > 0 && (
              <div>
                <div>Последнее событие: {events[events.length - 1]?.title}</div>
                <div>ID: {events[events.length - 1]?._id}</div>
                <div>Время: {events[events.length - 1]?.startTime}</div>
              </div>
            )}
          </div>
          <div className="flex space-x-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => console.log("Текущие события:", events)}
            >
              События в консоль
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => console.log("Статистика:", stats)}
            >
              Статистика в консоль
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => console.log("Аналитика:", analytics)}
            >
              Аналитика в консоль
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <ScheduleStats stats={stats} />
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Календарь
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Список событий
          </TabsTrigger>
          <TabsTrigger value="trainers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Загрузка тренеров
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Быстрые действия
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <CalendarView
            events={events}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEventFromCalendar}
            onEditEvent={handleEventClick}
            onDeleteEvent={handleDeleteEvent}
            onViewEventDetails={handleViewEventDetails}
            userRole={userRole}
          />
        </TabsContent>

        {/* Events List */}
        <TabsContent value="list">
          <EventsList
            events={events}
            onEdit={handleEventClick}
            onDelete={handleDeleteEvent}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        {/* Trainer Workload */}
        <TabsContent value="trainers">
          <TrainerWorkload
            trainers={trainers}
            events={events}
            onEventClick={handleViewEventDetails}
          />
        </TabsContent>

        {/* Quick Actions */}
        <TabsContent value="quick">
          {stats && (
            <QuickActions
              events={events}
              stats={stats}
              onBulkAction={handleBulkAction}
            />
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Analytics with Real Data */}
            {analytics && (
              <>
                {/* Overview Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.overview.totalEvents}
                    </div>
                    <div className="text-sm text-gray-600">Всего событий</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.overview.activeTrainers}
                    </div>
                    <div className="text-sm text-gray-600">
                      Активных тренеров
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.overview.utilizationRate}%
                    </div>
                    <div className="text-sm text-gray-600">Загрузка</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-emerald-600">
                      {analytics.overview.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600">Завершено</div>
                  </div>
                </div>

                {/* Trends */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Тренды</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        События на этой неделе
                      </span>
                      <span className="font-semibold">
                        {analytics.trends.eventsThisWeek}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        События на прошлой неделе
                      </span>
                      <span className="font-semibold">
                        {analytics.trends.eventsLastWeek}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Рост</span>
                      <span
                        className={`font-semibold ${
                          analytics.trends.growthRate >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {analytics.trends.growthRate >= 0 ? "+" : ""}
                        {analytics.trends.growthRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Trainers */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Топ тренеров</h3>
                  <div className="space-y-3">
                    {analytics.performance.topTrainers.map((trainer, index) => (
                      <div
                        key={trainer.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">
                            {trainer.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {trainer.eventCount} событий
                          </div>
                          <div className="text-xs text-gray-500">
                            {trainer.completionRate}% завершено
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Events by Type */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">События по типам</h3>
              <div className="space-y-3">
                {Object.entries(stats?.byType || {}).map(([type, count]) => {
                  const typeNames = {
                    training: "Тренировки",
                    consultation: "Консультации",
                    group: "Групповые занятия",
                    meeting: "Встречи",
                    break: "Перерывы",
                    other: "Другое",
                  };

                  const total = Object.values(stats?.byType || {}).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage =
                    total > 0 ? ((count / total) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {(typeNames as Record<string, string>)[type] || type}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {count}
                        </span>
                        <span className="text-sm text-gray-500 w-12">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events by Trainer */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">
                События по тренерам
              </h3>
              <div className="space-y-3">
                {trainers.map((trainer) => {
                  const trainerStats = stats?.byTrainer.find(
                    (t) => t.trainerId === trainer.trainerId
                  );
                  const trainerEvents = trainerStats?.eventCount || 0;
                  const maxEvents = Math.max(
                    ...(stats?.byTrainer.map((t) => t.eventCount) || [1])
                  );
                  const percentage =
                    maxEvents > 0
                      ? ((trainerEvents / maxEvents) * 100).toFixed(1)
                      : "0";

                  return (
                    <div
                      key={trainer.trainerId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {trainer.trainerName}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {trainerEvents}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Busy Hours Chart */}
            {analytics && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Загруженные часы</h3>
                <div className="space-y-2">
                  {analytics.performance.busyHours.map((hour) => {
                    const maxEvents = Math.max(
                      ...analytics.performance.busyHours.map(
                        (h) => h.eventCount
                      )
                    );
                    const percentage =
                      maxEvents > 0 ? (hour.eventCount / maxEvents) * 100 : 0;

                    return (
                      <div
                        key={hour.hour}
                        className="flex items-center space-x-3"
                      >
                        <span className="text-sm font-medium w-12">
                          {hour.hour}:00
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {hour.eventCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Event Types */}
            {analytics && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  Популярные типы событий
                </h3>
                <div className="space-y-3">
                  {analytics.performance.popularEventTypes.map(
                    (eventType, index) => (
                      <div
                        key={eventType.type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-semibold text-indigo-600">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">
                            {eventType.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {eventType.count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {eventType.percentage}%
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Weekly Schedule Overview */}
            <div className="bg-white p-6 rounded-lg border lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Обзор недели</h3>
              <div className="grid grid-cols-7 gap-2">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(
                  (day, index) => {
                    const dayEvents = events.filter((event) => {
                      const eventDate = new Date(event.startTime);
                      const dayOfWeek = eventDate.getDay();
                      return dayOfWeek === (index + 1) % 7;
                    }).length;

                    return (
                      <div
                        key={day}
                        className="text-center p-3 bg-gray-50 rounded"
                      >
                        <div className="text-sm font-medium text-gray-700">
                          {day}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {dayEvents}
                        </div>
                        <div className="text-xs text-gray-500">событий</div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-lg border lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Распределение по статусам
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  "scheduled",
                  "confirmed",
                  "completed",
                  "cancelled",
                  "no-show",
                ].map((status) => {
                  const statusEvents = events.filter(
                    (e) => e.status === status
                  ).length;
                  const statusNames = {
                    scheduled: "Запланировано",
                    confirmed: "Подтверждено",
                    completed: "Завершено",
                    cancelled: "Отменено",
                    "no-show": "Не явился",
                  };
                  const statusColors = {
                    scheduled: "text-blue-600 bg-blue-50",
                    confirmed: "text-green-600 bg-green-50",
                    completed: "text-emerald-600 bg-emerald-50",
                    cancelled: "text-red-600 bg-red-50",
                    "no-show": "text-gray-600 bg-gray-50",
                  };

                  return (
                    <div
                      key={status}
                      className={`text-center p-4 rounded-lg ${statusColors[status as keyof typeof statusColors]}`}
                    >
                      <div className="text-2xl font-bold">{statusEvents}</div>
                      <div className="text-xs">
                        {statusNames[status as keyof typeof statusNames]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <EventForm
        event={editingEvent}
        isOpen={showEventForm}
        onClose={handleCloseForm}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        trainers={trainersData}
        clients={clients}
        initialDate={formInitialDate}
        initialHour={formInitialHour}
        isApiAvailable={isApiAvailable}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEventClick}
        onDelete={handleDeleteEvent}
        onStatusChange={handleStatusChange}
        onSendMessage={handleSendQuickMessage}
        userRole={userRole}
      />

      {/* Quick Message Modal */}
      <QuickMessageModal
        isOpen={showQuickMessage}
        onClose={() => {
          setShowQuickMessage(false);
          setMessageRecipients([]);
          setMessageRelatedTo(null);
        }}
        recipients={messageRecipients}
        relatedTo={messageRelatedTo}
        defaultSubject={
          messageRelatedTo ? `По поводу: ${messageRelatedTo.title}` : ""
        }
      />

      {/* Loading Overlay */}
      {isMutationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Обработка запроса...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
