// components/auth/face-auth/components/FaceAuthStats.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function FaceAuthStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.4 }}
      className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
    >
      <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
          <p className="text-sm text-gray-600">Точность распознавания</p>
        </CardContent>
      </Card>
      
      <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">&lt;2s</div>
          <p className="text-sm text-gray-600">Время сканирования</p>
        </CardContent>
      </Card>
      
      <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">256-bit</div>
          <p className="text-sm text-gray-600">Шифрование данных</p>
        </CardContent>
      </Card>
      
      <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
          <p className="text-sm text-gray-600">Доступность системы</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
