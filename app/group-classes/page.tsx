// app/group-classes/page.tsx (новый файл)
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
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

interface GroupClass {
  _id: string;
  name: string;
  description?: string;
  instructorId: string;
  instructorName: string;
  instructorPhoto?: string;
  startTime: number;
  endTime: number;
  location: string;
  capacity: number;
  enrolled: string[];
  waitlist?: string[];
  difficulty: string;
  equipment?: string[];
  price: number;
  isRecurring: boolean;
  status: string;
}

export default function GroupClassesPage() {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredClasses, setFilteredClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClassesByDate();
  }, [classes, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки занятий:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить расписание занятий",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClassesByDate = () => {
    const filtered = classes.filter(
      (cls) =>
        isSameDay(new Date(cls.startTime), selectedDate) &&
        cls.status === "scheduled"
    );

    // Сортируем по времени начала
    filtered.sort((a, b) => a.startTime - b.startTime);

    setFilteredClasses(filtered);
  };

  const enrollInClass = async (classId: string) => {
    setEnrolling(classId);

    try {
      const response = await fetch("/api/classes/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Обновляем локальное состояние
        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls._id === classId
              ? { ...cls, enrolled: data.enrolled, waitlist: data.waitlist }
              : cls
          )
        );

        toast({
          title: data.waitlisted
            ? "Добавлены в лист ожидания"
            : "Запись успешна!",
          description: data.waitlisted
            ? "Вы добавлены в лист ожидания. Мы уведомим вас, если освободится место."
            : "Вы успешно записались на занятие",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка записи");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось записаться на занятие",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const cancelEnrollment = async (classId: string) => {
    try {
      const response = await fetch("/api/classes/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Обновляем локальное состояние
        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls._id === classId
              ? { ...cls, enrolled: data.enrolled, waitlist: data.waitlist }
              : cls
          )
        );

        toast({
          title: "Запись отменена",
          description: "Вы успешно отменили запись на занятие",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отменить запись",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Начинающий":
        return "bg-green-100 text-green-800 border-green-200";
      case "Средний":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Продвинутый":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isUserEnrolled = (classItem: GroupClass, userId?: string) => {
    // Здесь должна быть логика проверки, записан ли пользователь
    // Пока используем заглушку
    return false;
  };

  const isUserOnWaitlist = (classItem: GroupClass, userId?: string) => {
    // Здесь должна быть логика проверки, в листе ожидания ли пользователь
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка расписания...</p>
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
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Групповые занятия
                </h1>
                <p className="text-sm text-gray-500">
                  Выберите дату и запишитесь на занятие
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Календарь */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Выберите дату</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) =>
                  date < new Date() || date > addDays(new Date(), 30)
                }
                className="rounded-md border"
                locale={ru}
              />

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Легенда</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Есть места</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Мало мест</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Мест нет</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список занятий */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Занятия на{" "}
                {format(selectedDate, "dd MMMM yyyy", { locale: ru })}
              </h2>
              <p className="text-gray-600">
                {filteredClasses.length} занятий доступно
              </p>
            </div>

            {filteredClasses.length > 0 ? (
              <div className="space-y-4">
                {filteredClasses.map((classItem) => (
                  <ClassCard
                    key={classItem._id}
                    classItem={classItem}
                    onEnroll={() => enrollInClass(classItem._id)}
                    onCancel={() => cancelEnrollment(classItem._id)}
                    isEnrolling={enrolling === classItem._id}
                    isUserEnrolled={isUserEnrolled(classItem)}
                    isUserOnWaitlist={isUserOnWaitlist(classItem)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет занятий
                </h3>
                <p className="text-gray-600 mb-4">
                  На выбранную дату занятий не запланировано
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Выбрать сегодня
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент карточки занятия
function ClassCard({
  classItem,
  onEnroll,
  onCancel,
  isEnrolling,
  isUserEnrolled,
  isUserOnWaitlist,
}: {
  classItem: GroupClass;
  onEnroll: () => void;
  onCancel: () => void;
  isEnrolling: boolean;
  isUserEnrolled: boolean;
  isUserOnWaitlist: boolean;
}) {
  const availableSpots = classItem.capacity - classItem.enrolled.length;
  const isFullyBooked = availableSpots === 0;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;

  const getStatusColor = () => {
    if (isFullyBooked) return "text-red-600";
    if (isAlmostFull) return "text-yellow-600";
    return "text-green-600";
  };

  const getActionButton = () => {
    if (isUserEnrolled) {
      return (
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Отменить запись
        </Button>
      );
    }

    if (isUserOnWaitlist) {
      return (
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
        >
          Убрать из ожидания
        </Button>
      );
    }

    if (isFullyBooked) {
      return (
        <Button
          onClick={onEnroll}
          disabled={isEnrolling}
          variant="outline"
          className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
        >
          {isEnrolling ? "Записываем..." : "В лист ожидания"}
        </Button>
      );
    }

    return (
      <Button
        onClick={onEnroll}
        disabled={isEnrolling}
        className="bg-green-600 hover:bg-green-700"
      >
        {isEnrolling ? "Записываем..." : "Записаться"}
      </Button>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold">{classItem.name}</h3>
              <Badge
                className={`${
                  classItem.difficulty === "Начинающий"
                    ? "bg-green-100 text-green-800"
                    : classItem.difficulty === "Средний"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {classItem.difficulty}
              </Badge>
            </div>

            {classItem.description && (
              <p className="text-gray-600 mb-3">{classItem.description}</p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">{classItem.price} ₽</p>
            {isUserEnrolled && (
              <Badge className="bg-green-100 text-green-800 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Записан
              </Badge>
            )}
            {isUserOnWaitlist && (
              <Badge className="bg-yellow-100 text-yellow-800 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />В ожидании
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">
                {format(new Date(classItem.startTime), "HH:mm")} -{" "}
                {format(new Date(classItem.endTime), "HH:mm")}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round(
                  (classItem.endTime - classItem.startTime) / (1000 * 60)
                )}{" "}
                минут
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">{classItem.location}</p>
              <p className="text-xs text-gray-500">Место проведения</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {classItem.enrolled.length}/{classItem.capacity}
              </p>
              <p className="text-xs text-gray-500">
                {isFullyBooked
                  ? "Мест нет"
                  : isAlmostFull
                    ? `Осталось ${availableSpots}`
                    : "Есть места"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={classItem.instructorPhoto}
                alt={classItem.instructorName}
              />
              <AvatarFallback>
                {classItem.instructorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{classItem.instructorName}</p>
              <p className="text-xs text-gray-500">Инструктор</p>
            </div>
          </div>
        </div>

        {classItem.equipment && classItem.equipment.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Необходимое оборудование:
            </p>
            <div className="flex flex-wrap gap-1">
              {classItem.equipment.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {classItem.waitlist && classItem.waitlist.length > 0 && (
              <p className="text-sm text-gray-600">
                В ожидании: {classItem.waitlist.length}
              </p>
            )}

            {classItem.isRecurring && (
              <Badge variant="outline" className="text-xs">
                Регулярное занятие
              </Badge>
            )}
          </div>

          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
