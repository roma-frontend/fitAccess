// components/auth/face-scanner/loading-indicators.tsx
"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LoadingIndicatorsProps } from "./types";

export const LoadingIndicators = memo(function LoadingIndicators({ type }: LoadingIndicatorsProps) {
  if (type === "initialization") {
    return <InitializationLoader />;
  }
  
  if (type === "models") {
    return <ModelsLoader />;
  }
  
  if (type === "library") {
    return <LibraryLoader />;
  }
  
  return null;
});

const InitializationLoader = memo(function InitializationLoader() {
  return (
    <div className="space-y-6">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Инициализация системы...</p>
          </div>
        </div>
      </div>
    </div>
  );
});

const ModelsLoader = memo(function ModelsLoader() {
  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
          <div>
            <p className="font-medium text-yellow-900">Загрузка моделей распознавания...</p>
            <p className="text-sm text-yellow-800">
              Пожалуйста, подождите. Это может занять несколько секунд.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const LibraryLoader = memo(function LibraryLoader() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <p className="font-medium text-blue-900">Загрузка библиотеки распознавания...</p>
            <p className="text-sm text-blue-800">
              Инициализация системы распознавания лиц.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
