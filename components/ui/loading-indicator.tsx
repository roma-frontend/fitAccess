// components/ui/loading-indicator.tsx
"use client";

import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingIndicatorProps {
  loading: boolean;
  error: string | null;
  dataCount?: number;
  dataType?: string;
}

export function LoadingIndicator({ 
  loading, 
  error, 
  dataCount = 0, 
  dataType = "записей" 
}: LoadingIndicatorProps) {
  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-blue-900">Загрузка данных...</p>
              <p className="text-sm text-blue-700">Синхронизация с сервером</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Режим оффлайн</p>
              <p className="text-sm text-orange-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Данные актуальны</p>
            <p className="text-sm text-green-700">
              Загружено {dataCount} {dataType} • Синхронизация в реальном времени
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}