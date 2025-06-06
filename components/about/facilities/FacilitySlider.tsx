// components/about/facilities/FacilitySlider.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useIsClient } from "@/hooks/useIsClient";
import { NoSSR } from "@/components/NoSSR";

interface FacilitySliderProps {
  facilities: any[];
  activeSlide: number;
  isTransitioning: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSlideChange: (index: number) => void;
  isInView: boolean;
}

export function FacilitySlider({
  facilities,
  activeSlide,
  isTransitioning,
  onNext,
  onPrev,
  onSlideChange,
  isInView
}: FacilitySliderProps) {
  const isClient = useIsClient();
  const [direction, setDirection] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentFacility = facilities[activeSlide];
  const CurrentIcon = currentFacility.icon;

  // Предзагрузка следующего изображения только на клиенте
  useEffect(() => {
    if (!isClient) return;
    
    const nextIndex = (activeSlide + 1) % facilities.length;
    const nextImage = new window.Image();
    nextImage.src = facilities[nextIndex].image;
  }, [activeSlide, facilities, isClient]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const contentVariants = {
    enter: {
      y: 30,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -30,
      opacity: 0,
    },
  };

  const handleNext = () => {
    setDirection(1);
    onNext();
  };

  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  const handleDotClick = (index: number) => {
    setDirection(index > activeSlide ? 1 : -1);
    onSlideChange(index);
  };

  // Статичная версия для SSR
  const StaticSlider = () => (
    <div className="relative max-w-6xl mx-auto mb-16">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <Image
          src={currentFacility.image}
          alt={currentFacility.name}
          width={1200}
          height={600}
          className="w-full h-96 md:h-[500px] object-cover"
          priority
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${currentFacility.color} rounded-xl flex items-center justify-center`}>
              <CurrentIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold">{currentFacility.name}</h3>
          </div>
          
          <p className="text-xl mb-6 max-w-2xl">
            {currentFacility.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {currentFacility.features.map((feature: string, index: number) => (
              <Badge key={index} className="bg-white/20 text-white border-white/30">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Статичные кнопки навигации */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Статичные индикаторы */}
      <div className="flex justify-center mt-6 gap-2">
        {facilities.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`rounded-full transition-all duration-300 ${
              index === activeSlide 
                ? 'bg-blue-600 w-8 h-3' 
                : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
            }`}
          />
        ))}
      </div>
    </div>
  );

  // Анимированная версия для клиента
  const AnimatedSlider = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative max-w-6xl mx-auto mb-16"
    >
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 },
            }}
            className="relative"
          >
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Image
                src={currentFacility.image}
                alt={currentFacility.name}
                width={1200}
                height={600}
                className="w-full h-96 md:h-[500px] object-cover"
                priority={activeSlide === 0}
                onLoad={() => setImageLoaded(true)}
                style={{
                  filter: isTransitioning ? 'blur(1px)' : 'blur(0px)',
                  transition: 'filter 0.3s ease-out'
                }}
              />
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              />
            </motion.div>
            
            <motion.div
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute bottom-0 left-0 right-0 p-8 text-white"
            >
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-3 mb-4"
              >
                <motion.div 
                  className={`w-12 h-12 bg-gradient-to-r ${currentFacility.color} rounded-xl flex items-center justify-center`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CurrentIcon className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold">{currentFacility.name}</h3>
              </motion.div>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl mb-6 max-w-2xl"
              >
                {currentFacility.description}
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-2"
              >
                {currentFacility.features.map((feature: string, index: number) => (
                  <motion.div
                    key={feature}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.6 + index * 0.1,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {feature}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Анимированные кнопки навигации */}
        <motion.button
          onClick={handlePrev}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 disabled:opacity-50 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
        
        <motion.button
          onClick={handleNext}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 disabled:opacity-50 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
      </div>

      {/* Анимированные индикаторы */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="flex justify-center mt-6 gap-2"
      >
        {facilities.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleDotClick(index)}
            disabled={isTransitioning}
            className={`relative overflow-hidden rounded-full transition-all duration-300 ${
              index === activeSlide 
                ? 'bg-blue-600 w-8 h-3' 
                : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {index === activeSlide && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 bg-blue-600 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((activeSlide + 1) / facilities.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <NoSSR fallback={<StaticSlider />}>
      <AnimatedSlider />
    </NoSSR>
  );
}

