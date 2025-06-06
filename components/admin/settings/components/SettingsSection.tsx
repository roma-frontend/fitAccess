// components/admin/settings/components/SettingsSection.tsx
"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

export const SettingsSection = ({
  title,
  description,
  children,
  className,
  spacing = 'normal'
}: SettingsSectionProps) => {
  const spacingClasses = {
    tight: "space-y-2 sm:space-y-3",
    normal: "space-y-3 sm:space-y-4 md:space-y-6",
    loose: "space-y-4 sm:space-y-6 md:space-y-8"
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {(title || description) && (
        <div className="space-y-1 sm:space-y-2">
          {title && (
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
};
