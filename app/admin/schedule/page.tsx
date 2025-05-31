// app/admin/schedule/page.tsx - исправленная версия

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Plus,
  RefreshCw,
  Settings,
  Filter,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventForm } from "@/components/admin/schedule/EventForm";
import { EventDetails } from "@/components/admin/schedule/EventDetails";
import { CalendarView } from "@/components/admin/schedule/CalendarView";
import {
  useScheduleDataClean,
  CreateEventData,
  ScheduleEvent,
  useEvents,
  useTrainers,
  useClients,
} from "@/hooks/useScheduleData";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function SchedulePage() {
  // ✅ СОСТОЯНИЕ КОМПОНЕНТА
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  );
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>();
  const [formInitialHour, setFormInitialHour] = useState<number | undefined>();
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTrainer, setFilterTrainer] = useState<string>("all");
  const [forceRefresh, setForceRefresh] = useState(0);

  // ✅ ПОЛУЧАЕМ СЫРЫЕ ДАННЫЕ ДЛЯ ОТЛАДКИ
  const convexEvents = useEvents();
  const convexTrainers = useTrainers();
  const convexClients = useClients();

  // ✅ ИСПОЛЬЗУЕМ ОЧИЩЕННЫЙ ХУК
  const {
    events,
    trainers,
    clients,
    loading,
    error,
    dataSource,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    refreshApiData,
    retryConnection,
  } = useScheduleDataClean();

  // ✅ МУТАЦИЯ ДЛЯ СОЗДАНИЯ ТЕСТОВОГО ТРЕНЕРА
  const createUserMutation = useMutation(api.users.create);

  // ✅ СТАТИСТИКА
  const stats = {
    totalEvents: events.length,
    todayEvents: events.filter((e) => {
      const today = new Date().toISOString().split("T")[0];
      return e.startTime.startsWith(today);
    }).length,
    confirmedEvents: events.filter((e) => e.status === "confirmed").length,
    completedEvents: events.filter((e) => e.status === "completed").length,
  };

  // ✅ ФИЛЬТРАЦИЯ СОБЫТИЙ
  const filteredEvents = events.filter((event) => {
    if (filterStatus !== "all" && event.status !== filterStatus) return false;
    if (filterTrainer !== "all" && event.trainerId !== filterTrainer)
      return false;
    return true;
  });

  // ✅ ФУНКЦИЯ ПРИНУДИТЕЛЬНОГО ОБНОВЛЕНИЯ
  const forceComponentRefresh = useCallback(() => {
    console.log("🔄 Принудительное обновление компонента");
    setForceRefresh((prev) => prev + 1);
  }, []);

  // ✅ ФУНКЦИЯ ДЛЯ СОЗДАНИЯ ТЕСТОВОГО ТРЕНЕРА
  const handleCreateTestTrainer = async () => {
    try {
      console.log("🧪 Создание тестового тренера...");

      const testTrainerData = {
        email: `trainer-test-${Date.now()}@gym.com`,
        password: "test123456",
        name: `Тестовый Тренер ${new Date().getHours()}:${new Date().getMinutes()}`,
        role: "trainer",
        isActive: true,
        createdAt: Date.now(),
      };

      console.log("📤 Отправляем данные тренера:", testTrainerData);

      const trainerId = await createUserMutation(testTrainerData);

      console.log("✅ Тестовый тренер создан с ID:", trainerId);
      alert(`✅ Тестовый тренер "${testTrainerData.name}" создан успешно!`);

      // Принудительно обновляем данные
      setTimeout(() => {
        forceComponentRefresh();
        console.log("🔄 Принудительное обновление данных");
      }, 1000);
    } catch (error) {
      console.error("❌ Ошибка создания тестового тренера:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      alert(`❌ Ошибка создания тестового тренера: ${errorMessage}`);
    }
  };

  // ✅ ОБРАБОТЧИКИ СОБЫТИЙ
  const handleCreateEvent = async (data: CreateEventData) => {
    try {
      console.log("🆕 Создание события:", data);

      const trainer = trainers.find((t) => t.trainerId === data.trainerId);
      const client =
        data.clientId && data.clientId !== "no-client"
          ? clients.find((c) => c.id === data.clientId)
          : null;

      const eventData = {
        ...data,
        trainerName: trainer?.trainerName || "Неизвестный тренер",
        clientName: client?.name,
      };

      console.log("📤 Отправляем данные:", eventData);

      const eventId = await createEvent(eventData);

      console.log("✅ Событие создано с ID:", eventId);

      // ✅ ОБНОВЛЯЕМ ДАННЫЕ В ЗАВИСИМОСТИ ОТ ИСТОЧНИКА
      if (dataSource === "api") {
        await refreshApiData();
      } else if (dataSource === "convex") {
        setTimeout(() => {
          forceComponentRefresh();
          console.log("🔄 Принудительное обновление после Convex");
        }, 500);
      }

      alert(`✅ Событие "${data.title}" создано успешно! (${dataSource})`);
      handleCloseForm();
    } catch (error: unknown) {
      console.error("❌ Ошибка создания события:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      alert(`❌ Ошибка создания события: ${errorMessage}`);
    }
  };

  const handleUpdateEvent = async (data: CreateEventData) => {
    if (!editingEvent) return;

    try {
      console.log("✏️ Обновление события:", editingEvent._id);

      const trainer = trainers.find((t) => t.trainerId === data.trainerId);
      const client =
        data.clientId && data.clientId !== "no-client"
          ? clients.find((c) => c.id === data.clientId)
          : null;

      const updateData = {
        id: editingEvent._id,
        title: data.title,
        description: data.description,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        trainerId: data.trainerId,
        trainerName: trainer?.trainerName || editingEvent.trainerName,
        clientId: client?.id,
        clientName: client?.name,
        location: data.location,
        notes: data.notes,
        status: data.status || editingEvent.status,
      };

      await updateEvent(updateData);
      console.log("✅ Событие обновлено");

      alert(`✅ Событие "${data.title}" обновлено успешно! (${dataSource})`);
      handleCloseForm();

      if (dataSource === "api") {
        await refreshApiData();
      }
    } catch (error: unknown) {
      console.error("❌ Ошибка обновления события:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      alert(`❌ Ошибка обновления: ${errorMessage}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find((e) => e._id === eventId);
    const eventTitle = event?.title || "событие";

    if (!confirm(`Вы уверены, что хотите удалить "${eventTitle}"?`)) return;

    try {
      console.log("🗑️ Удаление события:", eventId);

      await deleteEvent(eventId);
      console.log("✅ Событие удалено");

      alert(`✅ Событие "${eventTitle}" удалено успешно! (${dataSource})`);

      if (showEventDetails) {
        setShowEventDetails(false);
        setSelectedEvent(null);
      }

      if (dataSource === "api") {
        await refreshApiData();
      }
    } catch (error: unknown) {
      console.error("❌ Ошибка удаления:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      alert(`❌ Ошибка удаления: ${errorMessage}`);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      console.log("🔄 Изменение статуса события:", eventId, newStatus);

      await updateEventStatus(eventId, newStatus);
      console.log("✅ Статус изменен");

      if (dataSource === "api") {
        await refreshApiData();
      }
    } catch (error: unknown) {
      console.error("❌ Ошибка изменения статуса:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      alert(`❌ Ошибка изменения статуса: ${errorMessage}`);
    }
  };

  // ✅ ОСНОВНАЯ ФУНКЦИЯ ОБРАБОТКИ ФОРМЫ
  const handleFormSubmit = async (data: CreateEventData) => {
    if (editingEvent) {
      await handleUpdateEvent(data);
    } else {
      await handleCreateEvent(data);
    }
  };

  // ✅ ФУНКЦИИ УПРАВЛЕНИЯ ФОРМОЙ
  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setFormInitialDate(undefined);
    setFormInitialHour(undefined);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEventDetails(false);
    setShowEventForm(true);
  };

  const handleDateClick = (date: Date, hour?: number) => {
    setFormInitialDate(date.toISOString().split("T")[0]);
    setFormInitialHour(hour);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  // ✅ ФУНКЦИЯ ОБНОВЛЕНИЯ ДАННЫХ
  const refreshData = async () => {
    try {
      console.log("🔄 Обновление данных...");

      if (dataSource === "api") {
        await refreshApiData();
      } else {
        // Для Convex данные обновляются автоматически
        console.log("✅ Данные актуальны");
      }
    } catch (error: unknown) {
      console.error("❌ Ошибка обновления данных:", error);
      alert("❌ Ошибка обновления данных");
    }
  };

  // ✅ ТЕСТОВАЯ ФУНКЦИЯ
  const handleTestAPI = async () => {
    if (trainers.length === 0) {
      alert("❌ Нет доступных тренеров для создания тестового события");
      return;
    }

    try {
      const testEvent = {
        title: `Тестовое событие ${new Date().getHours()}:${new Date().getMinutes()}`,
        type: "personal",
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        trainerId: trainers[0]?.trainerId || "test-trainer",
        description: "Тест создания события",
        location: "Тестовый зал",
        notes: "Тестовые заметки",
      };

      console.log("🧪 Тестовое создание события:", testEvent);
      const eventId = await createEvent(testEvent);
      console.log("✅ Тестовое событие создано:", eventId);
      alert(`✅ Тестовое событие создано! (${dataSource})`);

      if (dataSource === "api") {
        await refreshApiData();
      }
    } catch (error: unknown) {
      console.error("❌ Ошибка тестового создания:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      alert("❌ Ошибка: " + errorMessage);
    }
  };

  // ✅ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ О СОБЫТИЯХ
  useEffect(() => {
    console.log("📊 События обновились:", {
      count: events.length,
      dataSource,
      forceRefresh,
      events: events.map((e) => ({
        id: e._id,
        title: e.title,
        startTime: e.startTime,
        trainer: e.trainerName,
      })),
    });
  }, [events, dataSource, forceRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка расписания...</p>
        </div>
      </div>
    );
  }

  // ✅ ПОКАЗЫВАЕМ СООБЩЕНИЕ ЕСЛИ НЕТ ДАННЫХ
  if (dataSource === "unavailable") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            Нет доступных источников данных
          </h2>
          <p className="text-gray-600 mb-4">
            Не удалось подключиться к Convex или API. Проверьте подключение и
            настройки.
          </p>
          <Button onClick={retryConnection} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ ЗАГОЛОВОК И СТАТУС */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Расписание тренировок
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={
                dataSource === "convex"
                  ? "default"
                  : dataSource === "api"
                    ? "secondary"
                    : "destructive"
              }
            >
              {dataSource === "convex"
                ? "🟢 Convex"
                : dataSource === "api"
                  ? "🟡 API"
                  : "🔴 Недоступно"}
            </Badge>
            {error && (
              <Badge variant="destructive" className="text-xs">
                {error}
              </Badge>
            )}
          </div>
        </div>

        {/* ✅ КНОПКИ УПРАВЛЕНИЯ */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-2">Обновить</span>
          </Button>

          <Button
            variant="outline"
            onClick={forceComponentRefresh}
            size="sm"
            className="bg-yellow-50 hover:bg-yellow-100"
          >
            🔄 <span className="hidden sm:inline ml-1">Перезагрузить</span>
          </Button>

          {trainers.length > 0 && (
            <Button
              onClick={handleTestAPI}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
              size="sm"
            >
              🧪 <span className="hidden sm:inline ml-1">Тест</span>
            </Button>
          )}

          {trainers.length === 0 && (
            <Button
              onClick={handleCreateTestTrainer}
              className="bg-orange-600 hover:bg-orange-700"
              size="sm"
            >
              👨‍🏫 <span className="hidden sm:inline ml-1">Создать тренера</span>
            </Button>
          )}

          <Button
            onClick={() => {
              if (trainers.length === 0) {
                alert(
                  "❌ Нет доступных тренеров. Сначала добавьте тренеров в систему."
                );
                return;
              }
              setEditingEvent(null);
              setFormInitialDate(undefined);
              setFormInitialHour(undefined);
              setShowEventForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={trainers.length === 0}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Создать</span>
          </Button>
        </div>
      </div>

      {/* ✅ ПРЕДУПРЕЖДЕНИЕ ЕСЛИ НЕТ ТРЕНЕРОВ */}
      {trainers.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p>
                <strong>Внимание:</strong> В системе нет тренеров. Добавьте
                тренеров в разделе "Тренеры" для создания событий.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ СТАТИСТИКА */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего событий</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayEvents} сегодня
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayEvents}</div>
            <p className="text-xs text-muted-foreground">событий на сегодня</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Подтверждено</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedEvents}</div>
            <p className="text-xs text-muted-foreground">
              из {stats.totalEvents} событий
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedEvents}</div>
            <p className="text-xs text-muted-foreground">
              выполненных тренировок
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ ФИЛЬТРЫ */}
      {(events.length > 0 || trainers.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Статус</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Все статусы</option>
                  <option value="scheduled">Запланировано</option>
                  <option value="confirmed">Подтверждено</option>
                  <option value="completed">Завершено</option>
                  <option value="cancelled">Отменено</option>
                  <option value="no-show">Не явился</option>
                </select>
              </div>

              {trainers.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Тренер</label>
                  <select
                    value={filterTrainer}
                    onChange={(e) => setFilterTrainer(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">Все тренеры</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.trainerId} value={trainer.trainerId}>
                        {trainer.trainerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Вид</label>
                <div className="flex gap-2">
                  {(["month", "week", "day"] as const).map((view) => (
                    <Button
                      key={view}
                      variant={currentView === view ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentView(view)}
                    >
                      {view === "month"
                        ? "Месяц"
                        : view === "week"
                          ? "Неделя"
                          : "День"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ КАЛЕНДАРЬ */}
      <Card>
        <CardHeader>
          <CardTitle>Календарь событий</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 && trainers.length > 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Событий пока нет. Создайте первое событие!</p>
            </div>
          ) : (
            <CalendarView
              events={filteredEvents}
              trainers={trainers}
              clients={clients}
              currentView={currentView}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventStatusChange={handleStatusChange}
            />
          )}
        </CardContent>
      </Card>

      {/* ✅ МОДАЛЬНЫЕ ОКНА */}
      {showEventForm && (
        <EventForm
          isOpen={showEventForm}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingEvent}
          initialDate={formInitialDate}
          initialHour={formInitialHour}
          trainers={trainers}
          clients={clients}
          isEditing={!!editingEvent}
        />
      )}

      {showEventDetails && selectedEvent && (
        <EventDetails
          isOpen={showEventDetails}
          onClose={() => {
            setShowEventDetails(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          trainers={trainers}
          clients={clients}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
