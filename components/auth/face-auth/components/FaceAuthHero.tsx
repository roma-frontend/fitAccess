// components/auth/face-auth/components/FaceAuthHero.tsx
"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface FaceAuthHeroProps {
  mode: 'login' | 'register';
}

export function FaceAuthHero({ mode }: FaceAuthHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center text-gray-900 mb-8"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-gray-200/50">
        <Award className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          Передовые технологии распознавания
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        {mode === 'login' ? 'Безопасный вход' : 'Настройка Face ID'}
        <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          через лицо
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto leading-relaxed">
        {mode === 'login' 
          ? 'Войдите в систему за секунды с помощью биометрической аутентификации'
          : 'Зарегистрируйте лицо для мгновенного и безопасного доступа'
        }
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 mb-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
            99.9%
          </div>
          <div className="text-sm text-gray-500">Точность</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
            &lt;2s
          </div>
          <div className="text-sm text-gray-500">Скорость</div>
        </div>
        <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
            256-bit
          </div>
          <div className="text-sm text-gray-500">Шифрование</div>
        </div>
      </div>
    </motion.div>
  );
}

