// components/about/AboutFacilities.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Users, 
  Waves, 
  Heart, 
  Zap, 
  Shield,
  ChevronLeft,
  ChevronRight,
  MapPin
} from "lucide-react";
import Image from "next/image";

export function AboutFacilities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeSlide, setActiveSlide] = useState(0);

  const facilities = [
    {
      name: "Тренажерный зал",
      description: "Современное оборудование от ведущих мировых производителей",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749141729/about-images/oqqokgej7dmw3d91o531.avif",
      features: ["50+ тренажеров", "Свободные веса", "Кардио-зона"],
      icon: Dumbbell,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Групповые залы",
      description: "Просторные залы для групповых тренировок с профессиональным звуком",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749141728/about-images/ikr6tc8jjgjkwxelbl9e.jpg",
      features: ["3 зала", "Зеркальные стены", "Профессиональный звук"],
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    {
      name: "Бассейн",
      description: "25-метровый бассейн с системой очистки воды последнего поколения",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749141729/about-images/hojidmxqrgmp3vvmodag.avif",
      features: ["25м длина", "4 дорожки", "Детская зона"],
      icon: Waves,
      color: "from-cyan-500 to-blue-500"
    },
    {
      name: "SPA-зона",
      description: "Расслабляющие процедуры для восстановления после тренировок",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142228/about-images/kxjtecg7bawvwsuoleex.jpg",
      features: ["Сауна", "Массажные кабинеты", "Зона отдыха"],
      icon: Heart,
      color: "from-pink-500 to-red-500"
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % facilities.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + facilities.length) % facilities.length);
  };

  // Получаем текущую иконку
  const CurrentIcon = facilities[activeSlide].icon;

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Наши возможности
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Современная инфраструктура для комфортных и эффективных тренировок
          </p>
        </motion.div>

        {/* Main Facility Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-6xl mx-auto mb-16"
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src={facilities[activeSlide].image}
              alt={facilities[activeSlide].name}
              width={1200}
              height={600}
              className="w-full h-96 md:h-[500px] object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${facilities[activeSlide].color} rounded-xl flex items-center justify-center`}>
                  <CurrentIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">{facilities[activeSlide].name}</h3>
              </div>
              
              <p className="text-xl mb-6 max-w-2xl">
                {facilities[activeSlide].description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {facilities[activeSlide].features.map((feature, index) => (
                  <Badge key={index} className="bg-white/20 text-white border-white/30">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {facilities.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeSlide 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Facility Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {facilities.map((facility, index) => {
            const FacilityIcon = facility.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                className={`cursor-pointer transition-all duration-300 ${
                  index === activeSlide ? 'scale-105' : 'hover:scale-105'
                }`}
                onClick={() => setActiveSlide(index)}
              >
                <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                  index === activeSlide ? 'border-blue-500' : 'border-transparent'
                }`}>
                  <div className={`w-12 h-12 bg-gradient-to-r ${facility.color} rounded-xl flex items-center justify-center mb-4`}>
                    <FacilityIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {facility.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {facility.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white rounded-3xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Дополнительные удобства
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Безопасность</h4>
              <p className="text-gray-600">Система видеонаблюдения и контроля доступа</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Технологии</h4>
              <p className="text-gray-600">Wi-Fi, мобильное приложение, умные тренажеры</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Расположение</h4>
              <p className="text-gray-600">Удобное расположение в центре города</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
