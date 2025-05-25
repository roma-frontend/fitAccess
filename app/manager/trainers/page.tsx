// app/manager/trainers/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ManagerHeader from "@/components/manager/ManagerHeader";
import { ManagerProvider, useManager } from "@/contexts/ManagerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock,
  Activity,
  UserCheck,
  UserX,
  Coffee,
  Plane,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import MobileTrainerCard from "@/components/manager/MobileTrainerCard";

function TrainersManagementContent() {
  const router = useRouter();
  const { trainers, loading, updateTrainerStatus } = useManager();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Фильтрация тренеров
  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || trainer.status === statusFilter;
    const matchesSpecialization =
      specializationFilter === "all" ||
      trainer.specialization.some((spec) =>
        spec.includes(specializationFilter)
      );

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Получение уникальных специализаций
  const allSpecializations = Array.from(
    new Set(trainers.flatMap((trainer) => trainer.specialization))
  );

  const getTrainerStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "vacation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrainerStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "busy":
        return Clock;
      case "inactive":
        return XCircle;
      case "vacation":
        return Plane;
      default:
        return AlertCircle;
    }
  };

  const getTrainerStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активен";
      case "busy":
        return "Занят";
      case "inactive":
        return "Неактивен";
      case "vacation":
        return "В отпуске";
      default:
        return "Неизвестно";
    }
  };

  const handleStatusChange = async (trainerId: string, newStatus: string) => {
    await updateTrainerStatus(trainerId, newStatus as any);
    setShowStatusDialog(false);
    setSelectedTrainer(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ManagerHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Загрузка тренеров...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и действия */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление тренерами
            </h1>
            <p className="text-gray-600">
              Управляйте командой тренеров, их статусами и расписанием
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => router.push("/manager/trainers/import")}
            >
              Импорт
            </Button>

            <Button
              onClick={() => router.push("/manager/trainers/add")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить тренера
            </Button>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Поиск */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по имени или email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Фильтр по статусу */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="busy">Занятые</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="vacation">В отпуске</SelectItem>
                </SelectContent>
              </Select>

              {/* Фильтр по специализации */}
              <Select
                value={specializationFilter}
                onValueChange={setSpecializationFilter}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Специализация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все специализации</SelectItem>
                  {allSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Кнопка сброса фильтров */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setSpecializationFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trainers.length}
                  </p>
                  <p className="text-sm text-gray-600">Всего тренеров</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trainers.filter((t) => t.status === "active").length}
                  </p>
                  <p className="text-sm text-gray-600">Активных</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trainers.filter((t) => t.status === "busy").length}
                  </p>
                  <p className="text-sm text-gray-600">Занятых</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(
                      trainers.reduce((sum, t) => sum + t.rating, 0) /
                      trainers.length
                    ).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Средний рейтинг</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Список тренеров - адаптивный */}
        <div className="block lg:hidden">
          {/* Мобильная версия */}
          <div className="space-y-4">
            {filteredTrainers.map((trainer) => (
              <MobileTrainerCard
                key={trainer.id}
                trainer={trainer}
                onView={() => router.push(`/manager/trainers/${trainer.id}`)}
                onEdit={() => router.push(`/manager/trainers/${trainer.id}/edit`)}
                onStatusChange={() => {
                  setSelectedTrainer(trainer);
                  setShowStatusDialog(true);
                }}
                onSchedule={() => router.push(`/manager/trainers/${trainer.id}/schedule`)}
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Десктопная версия - существующий код */}
          {filteredTrainers.map((trainer) => {
            const StatusIcon = getTrainerStatusIcon(trainer.status);

            return (
              <Card
                key={trainer.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  {/* Заголовок карточки */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={trainer.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                          {trainer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {trainer.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={getTrainerStatusColor(trainer.status)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getTrainerStatusText(trainer.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Меню действий */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/manager/trainers/${trainer.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/manager/trainers/${trainer.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTrainer(trainer);
                            setShowStatusDialog(true);
                          }}
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Изменить статус
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Специализации */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialization.slice(0, 3).map((spec, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {spec}
                        </Badge>
                      ))}
                      {trainer.specialization.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{trainer.specialization.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Контактная информация */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{trainer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{trainer.phone}</span>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">
                          {trainer.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Рейтинг</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          {trainer.totalClients}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Клиентов</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-gray-900">
                          {(trainer.monthlyEarnings / 1000).toFixed(0)}К
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Доход</p>
                    </div>
                  </div>

                  {/* Рабочие часы */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {trainer.workingHours.start} -{" "}
                        {trainer.workingHours.end}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trainer.workingHours.days.map((day, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Следующая тренировка */}
                  {trainer.nextSession && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Следующая тренировка:
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {trainer.nextSession.time} -{" "}
                        {trainer.nextSession.client}
                      </p>
                    </div>
                  )}

                  {/* Действия */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/manager/trainers/${trainer.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Просмотр
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/manager/trainers/${trainer.id}/schedule`)
                      }
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Расписание
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Пустое состояние */}
        {filteredTrainers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Тренеры не найдены
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                statusFilter !== "all" ||
                specializationFilter !== "all"
                  ? "Попробуйте изменить критерии поиска или фильтры"
                  : "Добавьте первого тренера в систему"}
              </p>
              {!searchTerm &&
                statusFilter === "all" &&
                specializationFilter === "all" && (
                  <Button
                    onClick={() => router.push("/manager/trainers/add")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить тренера
                  </Button>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалог изменения статуса */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить статус тренера</DialogTitle>
            <DialogDescription>
              Выберите новый статус для {selectedTrainer?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {[
              {
                value: "active",
                label: "Активен",
                icon: CheckCircle,
                color: "text-green-600",
              },
              {
                value: "busy",
                label: "Занят",
                icon: Clock,
                color: "text-yellow-600",
              },
              {
                value: "inactive",
                label: "Неактивен",
                icon: XCircle,
                color: "text-gray-600",
              },
              {
                value: "vacation",
                label: "В отпуске",
                icon: Plane,
                color: "text-blue-600",
              },
            ].map((status) => {
              const IconComponent = status.icon;
              return (
                <Button
                  key={status.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() =>
                    handleStatusChange(selectedTrainer?.id, status.value)
                  }
                >
                  <IconComponent className={`h-5 w-5 mr-3 ${status.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{status.label}</div>
                    <div className="text-sm text-gray-500">
                      {status.value === "active" &&
                        "Тренер доступен для записи"}
                      {status.value === "busy" && "Тренер временно недоступен"}
                      {status.value === "inactive" && "Тренер не работает"}
                      {status.value === "vacation" && "Тренер в отпуске"}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TrainersManagement() {
  return (
    <ProtectedRoute
      allowedRoles={["manager", "admin", "super-admin"]}
      redirectTo="/staff-login"
    >
      <ManagerProvider>
        <TrainersManagementContent />
      </ManagerProvider>
    </ProtectedRoute>
  );
}
