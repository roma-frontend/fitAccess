"use client";

import { useState } from "react";
import { X, Edit, Trash2, Calendar, Clock, User, MapPin, FileText, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleEvent, TrainerSchedule, Client } from "@/hooks/useScheduleData";

interface EventDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduleEvent;
  trainers: TrainerSchedule[];
  clients: Client[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: string) => void;
}

export function EventDetails({
  isOpen,
  onClose,
  event,
  trainers,
  clients,
  onEdit,
  onDelete,
  onStatusChange,
}: EventDetailsProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // ✅ НАХОДИМ ТРЕНЕРА И КЛИЕНТА
  const trainer = trainers.find(t => t.trainerId === event.trainerId);
  const client = event.clientId ? clients.find(c => c.id === event.clientId) : null;

  // ✅ ФОРМАТИРОВАНИЕ ВРЕМЕНИ
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const startDateTime = formatDateTime(event.startTime);
  const endDateTime = formatDateTime(event.endTime);

  // ✅ СТАТУСЫ
  const statusConfig = {
    scheduled: { label: "Запланировано", color: "bg-blue-100 text-blue-800" },
    confirmed: { label: "Подтверждено", color: "bg-green-100 text-green-800" },
    completed: { label: "Завершено", color: "bg-gray-100 text-gray-800" },
    cancelled: { label: "Отменено", color: "bg-red-100 text-red-800" },
    "no-show": { label: "Не явился", color: "bg-orange-100 text-orange-800" },
  };

  const currentStatus = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.scheduled;

  // ✅ ОБРАБОТКА ИЗМЕНЕНИЯ СТАТУСА
  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await onStatusChange(event._id, newStatus);
    } catch (error) {
      console.error("❌ Ошибка изменения статуса:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ОБРАБОТКА УДАЛЕНИЯ
  const handleDelete = () => {
    if (confirm(`Вы уверены, что хотите удалить событие "${event.title}"?`)) {
      onDelete(event._id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ✅ ЗАГОЛОВОК */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* ✅ ОСНОВНАЯ ИНФОРМАЦИЯ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Время */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Время проведения
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Начало: {startDateTime.date} в {startDateTime.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Окончание: {endDateTime.date} в {endDateTime.time}</span>
                </div>
              </div>
            </div>

            {/* Тип события */}
            <div className="space-y-3">
              <h3 className="font-medium">Тип события</h3>
              <div className="text-sm">

                {event.type === 'personal' && 'Персональная тренировка'}
                {event.type === 'group' && 'Групповая тренировка'}
                {event.type === 'consultation' && 'Консультация'}
                {event.type === 'assessment' && 'Оценка физической формы'}
                {event.type === 'other' && 'Другое'}
              </div>
            </div>
          </div>

          {/* ✅ УЧАСТНИКИ */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Участники
            </h3>
            
            {/* Тренер */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{event.trainerName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {trainer?.trainerRole || 'Тренер'}
                  </p>
                </div>
                <Badge variant="secondary">Тренер</Badge>
              </div>
            </div>

            {/* Клиент */}
            {client ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">Клиент</Badge>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-500">
                Клиент не назначен
              </div>
            )}
          </div>

          {/* ✅ МЕСТОПОЛОЖЕНИЕ */}
          {event.location && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Местоположение
              </h3>
              <p className="text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {event.location}
              </p>
            </div>
          )}

          {/* ✅ ОПИСАНИЕ */}
          {event.description && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Описание
              </h3>
              <p className="text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {event.description}
              </p>
            </div>
          )}

          {/* ✅ ЗАМЕТКИ */}
          {event.notes && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Заметки
              </h3>
              <p className="text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {event.notes}
              </p>
            </div>
          )}

          {/* ✅ ИЗМЕНЕНИЕ СТАТУСА */}
          <div className="space-y-3">
            <h3 className="font-medium">Изменить статус</h3>
            <Select
              value={event.status}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Запланировано</SelectItem>
                <SelectItem value="confirmed">Подтверждено</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="cancelled">Отменено</SelectItem>
                <SelectItem value="no-show">Не явился</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ✅ МЕТАДАННЫЕ */}
          <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
            <p>ID события: {event._id}</p>
            <p>Создано: {new Date(event._creationTime).toLocaleString('ru-RU')}</p>
            <p>Создал: {event.createdBy}</p>
          </div>

          {/* ✅ КНОПКИ ДЕЙСТВИЙ */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Закрыть
              </Button>
              <Button
                onClick={() => onEdit(event)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Редактировать
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
