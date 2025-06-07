// components/auth/face-auth/components/FaceAuthMobileInstructions.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function FaceAuthMobileInstructions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Инструкции:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Убедитесь в хорошем освещении</li>
            <li>• Поместите лицо в центр кадра</li>
            <li>• Дождитесь зеленой рамки</li>
            <li>• Данные отправятся автоматически</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
