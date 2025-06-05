// components/about/AboutTestimonials.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export function AboutTestimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Анна Петрова",
      role: "Маркетолог",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142777/about-images/pkvybhpw4igk65ur6hfm.jpg",
      rating: 5,
      text: "FitAccess полностью изменил мой образ жизни! За 6 месяцев я не только похудела на 15 кг, но и обрела уверенность в себе. Тренеры здесь — настоящие профессионалы, которые всегда поддержат и мотивируют.",
      achievement: "Похудела на 15 кг за 6 месяцев"
    },
    {
      name: "Михаил Иванов",
      role: "IT-специалист",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142977/about-images/pzoveymixwolabezf7s0.webp",
      rating: 5,
      text: "Работая в офисе, я забыл, что такое хорошая физическая форма. В FitAccess мне составили индивидуальную программу, учитывающую мой график. Теперь я чувствую себя на 10 лет моложе!",
      achievement: "Набрал 8 кг мышечной массы"
    },
    {
      name: "Елена Смирнова",
      role: "Врач",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749143075/about-images/nd1z0ig7uacqy8uer9ga.webp",
      rating: 5,
      text: "После рождения ребенка думала, что никогда не верну прежнюю форму. Благодаря персональному тренеру и программе восстановления в FitAccess, я не только вернулась в форму, но и стала сильнее, чем была!",
      achievement: "Восстановилась после родов"
    },
    {
      name: "Дмитрий Козлов",
      role: "Предприниматель",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749143196/about-images/ksx7yjsv9iklsd4mt9ci.webp",
      rating: 5,
      text: "Ценю время превыше всего. В FitAccess каждая минута тренировки максимально эффективна. Современное оборудование, профессиональные тренеры и отличная атмосфера — всё, что нужно занятому человеку.",
      achievement: "Улучшил выносливость на 40%"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Истории наших клиентов
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Реальные результаты реальных людей, которые изменили свою жизнь с FitAccess
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
                    <Card className="relative overflow-hidden shadow-2xl border-0 bg-white">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-12">
                {/* Quote Icon */}
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Quote className="h-6 w-6 text-white" />
                </div>

                {/* Navigation */}
                <div className="absolute top-6 right-6 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white p-0"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white p-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* User Info */}
                  <div className="text-center md:text-left">
                    <div className="relative w-24 h-24 mx-auto md:mx-0 mb-4">
                      <Image
                        src={testimonials[currentTestimonial].image}
                        alt={testimonials[currentTestimonial].name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-full border-4 border-white/30"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {testimonials[currentTestimonial].name}
                    </h3>
                    <p className="text-blue-200 mb-3">
                      {testimonials[currentTestimonial].role}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex justify-center md:justify-start gap-1 mb-3">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Achievement Badge */}
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white font-medium">
                      {testimonials[currentTestimonial].achievement}
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="md:col-span-2">
                    <blockquote className="text-lg md:text-xl text-white leading-relaxed italic">
                      "{testimonials[currentTestimonial].text}"
                    </blockquote>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              className={`cursor-pointer transition-all duration-300 ${
                index === currentTestimonial ? 'scale-105' : 'hover:scale-105'
              }`}
              onClick={() => setCurrentTestimonial(index)}
            >
              <Card className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                index === currentTestimonial ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'
              }`}>
                <CardContent className="p-6 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1">
                    {testimonial.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {testimonial.role}
                  </p>
                  
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-3">
                    {testimonial.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 bg-white rounded-3xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Довольных клиентов</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">4.9</div>
              <div className="text-gray-600">Средний рейтинг</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
              <div className="text-gray-600">Достигли целей</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">92%</div>
              <div className="text-gray-600">Рекомендуют друзьям</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

