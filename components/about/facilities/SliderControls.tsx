// components/about/facilities/SliderControls.tsx
"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";

interface SliderControlsProps {
  isAutoplayActive: boolean;
  onToggleAutoplay: () => void;
  onReset: () => void;
  currentSlide: number;
  totalSlides: number;
}

export function SliderControls({
  isAutoplayActive,
  onToggleAutoplay,
  onReset,
  currentSlide,
  totalSlides
}: SliderControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="flex items-center justify-center gap-4 mt-6"
    >
      {/* Autoplay Toggle */}
      <motion.button
        onClick={onToggleAutoplay}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isAutoplayActive ? (
          <Pause className="h-4 w-4 text-gray-700" />
        ) : (
          <Play className="h-4 w-4 text-gray-700" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {isAutoplayActive ? 'Пауза' : 'Воспроизвести'}
        </span>
      </motion.button>

      {/* Reset Button */}
      <motion.button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RotateCcw className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">Сначала</span>
      </motion.button>

      {/* Slide Counter */}
      <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
        <span className="text-sm font-medium text-gray-700">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>
    </motion.div>
  );
}
