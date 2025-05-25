// components/admin/schedule/EventDetailsModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { ScheduleEvent } from "./types";

interface EventDetailsModalProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
  onSendMessage?: (event: ScheduleEvent) => void; // Добавили этот пропс
  userRole: string;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onSendMessage, // Добавили этот параметр
  userRole,
}: EventDetailsModalProps) {
  if (!event) return null;

  const canEdit =
    userRole === "super-admin" ||
    userRole === "admin" ||
    (userRole === "manager" &&
      !["super-admin", "admin"].includes(event.createdBy));

  const getEventTypeInfo = (type: ScheduleEvent["type"]) => {
    const types = {
      training: {
        name: "Тренировка",
        color: "bg-blue-100 text-blue-800",
        icon: "🏋️",
      },
      consultation: {
        name: "Консультация",
        color: "bg-green-100 text-green-800",
        icon: "💬",
      },
      meeting: {
        name: "Встреча",
        color: "bg-purple-100 text-purple-800",
        icon: "🤝",
      },
      break: {
        name: "Перерыв",
        color: "bg-gray-100 text-gray-800",
        icon: "☕",
      },
      other: {
        name: "Другое",
        color: "bg-orange-100 text-orange-800",
        icon: "📋",
      },
    };
    return types[type];
  };

  const getStatusInfo = (status: ScheduleEvent["status"]) => {
    const statuses = {
      scheduled: {
        name: "Запланировано",
        color: "bg-blue-100 text-blue-800",
        icon: Calendar,
      },
      confirmed: {
        name: "Подтверждено",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      completed: {
        name: "Завершено",
        color: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle,
      },
      cancelled: {
        name: "Отменено",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      "no-show": {
        name: "Не явился",
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
      },
    };
    return statuses[status];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ru", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("ru", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getDuration = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}ч ${diffMinutes}м`;
    }
    return `${diffMinutes}м`;
  };

  const typeInfo = getEventTypeInfo(event.type);
  const statusInfo = getStatusInfo(event.status);
  const startTime = formatDateTime(event.startTime);
  const endTime = formatDateTime(event.endTime);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{typeInfo.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={typeInfo.color}>{typeInfo.name}</Badge>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.name}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Время и дата */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Время проведения
              </h3>

              <div className="space-y-3 pl-7">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Дата:</span>
                  <span className="font-medium">{startTime.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Время:</span>
                  <span className="font-medium">
                    {startTime.time} - {endTime.time}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Длительность:</span>
                  <span className="font-medium">{getDuration()}</span>
                </div>
              </div>
            </div>

            {/* Участники */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Участники
              </h3>

              <div className="space-y-3 pl-7">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Тренер
                    </span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {event.trainerName}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>+7 (999) 123-45-67</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>trainer@fitaccess.ru</span>
                    </div>
                  </div>
                </div>

                {event.clientName ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Клиент
                      </span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {event.clientName}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>+7 (999) 987-65-43</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>client@example.com</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 italic">
                      Без клиента
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Дополнительная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Дополнительная информация
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">Место:</span>
                    <div className="font-medium">{event.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-600">Создано:</span>
                  <div className="font-medium">
                    {new Date(event.createdAt).toLocaleDateString("ru")}
                    <span className="text-sm text-gray-500 ml-1">
                      пользователем {event.createdBy}
                    </span>
                  </div>
                </div>
              </div>

              {event.updatedAt && (
                <div className="flex items-start gap-2">
                  <RotateCcw className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">Обновлено:</span>
                    <div className="font-medium">
                      {new Date(event.updatedAt).toLocaleDateString("ru")}
                    </div>
                  </div>
                </div>
              )}

              {event.recurring && (
                <div className="flex items-start gap-2">
                  <RotateCcw className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">Повторение:</span>
                    <div className="font-medium">
                      {event.recurring.type === "daily" && "Ежедневно"}
                      {event.recurring.type === "weekly" && "Еженедельно"}
                      {event.recurring.type === "monthly" && "Ежемесячно"}
                      {event.recurring.interval > 1 &&
                        ` (каждые ${event.recurring.interval})`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {event.description && (
              <div className="pl-7">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Описание:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                      {event.description}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {event.notes && (
              <div className="pl-7">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Заметки:</span>
                    <div className="mt-1 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      {event.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Действия */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Действия</h3>

            <div className="flex flex-wrap gap-3">
              {/* Изменение статуса */}
              {event.status === "scheduled" && canEdit && (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(event._id, "confirmed")}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Подтвердить
                </Button>
              )}

              {event.status === "confirmed" && canEdit && (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(event._id, "completed")}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Завершить
                </Button>
              )}

              {!["completed", "cancelled"].includes(event.status) &&
                canEdit && (
                  <Button
                    variant="outline"
                    onClick={() => onStatusChange(event._id, "cancelled")}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    Отменить
                  </Button>
                )}

              {/* Редактирование */}
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onEdit(event);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
              )}

              {/* Удаление */}
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onDelete(event._id);
                    onClose();
                  }}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </Button>
              )}

              {/* Отправка сообщения - используем переданную функцию */}
              {onSendMessage && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onSendMessage(event);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Связаться
                </Button>
              )}
            </div>
          </div>

          {/* Кнопка закрытия */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
