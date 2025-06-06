// components/about/testimonials/TestimonialGrid.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

interface TestimonialGridProps {
  testimonials: any[];
  currentTestimonial: number;
  onChange: (index: number) => void;
  isInView: boolean;
  isMounted: boolean;
}

export function TestimonialGrid({
  testimonials,
  currentTestimonial,
  onChange,
  isInView,
  isMounted
}: TestimonialGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1.4
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateY: 0,
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
    >
      {testimonials.map((testimonial, index) => {
        const isActive = index === currentTestimonial;
        
        return (
          <motion.div
            key={testimonial.id}
            variants={itemVariants}
            className="cursor-pointer group perspective-1000"
            onClick={() => onChange(index)}
            whileHover={isMounted ? { 
              y: -10,
              rotateY: 5,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            } : {}}
            whileTap={isMounted ? { scale: 0.95 } : {}}
          >
            <Card 
              className={`h-full shadow-lg transition-all duration-500 border-2 relative overflow-hidden transform-gpu ${
                isActive 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-blue-200 shadow-xl' 
                  : 'border-transparent bg-white hover:shadow-xl'
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Active Glow Effect - только после монтирования */}
              {isActive && isMounted && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-lg"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <CardContent className="p-6 text-center relative z-10">
                {/* Avatar with Enhanced Animation */}
                <motion.div 
                  className="relative w-16 h-16 mx-auto mb-4"
                  animate={isMounted ? {
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? [0, 5, -5, 0] : 0,
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {/* Pulse Ring for Active - только после монтирования */}
                  {isActive && isMounted && (
                    <motion.div
                      className="absolute inset-0 bg-blue-400/30 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                                        width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full relative z-10 border-2 border-white shadow-lg"
                  />
                  
                  {/* Status Indicator */}
                  <motion.div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    animate={isMounted ? {
                      scale: isActive ? [1, 1.2, 1] : 1,
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: isActive && isMounted ? Infinity : 0,
                    }}
                  />
                </motion.div>
                
                {/* Name with Color Animation */}
                <motion.h3 
                  className={`font-bold mb-1 transition-colors duration-300 ${
                    isActive ? 'text-blue-600' : 'text-gray-900'
                  }`}
                  animate={isMounted ? {
                    scale: isActive ? 1.05 : 1,
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {testimonial.name}
                </motion.h3>
                
                <motion.p 
                  className="text-gray-600 text-sm mb-3"
                  animate={isMounted ? {
                    opacity: isActive ? 1 : 0.8,
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {testimonial.role}
                </motion.p>
                
                {/* Animated Stars */}
                <motion.div 
                  className="flex justify-center gap-1 mb-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.3 + i * 0.1,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={isMounted ? { scale: 1.2, rotate: 15 } : {}}
                    >
                      <Star className={`h-4 w-4 fill-current transition-colors duration-300 ${
                        isActive ? 'text-yellow-400' : 'text-yellow-400'
                      }`} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Text with Gradient on Active */}
                <motion.p 
                  className={`text-sm line-clamp-3 leading-relaxed transition-all duration-300 ${
                    isActive 
                      ? 'text-gray-800 font-medium' 
                      : 'text-gray-700'
                  }`}
                  animate={isMounted ? {
                    opacity: isActive ? 1 : 0.9,
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {testimonial.text}
                </motion.p>

                {/* Achievement Badge */}
                <motion.div
                  className={`mt-3 text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  animate={isMounted ? {
                    scale: isActive ? 1.05 : 1,
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {testimonial.achievement}
                </motion.div>

                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

