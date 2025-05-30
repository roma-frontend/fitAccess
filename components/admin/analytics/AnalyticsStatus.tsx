// components/analytics/AnalyticsStatus.tsx
"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useAnalyticsAvailability } from "@/hooks/useAnalytics";

export function AnalyticsStatus() {
  const { isAvailable, isLoading } = useAnalyticsAvailability();

  if (isLoading) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Проверка доступности аналитики...
        </AlertDescription>
      </Alert>
    );
  }

  if (isAvailable) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>Аналитика работает в реальном времени</span>
            <Badge variant="outline" className="border-green-600 text-green-600">
              Онлайн
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <XCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex items-center justify-between">
          <span>Convex функции недоступны. Показаны демо-данные.</span>
          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
            Демо
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
}
