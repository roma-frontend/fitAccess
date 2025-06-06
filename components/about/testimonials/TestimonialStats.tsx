// components/about/testimonials/TestimonialStats.tsx
"use client";

import { motion } from "framer-motion";
import { statisticsData } from "./testimonialsData";
import { useEffect, useState } from "react";

interface TestimonialStatsProps {
  isInView: boolean;
  isMounted: boolean;
}

export function TestimonialStats({ isInView, isMounted }: TestimonialStatsProps) {
  const [animatedValues, setAnimatedValues] = useState<string[]>([]);

  useEffect(() => {
    if (isInView && isMounted) {
      // Анимация чисел только после монтирования
      statisticsData.forEach((stat, index) => {
        const value = stat.value;
        const isPercentage = value.includes('%');
        const isDecimal = value.includes('.');
        
        if (isPercentage) {
          const targetNumber = parseInt(value.replace('%', ''));
          animateNumber(0, targetNumber, 2000, index, '%');
        } else if (isDecimal) {
          const targetNumber = parseFloat(value);
          animateDecimal(0, targetNumber, 2000, index);
        }
      });
    }
  }, [isInView, isMounted]);

  const animateNumber = (start: number, end: number, duration: number, index: number, suffix: string = '') => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * easeOutQuart);
      
      setAnimatedValues(prev => {
        const newValues = [...prev];
        newValues[index] = current + suffix;
        return newValues;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const animateDecimal = (start: number, end: number, duration: number, index: number) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = (start + (end - start) * easeOutQuart).toFixed(1);
      
      setAnimatedValues(prev => {
        const newValues = [...prev];
        newValues[index] = current;
        return newValues;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.6,
        staggerChildren: 0.2,
        delayChildren: 1.8
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-white rounded-3xl p-8 shadow-lg relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      {/* Floating Elements - только после монтирования */}
      {isMounted && (
        <>
          <motion.div
            className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </>
      )}

      <motion.h3 
        variants={itemVariants}
        className="text-2xl font-bold text-gray-900 mb-8 text-center relative z-10"
      >
        Наши достижения
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative z-10">
        {statisticsData.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="group"
            whileHover={isMounted ? { y: -5 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="relative"
              whileHover={isMounted ? { scale: 1.05 } : {}}
              transition={{ duration: 0.3 }}
            >
              {/* Icon with Animation - только после монтирования */}
              <motion.div
                className="text-4xl mb-2"
                animate={isMounted ? {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={isMounted ? {
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                } : {}}
              >
                {stat.icon}
              </motion.div>

              {/* Animated Number */}
              <motion.div 
                className={`text-3xl font-bold mb-2 ${stat.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 2 + index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
              >
                {isMounted ? (
                  <motion.span
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(59, 130, 246, 0)",
                        "0 0 10px rgba(59, 130, 246, 0.3)",
                        "0 0 0px rgba(59, 130, 246, 0)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    {animatedValues[index] || stat.value}
                  </motion.span>
                ) : (
                  <span>{stat.value}</span>
                )}
              </motion.div>

              {/* Label */}
              <motion.div 
                className="text-gray-600 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.2 + index * 0.1 }}
              >
                {stat.label}
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 2.5 + index * 0.1 }}
              >
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    index === 0 ? 'from-blue-500 to-blue-600' :
                    index === 1 ? 'from-green-500 to-green-600' :
                    index === 2 ? 'from-purple-500 to-purple-600' :
                    'from-orange-500 to-orange-600'
                  } rounded-full`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 3 + index * 0.2,
                    ease: "easeOut"
                  }}
                />
              </motion.div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
