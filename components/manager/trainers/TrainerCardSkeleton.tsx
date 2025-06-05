// components/manager/trainers/TrainerCardSkeleton.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function TrainerCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Специализации */}
        <div className="flex gap-1 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>

        {/* Контакты */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex gap-2">
          <div className="h-9 flex-1 bg-gray-200 rounded"></div>
          <div className="h-9 flex-1 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
