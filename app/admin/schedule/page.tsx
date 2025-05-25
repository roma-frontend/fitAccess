// app/admin/schedule/page.tsx (полная исправленная версия)
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

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [stats, setStats] = useState<ScheduleStatsType | null>(null);
  const [trainers, setTrainers] = useState<TrainerSchedule[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadScheduleData();
  }, []);

  // Отладка изменений событий
  useEffect(() => {
    console.log('События обновились на главной странице:', events);
  }, [events]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      // Имитация API запросов - замените на реальные
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Моковые данные
      const mockEvents: ScheduleEvent[] = [
        {
          _id: "1",
          title: "Персональная тренировка",
          description:
            "Силовая тренировка для начинающих. Работа с базовыми упражнениями, изучение техники выполнения.",
          type: "training",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
          endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          trainerId: "trainer1",
          trainerName: "Иван Петров",
          clientId: "client1",
          clientName: "Анна Смирнова",
          status: "confirmed",
          location: "Зал 1",
          notes:
            "Первая тренировка, нужно провести инструктаж по технике безопасности",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        },
        {
          _id: "2",
          title: "Групповая кардио тренировка",
          description: "Интенсивная кардио тренировка для группы",
          type: "training",
          startTime: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endTime: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
          ).toISOString(),
          trainerId: "trainer2",
          trainerName: "Мария Иванова",
          status: "scheduled",
          location: "Зал 2",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        },
        {
          _id: "3",
          title: "Консультация по питанию",
          description: "Составление индивидуального плана питания",
          type: "consultation",
          startTime: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endTime: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
          ).toISOString(),
          trainerId: "trainer3",
          trainerName: "Алексей Сидоров",
          clientId: "client2",
          clientName: "Петр Козлов",
          status: "scheduled",
          location: "Кабинет консультаций",
          notes: "Клиент хочет набрать мышечную массу",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        },
        {
          _id: "4",
          title: "Планерка тренеров",
          description: "Еженедельная встреча команды тренеров",
          type: "meeting",
          startTime: new Date(
            Date.now() + 4 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endTime: new Date(
            Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
          ).toISOString(),
          trainerId: "trainer1",
          trainerName: "Иван Петров",
          status: "confirmed",
          location: "Конференц-зал",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        },
      ];

      const mockStats: ScheduleStatsType = {
        totalEvents: 156,
        todayEvents: 12,
        upcomingEvents: 45,
        completedEvents: 89,
        cancelledEvents: 10,
        byTrainer: {
          trainer1: 45,
          trainer2: 38,
          trainer3: 32,
        },
        byType: {
          training: 89,
          consultation: 34,
          meeting: 23,
          break: 10,
        },
        utilizationRate: 78,
      };

      const mockTrainers: TrainerSchedule[] = [
        {
          trainerId: "trainer1",
          trainerName: "Иван Петров",
          trainerRole: "Персональный тренер",
          events: mockEvents.filter((e) => e.trainerId === "trainer1"),
          workingHours: {
            start: "09:00",
            end: "18:00",
            days: [1, 2, 3, 4, 5], // Пн-Пт
          },
        },
        {
          trainerId: "trainer2",
          trainerName: "Мария Иванова",
          trainerRole: "Групповой тренер",
          events: mockEvents.filter((e) => e.trainerId === "trainer2"),
          workingHours: {
            start: "10:00",
            end: "19:00",
            days: [1, 2, 3, 4, 5, 6], // Пн-Сб
          },
        },
        {
          trainerId: "trainer3",
          trainerName: "Алексей Сидоров",
          trainerRole: "Консультант по питанию",
          events: mockEvents.filter((e) => e.trainerId === "trainer3"),
          workingHours: {
            start: "11:00",
            end: "17:00",
            days: [1, 2, 3, 4, 5], // Пн-Пт
          },
        },
      ];

      const mockClients = [
        { id: "client1", name: "Анна Смирнова" },
        { id: "client2", name: "Петр Козлов" },
        { id: "client3", name: "Елена Васильева" },
        { id: "client4", name: "Дмитрий Морозов" },
      ];

      setEvents(mockEvents);
      setStats(mockStats);
      setTrainers(mockTrainers);
      setClients(mockClients);
    } catch (error) {
      console.error("Ошибка загрузки расписания:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateEvent = async (data: CreateEventData) => {
    try {
      console.log("Создание события с данными:", data);

      // Очищаем clientId если это специальное значение
      const cleanedData = {
        ...data,
        clientId: data.clientId === "no-client" ? undefined : data.clientId,
      };

      const newEvent: ScheduleEvent = {
        _id: Date.now().toString(),
        ...cleanedData,
        trainerName:
          trainers.find((t) => t.trainerId === cleanedData.trainerId)
            ?.trainerName || "",
        clientName: cleanedData.clientId
          ? clients.find((c) => c.id === cleanedData.clientId)?.name
          : undefined,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        createdBy: "current-user",
      };

      console.log("Новое событие:", newEvent);

      setEvents((prev) => {
        const updated = [...prev, newEvent];
        console.log("Обновленный список событий:", updated);
        return updated;
      });

      // Обновляем статистику
      if (stats) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalEvents: prev.totalEvents + 1,
                upcomingEvents: prev.upcomingEvents + 1,
                byType: {
                  ...prev.byType,
                  [newEvent.type]: (prev.byType[newEvent.type] || 0) + 1,
                },
                byTrainer: {
                  ...prev.byTrainer,
                  [newEvent.trainerId]:
                    (prev.byTrainer[newEvent.trainerId] || 0) + 1,
                },
              }
            : null
        );
      }

      alert("Событие создано успешно!");
    } catch (error) {
      console.error("Ошибка создания события:", error);
      alert("Ошибка создания события");
    }
  };

  const handleUpdateEvent = async (data: CreateEventData) => {
    if (!editingEvent) return;

    try {
      console.log("Обновление события:", editingEvent._id, "с данными:", data);

      // Очищаем clientId если это специальное значение
      const cleanedData = {
        ...data,
        clientId: data.clientId === "no-client" ? undefined : data.clientId,
      };

      const updatedEvent: ScheduleEvent = {
        ...editingEvent,
        ...cleanedData,
        trainerName:
          trainers.find((t) => t.trainerId === cleanedData.trainerId)
            ?.trainerName || "",
        clientName: cleanedData.clientId
          ? clients.find((c) => c.id === cleanedData.clientId)?.name
          : undefined,
        updatedAt: new Date().toISOString(),
      };

      console.log("Обновленное событие:", updatedEvent);

      setEvents((prev) => {
        const updated = prev.map((e) =>
          e._id === editingEvent._id ? updatedEvent : e
        );
        console.log(
          "Обновленный список событий после редактирования:",
          updated
        );
        return updated;
      });

      setEditingEvent(null);
      alert("Событие обновлено успешно!");
    } catch (error) {
      console.error("Ошибка обновления события:", error);
      alert("Ошибка обновления события");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это событие?")) return;

    try {
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      alert("Событие удалено успешно!");
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      alert("Ошибка удаления события");
    }
  };

  const handleStatusChange = async (
    eventId: string,
    status: ScheduleEvent["status"]
  ) => {
    try {
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? { ...e, status, updatedAt: new Date().toISOString() }
            : e
        )
      );
      alert("Статус события обновлен!");
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      alert("Ошибка обновления статуса");
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
        setEvents((prev) =>
          prev.map((event) =>
            eventIds.includes(event._id)
              ? {
                  ...event,
                  status: "confirmed" as const,
                  updatedAt: new Date().toISOString(),
                }
              : event
          )
        );
        alert(`${eventIds.length} событий подтверждено`);
        break;

      case "complete":
        setEvents((prev) =>
          prev.map((event) =>
            eventIds.includes(event._id)
              ? {
                  ...event,
                  status: "completed" as const,
                  updatedAt: new Date().toISOString(),
                }
              : event
          )
        );
        alert(`${eventIds.length} событий завершено`);
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

  if (loading) {
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
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Управление расписанием
            </h1>
            <p className="text-gray-600">
              Планирование и контроль всех событий
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={loadScheduleData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Обновить
            </Button>
            <Button variant="outline" onClick={exportSchedule}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button
              onClick={() => {
                setEditingEvent(null);
                setFormInitialDate(undefined);
                setFormInitialHour(undefined);
                setShowEventForm(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать событие
            </Button>
          </div>
        </div>
      </div>

      {/* Отладочная панель - только для разработки */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Отладочная информация:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Всего событий в состоянии: {events.length}</div>
            <div>Последнее обновление: {new Date().toLocaleTimeString()}</div>
            {events.length > 0 && (
              <div>
                <div>Последнее событие: {events[events.length - 1]?.title}</div>
                <div>ID: {events[events.length - 1]?._id}</div>
                <div>Время: {events[events.length - 1]?.startTime}</div>
              </div>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => console.log('Текущие события:', events)}
            className="mt-2"
          >
            Вывести события в консоль
          </Button>
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
            {/* Events by Type */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">События по типам</h3>
              <div className="space-y-3">
                {Object.entries(stats?.byType || {}).map(([type, count]) => {
                  const typeNames = {
                    training: "Тренировки",
                    consultation: "Консультации",
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
                        {typeNames[type as keyof typeof typeNames]}
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
                  const trainerEvents = events.filter(
                    (e) => e.trainerId === trainer.trainerId
                  ).length;
                  const maxEvents = Math.max(
                    ...trainers.map(
                      (t) =>
                        events.filter((e) => e.trainerId === t.trainerId).length
                    )
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
        trainers={trainers.map((t) => ({
          id: t.trainerId,
          name: t.trainerName,
          role: t.trainerRole,
        }))}
        clients={clients}
        initialDate={formInitialDate}
        initialHour={formInitialHour}
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
    </div>
  );
}


