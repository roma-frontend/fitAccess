// app/book-trainer/page.tsx (новый файл)
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";


import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Star,
  Filter,
  Search,
  Award,
  Languages,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { ru } from "date-fns/locale";

interface Trainer {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  specializations: string[];
  experience: number;
  rating?: number;
  totalReviews?: number;
  hourlyRate: number;
  workingHours: any;
  languages?: string[];
  certifications?: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

export default function BookTrainerPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [workoutType, setWorkoutType] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [specializationFilter, setSpecializationFilter] =
    useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState<
    "select" | "schedule" | "details" | "confirm"
  >("select");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchQuery, specializationFilter, priceFilter]);

  useEffect(() => {
    if (selectedTrainer && selectedDate) {
      generateTimeSlots();
    }
  }, [selectedTrainer, selectedDate]);

  const fetchTrainers = async () => {
    try {
      const response = await fetch("/api/trainers");
      if (response.ok) {
        const data = await response.json();
        setTrainers(data.trainers || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки тренеров:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список тренеров",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTrainers = () => {
    let filtered = trainers;

    // Поиск по имени
    if (searchQuery) {
      filtered = filtered.filter(
        (trainer) =>
          trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trainer.specializations.some((spec) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Фильтр по специализации
    if (specializationFilter !== "all") {
      filtered = filtered.filter((trainer) =>
        trainer.specializations.includes(specializationFilter)
      );
    }

    // Фильтр по цене
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "budget":
          filtered = filtered.filter((trainer) => trainer.hourlyRate <= 2000);
          break;
        case "medium":
          filtered = filtered.filter(
            (trainer) => trainer.hourlyRate > 2000 && trainer.hourlyRate <= 3500
          );
          break;
        case "premium":
          filtered = filtered.filter((trainer) => trainer.hourlyRate > 3500);
          break;
      }
    }

    // Сортировка по рейтингу
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    setFilteredTrainers(filtered);
  };

  const generateTimeSlots = () => {
    if (!selectedTrainer || !selectedDate) return;

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    }).toLowerCase();
    const workingHours = selectedTrainer.workingHours[dayOfWeek];

    if (!workingHours) {
      setAvailableSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = workingHours.start.split(":").map(Number);
    const [endHour, endMinute] = workingHours.end.split(":").map(Number);

    let currentTime = setMinutes(
      setHours(selectedDate, startHour),
      startMinute
    );
    const endTime = setMinutes(setHours(selectedDate, endHour), endMinute);

    while (currentTime < endTime) {
      const timeString = format(currentTime, "HH:mm");
      const isAvailable = Math.random() > 0.3; // Симуляция занятости

      slots.push({
        time: timeString,
        available: isAvailable,
        price: selectedTrainer.hourlyRate,
      });

      currentTime = addDays(currentTime, 0);
      currentTime.setMinutes(currentTime.getMinutes() + 60); // Слоты по часу
    }

    setAvailableSlots(slots);
  };

  const handleTrainerSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setBookingStep("schedule");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep("details");
  };

  const handleBooking = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime || !workoutType) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля",
      });
      return;
    }

    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainerId: selectedTrainer._id,
          startTime: startDateTime.getTime(),
          endTime: endDateTime.getTime(),
          duration,
          workoutType,
          notes,
          price: selectedTrainer.hourlyRate * (duration / 60),
        }),
      });

      if (response.ok) {
        setBookingStep("confirm");
        toast({
          title: "Успешно!",
          description: "Ваша запись отправлена тренеру на подтверждение",
        });
      } else {
        throw new Error("Ошибка создания записи");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать запись. Попробуйте еще раз.",
      });
    }
  };

  const resetBooking = () => {
    setSelectedTrainer(null);
    setSelectedDate(new Date());
    setSelectedTime("");
    setWorkoutType("");
    setNotes("");
    setBookingStep("select");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка тренеров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (bookingStep === "select") {
                    window.history.back();
                  } else {
                    setBookingStep("select");
                    setSelectedTrainer(null);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Запись к тренеру
                </h1>
                <p className="text-sm text-gray-500">
                  {bookingStep === "select" && "Выберите тренера"}
                  {bookingStep === "schedule" && "Выберите дату и время"}
                  {bookingStep === "details" && "Детали тренировки"}
                  {bookingStep === "confirm" && "Подтверждение записи"}
                </p>
              </div>
            </div>

            {/* Прогресс */}
            <div className="flex items-center space-x-2">
              {["select", "schedule", "details", "confirm"].map(
                (step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        bookingStep === step
                          ? "bg-blue-600 text-white"
                          : index <
                              [
                                "select",
                                "schedule",
                                "details",
                                "confirm",
                              ].indexOf(bookingStep)
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index <
                      ["select", "schedule", "details", "confirm"].indexOf(
                        bookingStep
                      ) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-8 h-0.5 mx-2 ${
                          index <
                          ["select", "schedule", "details", "confirm"].indexOf(
                            bookingStep
                          )
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Шаг 1: Выбор тренера */}
        {bookingStep === "select" && (
          <div className="space-y-6">
            {/* Фильтры и поиск */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск тренера..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={specializationFilter}
                    onValueChange={setSpecializationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Специализация" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все специализации</SelectItem>
                      <SelectItem value="Силовые тренировки">
                        Силовые тренировки
                      </SelectItem>
                      <SelectItem value="Йога">Йога</SelectItem>
                      <SelectItem value="Кардио">Кардио</SelectItem>
                      <SelectItem value="Кроссфит">Кроссфит</SelectItem>
                      <SelectItem value="Пилатес">Пилатес</SelectItem>
                      <SelectItem value="Функциональный тренинг">
                        Функциональный тренинг
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Цена" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любая цена</SelectItem>
                      <SelectItem value="budget">До 2000 ₽</SelectItem>
                      <SelectItem value="medium">2000-3500 ₽</SelectItem>
                      <SelectItem value="premium">От 3500 ₽</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSpecializationFilter("all");
                      setPriceFilter("all");
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Сбросить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Список тренеров */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer) => (
                <TrainerDetailCard
                  key={trainer._id}
                  trainer={trainer}
                  onSelect={() => handleTrainerSelect(trainer)}
                />
              ))}
            </div>

            {filteredTrainers.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Тренеры не найдены
                </h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSpecializationFilter("all");
                    setPriceFilter("all");
                  }}
                >
                  Сбросить фильтры
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Шаг 2: Выбор даты и времени */}
        {bookingStep === "schedule" && selectedTrainer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Информация о тренере */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedTrainer.photoUrl}
                      alt={selectedTrainer.name}
                    />
                    <AvatarFallback>
                      {selectedTrainer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedTrainer.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">
                        {selectedTrainer.rating || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({selectedTrainer.totalReviews || 0} отзывов)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedTrainer.experience} лет опыта
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Специализации:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTrainer.specializations.map((spec, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedTrainer.bio && (
                    <div>
                      <h4 className="font-medium mb-2">О тренере:</h4>
                      <p className="text-sm text-gray-600">
                        {selectedTrainer.bio}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-lg font-bold">
                      {selectedTrainer.hourlyRate} ₽/час
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Календарь */}
            <Card>
              <CardHeader>
                <CardTitle>Выберите дату</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date < new Date() || date > addDays(new Date(), 30)
                  }
                  className="rounded-md border"
                  locale={ru}
                />
              </CardContent>
            </Card>

            {/* Доступные слоты */}
            <Card>
              <CardHeader>
                <CardTitle>Доступное время</CardTitle>
                <CardDescription>
                  {selectedDate &&
                    format(selectedDate, "dd MMMM yyyy", { locale: ru })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={
                          selectedTime === slot.time ? "default" : "outline"
                        }
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot.time)}
                        className="h-12"
                      >
                        <div className="text-center">
                          <div className="font-medium">{slot.time}</div>
                          <div className="text-xs opacity-75">
                            {slot.available ? `${slot.price} ₽` : "Занято"}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {selectedDate
                        ? "В этот день тренер не работает"
                        : "Выберите дату для просмотра доступного времени"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Шаг 3: Детали тренировки */}
        {bookingStep === "details" && selectedTrainer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма деталей */}
            <Card>
              <CardHeader>
                <CardTitle>Детали тренировки</CardTitle>
                <CardDescription>
                  Расскажите о ваших целях и предпочтениях
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Тип тренировки *
                  </label>
                  <Select value={workoutType} onValueChange={setWorkoutType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип тренировки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Персональная тренировка">
                        Персональная тренировка
                      </SelectItem>
                      <SelectItem value="Консультация">Консультация</SelectItem>
                      <SelectItem value="Составление программы">
                        Составление программы
                      </SelectItem>
                      <SelectItem value="Техника выполнения">
                        Техника выполнения
                      </SelectItem>
                      <SelectItem value="Растяжка">Растяжка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Продолжительность
                  </label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 минут</SelectItem>
                      <SelectItem value="60">60 минут</SelectItem>
                      <SelectItem value="90">90 минут</SelectItem>
                      <SelectItem value="120">120 минут</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Дополнительные пожелания
                  </label>
                  <Textarea
                    placeholder="Расскажите о ваших целях, опыте, ограничениях или особых пожеланиях..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep("schedule")}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={!workoutType}
                    className="flex-1"
                  >
                    Записаться
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Сводка записи */}
            <Card>
              <CardHeader>
                <CardTitle>Сводка записи</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar>
                    <AvatarImage
                      src={selectedTrainer.photoUrl}
                      alt={selectedTrainer.name}
                    />
                    <AvatarFallback>
                      {selectedTrainer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedTrainer.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTrainer.specializations.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Дата:</span>
                    <span className="font-medium">
                      {selectedDate &&
                        format(selectedDate, "dd MMMM yyyy", { locale: ru })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Время:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Продолжительность:
                    </span>
                    <span className="font-medium">{duration} минут</span>
                  </div>

                  {workoutType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Тип:</span>
                      <span className="font-medium">{workoutType}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Стоимость:</span>
                    <span className="font-bold">
                      {Math.round(selectedTrainer.hourlyRate * (duration / 60))}{" "}
                      ₽
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedTrainer.hourlyRate} ₽/час × {duration / 60} ч
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 Запись будет отправлена тренеру на подтверждение. Вы
                    получите уведомление о статусе записи.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Шаг 4: Подтверждение */}
        {bookingStep === "confirm" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Запись отправлена!
                </h2>

                <p className="text-gray-600 mb-6">
                  Ваша запись к тренеру <strong>{selectedTrainer?.name}</strong>{" "}
                  на{" "}
                  <strong>
                    {selectedDate &&
                      format(selectedDate, "dd MMMM", { locale: ru })}{" "}
                    в {selectedTime}
                  </strong>{" "}
                  отправлена на подтверждение.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-2">Что дальше?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Тренер рассмотрит вашу заявку в течение 2-4 часов</li>
                    <li>
                      • Вы получите уведомление о подтверждении или изменениях
                    </li>
                    <li>• За 1 час до тренировки придет напоминание</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/member-dashboard")}
                    className="flex-1"
                  >
                    В личный кабинет
                  </Button>
                  <Button onClick={resetBooking} className="flex-1">
                    Записаться еще
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент детальной карточки тренера
function TrainerDetailCard({
  trainer,
  onSelect,
}: {
  trainer: Trainer;
  onSelect: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <div className="relative">
        <img
          src={trainer.photoUrl || "/placeholder-trainer.jpg"}
          alt={trainer.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-900">
            {trainer.hourlyRate} ₽/час
          </Badge>
        </div>
        {trainer.rating && trainer.rating >= 4.8 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-yellow-500">⭐ Топ тренер</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg mb-1">{trainer.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{trainer.rating || 0}</span>
              <span className="text-xs text-gray-500">
                ({trainer.totalReviews || 0})
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4" />
            <span>{trainer.experience} лет опыта</span>
          </div>

          {trainer.languages && trainer.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Languages className="h-4 w-4" />
              <span>{trainer.languages.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Специализации:</p>
          <div className="flex flex-wrap gap-1">
            {trainer.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {trainer.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.specializations.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {trainer.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {trainer.bio}
          </p>
        )}

        <Button
          onClick={onSelect}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Записаться
        </Button>
      </CardContent>
    </Card>
  );
}
