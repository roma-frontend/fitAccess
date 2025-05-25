// app/trainer/dmitriy-kozlov/page.tsx (новый файл)
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Award,
  Clock,
  MapPin,
  Target,
  CheckCircle,
  ArrowLeft,
  Dumbbell,
} from "lucide-react";

export default function DmitriyKozlovPage() {
  const trainer = {
    name: "Дмитрий Козлов",
    specialty: "Функциональный тренинг",
    rating: 4.7,
    experience: "7+ лет",
    price: "от 2300₽/час",
    avatar: Target,
    gradient: "from-orange-400 to-red-600",
    color: "orange",
    badges: ["TRX", "Функциональный", "Реабилитация"],
    description:
      "Эксперт функционального тренинга и реабилитации. Улучшу координацию, выносливость и функциональность движений.",
    bio: "Дмитрий специализируется на функциональных тренировках и реабилитации после травм. Работает с профессиональными спортсменами.",
    certifications: [
      "Сертифицированный TRX-инструктор",
      "Специалист по функциональному тренингу",
      "Инструктор по реабилитации",
      "Кинезиотерапевт",
    ],
    achievements: [
      "Реабилитировал 50+ спортсменов после травм",
      "Тренер сборной по легкой атлетике",
      "Автор методики восстановления",
      "Эксперт по биомеханике движений",
    ],
    services: [
      { name: "Функциональная тренировка", price: "2300₽", duration: "60 мин" },
      { name: "TRX тренировка", price: "2100₽", duration: "45 мин" },
      {
        name: "Реабилитационная программа",
        price: "2800₽",
        duration: "75 мин",
      },
      {
        name: "Анализ движений и коррекция",
        price: "2500₽",
        duration: "60 мин",
      },
    ],
  };

  const IconComponent = trainer.avatar;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FitAccess</h1>
            </a>

            <a
              href="/trainers"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Все тренеры
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <Card className="overflow-hidden">
            <div
              className={`h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center relative`}
            >
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-16 w-16" />
                </div>
                <h1 className="text-4xl font-bold mb-2">{trainer.name}</h1>
                <p className="text-xl opacity-90">{trainer.specialty}</p>
              </div>

              <div className="absolute top-6 right-6">
                <div className="flex items-center bg-white/90 rounded-full px-4 py-2">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="font-bold text-gray-900">
                    {trainer.rating}
                  </span>
                  <span className="text-gray-600 ml-1">/5</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      О тренере
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {trainer.description}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {trainer.bio}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Специализации
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.badges.map((badge: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-orange-100 text-orange-800 px-3 py-1"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Сертификаты и образование
                    </h3>
                    <div className="space-y-2">
                      {trainer.certifications.map(
                        (cert: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-gray-700">{cert}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Достижения
                    </h3>
                    <div className="space-y-2">
                      {trainer.achievements.map(
                        (achievement: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{achievement}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Быстрая информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Опыт работы</p>
                          <p className="text-sm text-gray-600">
                            {trainer.experience}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Рейтинг</p>
                          <p className="text-sm text-gray-600">
                            {trainer.rating}/5.0
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Локация</p>
                          <p className="text-sm text-gray-600">
                            FitAccess Club
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold text-lg mb-2">
                        Записаться на тренировку
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {trainer.price}
                      </p>
                      <a
                        href="/book-trainer/dmitriy-kozlov"
                        className={`block w-full bg-gradient-to-r ${trainer.gradient} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all font-medium`}
                      >
                        Забронировать
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Услуги и цены</CardTitle>
              <CardDescription>
                Выберите подходящий формат тренировки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainer.services.map((service: any, index: number) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-all cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">
                          {service.name}
                        </h3>
                        <Badge className="bg-orange-100 text-orange-800">
                          {service.duration}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {service.price}
                        </span>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${trainer.gradient} hover:opacity-90`}
                          onClick={() =>
                            (window.location.href = `/book-trainer/dmitriy-kozlov?service=${index}`)
                          }
                        >
                          Выбрать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card
            className={`border-orange-200 bg-gradient-to-r ${trainer.gradient} text-white`}
          >
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Готовы начать тренировки с Дмитрием?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Запишитесь на первую тренировку и улучшите свою функциональность
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/book-trainer/dmitriy-kozlov"
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Записаться на тренировку
                </a>
                <a
                  href="/trainers"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Посмотреть других тренеров
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
