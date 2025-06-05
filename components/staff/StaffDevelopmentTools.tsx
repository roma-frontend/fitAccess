"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StaffDevelopmentToolsProps {
  isLoading: boolean;
  onQuickLogin: () => Promise<void>; // ✅ Добавляем Promise<void>
}

export const StaffDevelopmentTools = memo(function StaffDevelopmentTools({
  isLoading,
  onQuickLogin
}: StaffDevelopmentToolsProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-900">
          🧪 Быстрый вход (разработка)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={onQuickLogin}
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Входим...
            </>
          ) : (
            "👑 Быстрый вход супер-админа"
          )}
        </Button>
        <p className="text-xs text-yellow-700 text-center">
          Только для тестирования в режиме разработки
        </p>
      </CardContent>
    </Card>
  );
});
