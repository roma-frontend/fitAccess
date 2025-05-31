// components/admin/schedule/EventForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { ScheduleEvent, CreateEventData } from "./types";

interface EventFormProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData) => Promise<{ success: boolean; id?: string }>; // Изменили тип возврата
  trainers: Array<{ id: string; name: string; role: string }>;
  clients: Array<{ id: string; name: string }>;
  initialDate?: Date;
  initialHour?: number;
  isApiAvailable?: boolean;
}

export function EventForm({
  event,
  isOpen,
  onClose,
  onSubmit,
  trainers,
  clients,
  initialDate,
  initialHour,
  isApiAvailable = true, // По умолчанию считаем, что API доступен
}: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    type: "training",
    startTime: "",
    endTime: "",
    trainerId: "",
    clientId: "",
    location: "",
    notes: "",
    recurring: undefined,
  });
  const [isRecurring, setIsRecurring] = useState(false);

  // Фильтруем тренеров и клиентов
  const realTrainers = trainers.filter(
    (trainer) => !trainer.id.startsWith("mock-")
  );
  const realClients = clients.filter(
    (client) => !client.id.startsWith("mock-")
  );

  // Используем соответствующие списки в зависимости от доступности API
  const availableTrainers = isApiAvailable ? realTrainers : trainers;
  const availableClients = isApiAvailable ? realClients : clients;

  console.log("EventForm render:", {
    isApiAvailable,
    totalTrainers: trainers.length,
    realTrainers: realTrainers.length,
    availableTrainers: availableTrainers.length,
    trainers: trainers.map((t) => ({
      id: t.id,
      name: t.name,
      isMock: t.id.startsWith("mock-"),
    })),
  });

useEffect(() => {
  if (event) {
    // Редактирование существующего события
    setFormData({
      title: event.title,
      description: event.description || "",
      type: event.type,
      startTime: event.startTime.slice(0, 16),
      endTime: event.endTime.slice(0, 16),
      trainerId: event.trainerId || "no-trainer", // Изменено: добавлен fallback
      clientId: event.clientId || "no-client",
      location: event.location || "",
      notes: event.notes || "",
      recurring: event.recurring
        ? {
            pattern: event.recurring.pattern,
            interval: event.recurring.interval,
            endDate: event.recurring.endDate,
            daysOfWeek: event.recurring.daysOfWeek,
          }
        : undefined,
    });
    setIsRecurring(!!event.recurring);
  } else if (initialDate && initialHour !== undefined) {
    // Создание нового события с предустановленным временем
    const startDate = new Date(initialDate);
    startDate.setHours(initialHour, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(initialHour + 1, 0, 0, 0);

    setFormData({
      title: "",
      description: "",
      type: "training",
      startTime: startDate.toISOString().slice(0, 16),
      endTime: endDate.toISOString().slice(0, 16),
      trainerId: "no-trainer", // Изменено: используем специальное значение вместо пустой строки
      clientId: "no-client",
      location: "",
      notes: "",
      recurring: undefined,
    });
    setIsRecurring(false);
  } else {
    // Создание нового события
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    setFormData({
      title: "",
      description: "",
      type: "training",
      startTime: now.toISOString().slice(0, 16),
      endTime: oneHourLater.toISOString().slice(0, 16),
      trainerId: "no-trainer", // Изменено: используем специальное значение вместо пустой строки
      clientId: "no-client",
      location: "",
      notes: "",
      recurring: undefined,
    });
    setIsRecurring(false);
  }
}, [event, initialDate, initialHour]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("=== ОТПРАВКА ФОРМЫ ===");
  console.log("Данные формы:", formData);
  console.log("Выбранный тренер ID:", formData.trainerId);
  console.log("Доступные тренеры:", availableTrainers);

  if (
    !formData.title ||
    !formData.startTime ||
    !formData.endTime ||
    !formData.trainerId ||
    formData.trainerId === "no-trainer"
  ) {
    alert("Пожалуйста, заполните все обязательные поля и выберите тренера");
    return;
  }

  // Дополнительная проверка тренера
  const selectedTrainer = availableTrainers.find(t => t.id === formData.trainerId);
  if (!selectedTrainer) {
    console.error("=== ОШИБКА ТРЕНЕРА ===");
    console.error("Выбранный ID:", formData.trainerId);
    console.error("Доступные тренеры:", availableTrainers.map(t => ({ id: t.id, name: t.name })));
    alert("Выбранный тренер не найден в списке доступных тренеров");
    return;
  }

  console.log("✅ Тренер найден:", selectedTrainer);

  const startTime = new Date(formData.startTime);
  const endTime = new Date(formData.endTime);

  if (endTime <= startTime) {
    alert("Время окончания должно быть позже времени начала");
    return;
  }

  setLoading(true);
  try {
    const submitData = {
      ...formData,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      clientId: formData.clientId === "no-client" ? undefined : formData.clientId,
      recurring: isRecurring ? formData.recurring : undefined,
    };

    console.log("=== ФИНАЛЬНЫЕ ДАННЫЕ ДЛЯ ОТПРАВКИ ===");
    console.log(JSON.stringify(submitData, null, 2));

    const result = await onSubmit(submitData);
    console.log("=== РЕЗУЛЬТАТ СОЗДАНИЯ ===");
    console.log(result);
    
    // Исправленная проверка результата
    if (result && result.success) {
      console.log("✅ Событие успешно создано");
      onClose();
    } else {
      throw new Error("Не удалось создать событие");
    }
  } catch (error) {
    console.error("=== ОШИБКА СОХРАНЕНИЯ СОБЫТИЯ ===", error);
    alert(
      `Ошибка сохранения события: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
    );
  } finally {
    setLoading(false);
  }
};


  const eventTypes = [
    { value: "training", label: "Тренировка" },
    { value: "consultation", label: "Консультация" },
    { value: "group", label: "Групповая тренировка" },
    { value: "meeting", label: "Встреча" },
    { value: "break", label: "Перерыв" },
    { value: "other", label: "Другое" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event ? "Редактировать событие" : "Создать новое событие"}
          </DialogTitle>
        </DialogHeader>

        {/* Предупреждение о тестовом режиме */}
        {!isApiAvailable && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              Работа в тестовом режиме. События будут созданы локально.
            </p>
          </div>
        )}

        {/* Предупреждение об отсутствии тренеров */}
        {isApiAvailable && availableTrainers.length === 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-red-800 text-sm">
              В системе нет тренеров. Добавьте тренеров для создания событий.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Основная информация
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Название события *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Введите название"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Тип события *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CreateEventData["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Введите описание события"
                rows={3}
              />
            </div>
          </div>

          {/* Время и участники */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Время и участники
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Время начала *
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Время окончания *
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Тренер *
              </Label>
              <Select
                value={formData.trainerId}
                onValueChange={(value) => {
                  console.log("Выбран тренер:", value);
                  console.log("Тип выбранного ID:", typeof value);
                  setFormData({ ...formData, trainerId: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тренера" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrainers.length === 0 ? (
                    <SelectItem value="no-trainer" disabled>
                      Нет доступных тренеров
                    </SelectItem>
                  ) : (
                    availableTrainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} ({trainer.role})
                        {trainer.id.startsWith("mock-") && (
                          <span className="text-gray-500 text-xs ml-1">
                            (тестовый)
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            И также исправьте секцию с выбором клиента: typescript Copy
            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Клиент
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-client">Без клиента</SelectItem>
                  {availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                      {client.id.startsWith("mock-") && (
                        <span className="text-gray-500 text-xs ml-1">
                          (тестовый)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Дополнительная информация
            </h3>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Место проведения
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Зал 1, Онлайн, и т.д."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Дополнительные заметки"
                rows={3}
              />
            </div>
          </div>

          {/* Повторяющиеся события */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Label htmlFor="recurring" className="text-sm font-medium">
                  Повторяющееся событие
                </Label>
              </div>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="recurringType">Тип повторения</Label>
                  <Select
                    value={formData.recurring?.pattern || "weekly"}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setFormData({
                        ...formData,
                        recurring: {
                          pattern: value,
                          interval: formData.recurring?.interval || 1,
                          endDate: formData.recurring?.endDate,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Интервал</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.recurring?.interval || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring: {
                          pattern: formData.recurring?.pattern || "weekly",
                          interval: parseInt(e.target.value) || 1,
                          endDate: formData.recurring?.endDate,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Дата окончания</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.recurring?.endDate?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring: {
                          pattern: formData.recurring?.pattern || "weekly",
                          interval: formData.recurring?.interval || 1,
                          endDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={
                loading || (isApiAvailable && availableTrainers.length === 0)
              }
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading
                ? "Сохранение..."
                : event
                  ? "Обновить событие"
                  : "Создать событие"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
