// components/about/testimonials/CallToAction.tsx
"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface CallToActionProps {
  isInView: boolean;
  isMounted: boolean;
}

export function CallToAction({ isInView, isMounted }: CallToActionProps) {
  // Генерируем фиксированные позиции для частиц
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: (i * 5.26) % 100, // Фиксированные позиции вместо Math.random()
      top: (i * 7.89) % 100,
      delay: i * 0.15,
    }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 2 }}
      className="text-center mt-16"
    >
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden"
        whileHover={isMounted ? { scale: 1.02 } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Background Pattern - только после монтирования */}
        {isMounted && (
          <div className="absolute inset-0 opacity-20">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
            Готовы изменить свою жизнь?
          </motion.h3>
          
          <motion.p
            className="text-lg mb-6 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 2.4 }}
          >
            Присоединяйтесь к тысячам довольных клиентов FitAccess
          </motion.p>
          
          <motion.button
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 2.6, type: "spring" }}
            whileHover={isMounted ? { scale: 1.05, y: -2 } : {}}
            whileTap={isMounted ? { scale: 0.95 } : {}}
          >
            Начать тренировки
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
