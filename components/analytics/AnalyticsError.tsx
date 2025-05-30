// components/analytics/AnalyticsError.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface AnalyticsErrorProps {
  error: string;
  onRetry?: () => void;
}

export function AnalyticsError({ error, onRetry }: AnalyticsErrorProps) {
  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ошибка загрузки аналитики</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{error}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Повторить попытку
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
