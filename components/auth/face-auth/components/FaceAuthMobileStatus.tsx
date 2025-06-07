// components/auth/face-auth/components/FaceAuthMobileStatus.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface FaceAuthMobileStatusProps {
  isOnline: boolean;
  sessionId: string;
}

export function FaceAuthMobileStatus({ isOnline, sessionId }: FaceAuthMobileStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {isOnline ? 'Подключено' : 'Нет соединения'}
                </p>
                <p className="text-sm text-gray-500">
                  Session: {sessionId}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"} className="bg-white/80">
              {isOnline ? 'Онлайн' : 'Офлайн'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
