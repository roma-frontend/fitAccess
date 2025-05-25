// components/admin/schedule/EventsList.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Clock,
  User,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScheduleEvent } from "./types";

interface EventsListProps {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
}

export function EventsList({
  events,
  onEdit,
  onDelete,
  onStatusChange,
}: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ScheduleEvent["status"] | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<ScheduleEvent["type"] | "all">(
    "all"
  );
  const [trainerFilter, setTrainerFilter] = useState<string>("all");

  // Фильтрация событий
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchTerm ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.clientName &&
        event.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    const matchesTrainer =
      trainerFilter === "all" || event.trainerId === trainerFilter;

    return matchesSearch && matchesStatus && matchesType && matchesTrainer;
  });

  // Получить уникальных тренеров
  const trainers = Array.from(
    new Set(events.map((e) => ({ id: e.trainerId, name: e.trainerName })))
  ).filter(
    (trainer, index, self) =>
      self.findIndex((t) => t.id === trainer.id) === index
  );

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    const colors = {
      training: "bg-blue-100 text-blue-800 border-blue-200",
      consultation: "bg-green-100 text-green-800 border-green-200",
      meeting: "bg-purple-100 text-purple-800 border-purple-200",
      break: "bg-gray-100 text-gray-800 border-gray-200",
      other: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[type];
  };

  const getStatusColor = (status: ScheduleEvent["status"]) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

  const getStatusName = (status: ScheduleEvent["status"]) => {
    const names = {
      scheduled: "Запланировано",
      confirmed: "Подтверждено",
      completed: "Завершено",
      cancelled: "Отменено",
      "no-show": "Не явился",
    };
    return names[status];
  };

  const getTypeName = (type: ScheduleEvent["type"]) => {
    const names = {
      training: "Тренировка",
      consultation: "Консультация",
      meeting: "Встреча",
      break: "Перерыв",
      other: "Другое",
    };
    return names[type];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ru"),
      time: date.toLocaleTimeString("ru", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Список событий ({filteredEvents.length})
        </CardTitle>

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск событий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="scheduled">Запланировано</SelectItem>
              <SelectItem value="confirmed">Подтверждено</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
              <SelectItem value="cancelled">Отменено</SelectItem>
              <SelectItem value="no-show">Не явился</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value: any) => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="training">Тренировка</SelectItem>
              <SelectItem value="consultation">Консультация</SelectItem>
              <SelectItem value="meeting">Встреча</SelectItem>
              <SelectItem value="break">Перерыв</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
            </SelectContent>
          </Select>

          <Select value={trainerFilter} onValueChange={setTrainerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Тренер" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все тренеры</SelectItem>
              {trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                События не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const startTime = formatDateTime(event.startTime);
              const endTime = formatDateTime(event.endTime);

              return (
                <div
                  key={event._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {getTypeName(event.type)}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {getStatusName(event.status)}
                        </Badge>
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{startTime.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {startTime.time} - {endTime.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{event.trainerName}</span>
                        </div>
                        {event.clientName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Клиент: {event.clientName}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Заметки:</strong> {event.notes}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(event)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>

                        {event.status === "scheduled" && (
                          <DropdownMenuItem
                            onClick={() =>
                              onStatusChange(event._id, "confirmed")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Подтвердить
                          </DropdownMenuItem>
                        )}

                        {event.status === "confirmed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              onStatusChange(event._id, "completed")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Завершить
                          </DropdownMenuItem>
                        )}

                        {!["completed", "cancelled"].includes(event.status) && (
                          <DropdownMenuItem
                            onClick={() =>
                              onStatusChange(event._id, "cancelled")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Отменить
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => onDelete(event._id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
