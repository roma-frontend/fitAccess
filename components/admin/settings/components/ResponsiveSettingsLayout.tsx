// components/admin/settings/components/ResponsiveSettingsLayout.tsx (обновленная версия)
"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';

interface ResponsiveSettingsLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveSettingsLayout = ({ 
  children, 
  className,
  maxWidth = '2xl',
  padding = 'md'
}: ResponsiveSettingsLayoutProps) => {
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoint();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4',
    md: 'px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6',
    lg: 'px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8',
    xl: 'px-6 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12'
  };

  return (
    <div className={cn(
      // Базовые стили
      "w-full mx-auto",
      // Максимальная ширина
            maxWidthClasses[maxWidth],
      // Адаптивные отступы
      paddingClasses[padding],
      // Дополнительные адаптивные стили
      isMobile && "overflow-x-hidden",
      isTablet && "transition-all duration-300",
      isDesktop && "relative",
      className
    )}>
      {children}
    </div>
  );
};

