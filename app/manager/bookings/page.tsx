// app/manager/bookings/page.tsx
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";

function BookingsManagementContent() {
  const router = useRouter();
  const { bookings, trainers, loading, updateBooking } = useManager();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Расширенные мок данные для записей
  const extendedBookings = [
    {
      id: "booking-1",
      trainerId: "trainer-1",
      trainerName: "Адам Петров",
      trainerAvatar: "/avatars/trainer-adam.jpg",
      clientId: "client-1",
      clientName: "Мария Иванова",
      clientAvatar: "/avatars/client-maria.jpg",
      clientPhone: "+7 (999) 111-22-33",
      date: new Date().toISOString().split("T")[0],
      time: "14:00",
      duration: 60,
      type: "personal",
      status: "scheduled",
      price: 2500,
      service: "Персональная тренировка",
      notes: "Работа над силовыми упражнениями",
    },
    {
      id: "booking-2",
      trainerId: "trainer-2",
      trainerName: "Елена Смирнова",
      trainerAvatar: "/avatars/trainer-elena.jpg",
      clientId: "client-2",
      clientName: "Анна Козлова",
      clientAvatar: "/avatars/client-anna.jpg",
      clientPhone: "+7 (999) 222-33-44",
      date: new Date().toISOString().split("T")[0],
      time: "15:30",
      duration: 90,
      type: "personal",
      status: "completed",
      price: 3500,
      service: "Йога и стретчинг",
      notes: "Восстановительная тренировка",
    },
    {
      id: "booking-3",
      trainerId: "trainer-1",
      trainerName: "Адам Петров",
      trainerAvatar: "/avatars/trainer-adam.jpg",
      clientId: "client-3",
      clientName: "Сергей Петров",
      clientAvatar: "/avatars/client-sergey.jpg",
      clientPhone: "+7 (999) 333-44-55",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      time: "16:00",
      duration: 60,
      type: "group",
      status: "scheduled",
      price: 1500,
      service: "Групповая тренировка",
      notes: "Кроссфит для начинающих",
    },
    {
      id: "booking-4",
      trainerId: "trainer-3",
      trainerName: "Михаил Волков",
      trainerAvatar: "/avatars/trainer-mikhail.jpg",
      clientId: "client-4",
      clientName: "Дмитрий Сидоров",
      clientAvatar: "/avatars/client-dmitry.jpg",
      clientPhone: "+7 (999) 444-55-66",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      time: "18:00",
      duration: 60,
      type: "personal",
      status: "cancelled",
      price: 2500,
      service: "Бокс",
      notes: "Отменено клиентом",
    },
    {
      id: "booking-5",
      trainerId: "trainer-2",
      trainerName: "Елена Смирнова",
      trainerAvatar: "/avatars/trainer-elena.jpg",
      clientId: "client-5",
      clientName: "Ольга Морозова",
      clientAvatar: "/avatars/client-olga.jpg",
      clientPhone: "+7 (999) 555-66-77",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      duration: 60,
      type: "personal",
      status: "no-show",
      price: 2500,
      service: "Пилатес",
      notes: "Клиент не явился",
    },
  ];

  // Фильтрация записей
  const filteredBookings = extendedBookings.filter((booking) => {
    const matchesSearch =
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    const matchesTrainer =
      trainerFilter === "all" || booking.trainerId === trainerFilter;

    let matchesDate = true;
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (dateFilter === "today") {
      matchesDate = booking.date === today;
    } else if (dateFilter === "tomorrow") {
      matchesDate = booking.date === tomorrow;
    } else if (dateFilter === "yesterday") {
      matchesDate = booking.date === yesterday;
    }

    return matchesSearch && matchesStatus && matchesTrainer && matchesDate;
  });

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getBookingStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return Clock;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      case "no-show":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Запланирована";
      case "completed":
        return "Завершена";
      case "cancelled":
        return "Отменена";
      case "no-show":
        return "Не явился";
      default:
        return "Неизвестно";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "personal"
      ? "bg-purple-100 text-purple-800"
      : "bg-orange-100 text-orange-800";
  };

  const getTypeText = (type: string) => {
    return type === "personal" ? "Персональная" : "Групповая";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no-show') => {
    await updateBooking(bookingId, { status: newStatus });
    setShowStatusDialog(false);
    setSelectedBooking(null);
  };

  // Статистика записей
  const bookingStats = {
    total: extendedBookings.length,
    scheduled: extendedBookings.filter((b) => b.status === "scheduled").length,
    completed: extendedBookings.filter((b) => b.status === "completed").length,
    cancelled: extendedBookings.filter((b) => b.status === "cancelled").length,
    revenue: extendedBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ManagerHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Загрузка записей...</p>
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
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление записями
            </h1>
            <p className="text-gray-600">
              Просматривайте и управляйте всеми записями клиентов
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Обновить
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Экспорт
            </Button>

            <Button
              onClick={() => router.push("/manager/bookings/create")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Создать запись
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingStats.total}
                  </p>
                  <p className="text-sm text-gray-600">Всего записей</p>
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
                    {bookingStats.scheduled}
                  </p>
                  <p className="text-sm text-gray-600">Запланированных</p>
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
                    {bookingStats.completed}
                  </p>
                  <p className="text-sm text-gray-600">Завершенных</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingStats.cancelled}
                  </p>
                  <p className="text-sm text-gray-600">Отмененных</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(bookingStats.revenue / 1000).toFixed(0)}К
                  </p>
                  <p className="text-sm text-gray-600">Доход (₽)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Фильтры */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Поиск */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по клиенту, тренеру или услуге..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Фильтр по дате */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Дата" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все даты</SelectItem>
                  <SelectItem value="yesterday">Вчера</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="tomorrow">Завтра</SelectItem>
                  <SelectItem value="week">Эта неделя</SelectItem>
                </SelectContent>
              </Select>

              {/* Фильтр по статусу */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="scheduled">Запланированные</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                  <SelectItem value="cancelled">Отмененные</SelectItem>
                  <SelectItem value="no-show">Не явился</SelectItem>
                </SelectContent>
              </Select>

              {/* Фильтр по тренеру */}
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

            {/* Быстрые фильтры */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={dateFilter === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("today")}
              >
                Сегодня
              </Button>
              <Button
                variant={dateFilter === "tomorrow" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("tomorrow")}
              >
                Завтра
              </Button>
              <Button
                variant={statusFilter === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("scheduled")}
              >
                Запланированные
              </Button>
              <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("completed")}
              >
                Завершенные
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTrainerFilter("all");
                  setDateFilter("today");
                }}
                className="text-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Таблица записей - Десктопная версия */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Клиент</TableHead>
                      <TableHead className="font-semibold">Тренер</TableHead>
                      <TableHead className="font-semibold">
                        Дата и время
                      </TableHead>
                      <TableHead className="font-semibold">Услуга</TableHead>
                      <TableHead className="font-semibold">Тип</TableHead>
                      <TableHead className="font-semibold">Статус</TableHead>
                      <TableHead className="font-semibold">Цена</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const StatusIcon = getBookingStatusIcon(booking.status);

                      return (
                        <TableRow
                          key={booking.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={booking.clientAvatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-800">
                                  {booking.clientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {booking.clientName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.clientPhone}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={booking.trainerAvatar} />
                                <AvatarFallback className="bg-green-100 text-green-800">
                                  {booking.trainerName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium text-gray-900">
                                {booking.trainerName}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {new Date(booking.date).toLocaleDateString(
                                  "ru-RU",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                              </div>
                              <div className="text-gray-500">
                                {booking.time} ({booking.duration} мин)
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {booking.service}
                              </div>
                              {booking.notes && (
                                <div className="text-gray-500 text-xs mt-1 truncate max-w-32">
                                  {booking.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={getTypeColor(booking.type)}>
                              {getTypeText(booking.type)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={getBookingStatusColor(booking.status)}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {getBookingStatusText(booking.status)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <span className="font-semibold text-gray-900">
                              {booking.price.toLocaleString()} ₽
                            </span>
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/manager/bookings/${booking.id}`
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Просмотр
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/manager/bookings/${booking.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Изменить статус
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Мобильная версия - Карточки */}
        <div className="lg:hidden space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon = getBookingStatusIcon(booking.status);

            return (
              <Card
                key={booking.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  {/* Заголовок карточки */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.clientAvatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {booking.clientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {booking.clientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.clientPhone}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/manager/bookings/${booking.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/manager/bookings/${booking.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Информация о тренере */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={booking.trainerAvatar} />
                      <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                        {booking.trainerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {booking.trainerName}
                    </span>
                  </div>

                  {/* Детали записи */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Дата и время:</span>
                      <span className="font-medium">
                        {new Date(booking.date).toLocaleDateString("ru-RU")} в{" "}
                        {booking.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Услуга:</span>
                      <span className="font-medium">{booking.service}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Длительность:</span>
                      <span className="font-medium">
                        {booking.duration} минут
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Цена:</span>
                      <span className="font-semibold text-gray-900">
                        {booking.price.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>

                  {/* Статусы и тип */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(booking.type)}>
                        {getTypeText(booking.type)}
                      </Badge>
                      <Badge className={getBookingStatusColor(booking.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getBookingStatusText(booking.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Заметки */}
                  {booking.notes && (
                    <div className="p-2 bg-blue-50 rounded text-sm text-blue-800 mb-3">
                      <span className="font-medium">Заметки: </span>
                      {booking.notes}
                    </div>
                  )}

                  {/* Действия */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/manager/bookings/${booking.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Просмотр
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowStatusDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Статус
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Пустое состояние */}
        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Записи не найдены
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                statusFilter !== "all" ||
                trainerFilter !== "all" ||
                dateFilter !== "today"
                  ? "Попробуйте изменить критерии поиска или фильтры"
                  : "На сегодня записей нет"}
              </p>
              {!searchTerm &&
                statusFilter === "all" &&
                trainerFilter === "all" && (
                  <Button
                    onClick={() => router.push("/manager/bookings/create")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Создать запись
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
            <DialogTitle>Изменить статус записи</DialogTitle>
            <DialogDescription>
              Выберите новый статус для записи {selectedBooking?.clientName} к{" "}
              {selectedBooking?.trainerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {[
              {
                value: "scheduled" as const,
                label: "Запланирована",
                icon: Clock,
                color: "text-blue-600",
                description: "Запись подтверждена и ожидает выполнения",
              },
              {
                value: "completed" as const,
                label: "Завершена",
                icon: CheckCircle,
                color: "text-green-600",
                description: "Тренировка успешно проведена",
              },
              {
                value: "cancelled" as const,
                label: "Отменена",
                icon: XCircle,
                color: "text-red-600",
                description: "Запись отменена клиентом или тренером",
              },
              {
                value: "no-show" as const,
                label: "Не явился",
                icon: AlertTriangle,
                color: "text-gray-600",
                description: "Клиент не пришел на тренировку",
              },
            ].map((status) => {
              const IconComponent = status.icon;
              return (
                <Button
                  key={status.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() =>
                    handleStatusChange(selectedBooking?.id, status.value)
                  }
                >
                  <IconComponent className={`h-5 w-5 mr-3 ${status.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{status.label}</div>
                    <div className="text-sm text-gray-500">
                      {status.description}
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

export default function BookingsManagement() {
  return (
    <ProtectedRoute
      allowedRoles={["manager", "admin", "super-admin"]}
      redirectTo="/staff-login"
    >
      <ManagerProvider>
        <BookingsManagementContent />
      </ManagerProvider>
    </ProtectedRoute>
  );
}
