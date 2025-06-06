// components/admin/settings/components/SettingsGrid.tsx
"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface SettingsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  variant?: 'default' | 'compact' | 'spacious';
}

export const SettingsGrid = ({
  children,
  columns = 2,
  className,
  variant = 'default'
}: SettingsGridProps) => {
  const getGridClasses = () => {
    const baseClasses = "grid w-full";
    
    const columnClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 lg:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    };

    const gapClasses = {
      compact: "gap-2 sm:gap-3 md:gap-4",
      default: "gap-3 sm:gap-4 md:gap-6",
      spacious: "gap-4 sm:gap-6 md:gap-8"
    };

    return cn(
      baseClasses,
      columnClasses[columns],
      gapClasses[variant]
    );
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};
