// app/programs/page.tsx (обновленная версия)
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { programsData } from "@/lib/programs-data"; // Импортируем общие данные
import {
  Dumbbell,
  ArrowLeft,
  Heart,
  Target,
  Flame,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgramsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header остается без изменений */}
      <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Назад</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Программы тренировок
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Фитнес-программы
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {" "}
              для всех
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Выберите программу тренировок, которая подходит именно вам. От
            расслабляющей йоги до интенсивного кардио - у нас есть все!
          </p>
        </div>

        {/* Программы - используем общие данные */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {programsData.map((program, index) => {
            const IconComponent = program.icon;

            const handleCardClick = () => {
              console.log("Card clicked, navigating to:", program.link);
              router.push(program.link);
            };

            const handleDetailsClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              console.log("Details clicked, navigating to:", program.link);
              router.push(program.link);
            };

            const handleBookingClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              const bookingLink = `${program.link}?action=book`;
              console.log("Booking clicked, navigating to:", bookingLink);
              router.push(bookingLink);
            };

            return (
              <Card
                key={program.slug}
                className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${program.bgGradient} ${program.borderColor} cursor-pointer overflow-hidden`}
                onClick={handleCardClick}
              >
                <div className="relative">
                  <div
                    className={`h-32 bg-gradient-to-br ${program.iconGradient} flex items-center justify-center`}
                  >
                    <div
                      className={`w-16 h-16 bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <IconComponent className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-white/90 rounded-full px-2 py-1 backdrop-blur-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 transition-all duration-300 group-hover:scale-105">
                        {program.title}
                      </h3>
                      <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                        {program.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{program.participants}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Уровень:</span>{" "}
                        {program.level}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Цена:</span>{" "}
                        {program.price}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Что включено:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {program.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white/60 text-xs rounded-full text-gray-700"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleDetailsClick}
                        className={`flex-1 bg-gradient-to-r ${program.buttonGradient} text-white py-3 px-4 rounded-lg ${program.buttonHover} transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium`}
                      >
                        Подробнее
                      </button>
                      <button
                        onClick={handleBookingClick}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
                      >
                        Записаться
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Остальные секции остаются без изменений */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Групповые занятия</h3>
            <p className="text-gray-600 text-sm">
              Тренируйтесь в команде единомышленников под руководством опытных
              тренеров
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Персональный подход</h3>
            <p className="text-gray-600 text-sm">
              Программы адаптируются под ваш уровень подготовки и цели
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Безопасность</h3>
            <p className="text-gray-600 text-sm">
              Все упражнения выполняются с соблюдением техники безопасности
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Готовы начать тренировки?
            </h3>
            <p className="text-gray-600 mb-6">
              Выберите программу или получите персональную консультацию от наших
              тренеров
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/trainers")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                Выбрать тренера
              </button>
              <button
                onClick={() => router.push("/consultation")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Получить консультацию
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
