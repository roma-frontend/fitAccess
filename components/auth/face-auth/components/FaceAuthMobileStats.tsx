// components/auth/face-auth/components/FaceAuthMobileStats.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { FaceAuthProps } from "../types";

export function FaceAuthMobileStats({ scanCount, lastScanTime }: FaceAuthProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{scanCount}</div>
              <p className="text-sm text-gray-600">Сканирований</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {lastScanTime ? lastScanTime.toLocaleTimeString().slice(0, 5) : '--:--'}
              </div>
              <p className="text-sm text-gray-600">Последнее</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
