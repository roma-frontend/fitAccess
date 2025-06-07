// components/auth/face-auth/components/FaceAuthMobileHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

interface FaceAuthMobileHeaderProps {
  onSwitchMode: (mode: 'desktop' | 'mobile') => void;
}

export function FaceAuthMobileHeader({ onSwitchMode }: FaceAuthMobileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center text-gray-900 mt-8"
    >
      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-gray-200/50">
        <Smartphone className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Mobile Scanner</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">
        Сканирование лица
      </h1>
      <p className="text-gray-600">
        Безопасный вход с мобильного устройства
      </p>
    </motion.div>
  );
}
