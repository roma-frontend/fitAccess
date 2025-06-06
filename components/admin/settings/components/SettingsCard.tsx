// components/admin/settings/components/SettingsCard.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  variant?: 'default' | 'compact' | 'full';
}

export const SettingsCard = ({
  title,
  description,
  children,
  className,
  headerActions,
  variant = 'default'
}: SettingsCardProps) => {
  return (
    <Card className={cn(
      "w-full transition-all duration-200",
      // Адаптивные отступы
      variant === 'compact' && "p-2 sm:p-4",
      variant === 'full' && "p-4 sm:p-6 lg:p-8",
      // Тени и границы
      "border border-gray-200/60 hover:border-gray-300/80",
      "shadow-sm hover:shadow-md",
      className
    )}>
      <CardHeader className={cn(
        "space-y-1",
        // Адаптивные отступы заголовка
        variant === 'compact' ? "pb-2 sm:pb-3" : "pb-4 sm:pb-6",
        // Responsive padding
        "px-3 sm:px-4 md:px-6",
        "pt-3 sm:pt-4 md:pt-6"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className={cn(
              "font-semibold text-gray-900",
              // Адаптивные размеры текста
              "text-base sm:text-lg md:text-xl",
              "leading-tight"
            )}>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className={cn(
                "text-gray-600",
                // Адаптивные размеры описания
                "text-xs sm:text-sm md:text-base",
                "leading-relaxed"
              )}>
                {description}
              </CardDescription>
            )}
          </div>
          {headerActions && (
            <div className="flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(
        // Адаптивные отступы контента
        "px-3 sm:px-4 md:px-6",
        "pb-3 sm:pb-4 md:pb-6",
        variant === 'compact' ? "pt-0" : "pt-2"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};
