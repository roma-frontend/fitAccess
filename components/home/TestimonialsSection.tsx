"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

function TestimonialCard({ name, role, content, rating, avatar }: TestimonialProps) {
  return (
    <Card className={combineAnimations(
      "hover:shadow-xl bg-white border-2 rounded-2xl",
      ANIMATION_CLASSES.transition.all,
      ANIMATION_CLASSES.hover.translateY
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        
        <div className="relative mb-6">
          <Quote className="h-8 w-8 text-blue-200 absolute -top-2 -left-2" />
          <p className="text-gray-700 italic pl-6">{content}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {avatar}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Мария Иванова",
      role: "Постоянный клиент",
      content: "Отличный фитнес-центр! Современное оборудование, профессиональные тренеры и удобное приложение для записи. Рекомендую всем!",
      rating: 5,
      avatar: "МИ",
    },
    {
      name: "Алексей Петров",
      role: "Участник 2 года",
      content: "Благодаря персональным тренировкам с Михаилом смог набрать 15 кг мышечной массы. Система питания и тренировок работает идеально!",
      rating: 5,
      avatar: "АП",
    },
    {
      name: "Елена Сидорова",
      role: "Любитель йоги",
      content: "Занятия йогой с Анной - это что-то невероятное! Атмосфера спокойствия и профессионализм на высшем уровне.",
      rating: 5,
      avatar: "ЕС",
    },
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          💬 Отзывы наших клиентов
        </h2>
        <p className="text-xl text-gray-600">
          Узнайте, что говорят о нас наши участники
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </div>
  );
}
