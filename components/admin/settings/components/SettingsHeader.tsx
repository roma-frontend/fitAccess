// components/settings/SettingsHeader.tsx
"use client";

import React, { useState } from 'react';
import { ArrowLeft, Settings, Save, RotateCcw, HelpCircle, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showActions?: boolean;
  hasUnsavedChanges?: boolean;
  onBack?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  onHelp?: () => void;
  onNotifications?: () => void;
}

export function SettingsHeader({
  title,
  subtitle,
  showBackButton = true,
  showActions = true,
  hasUnsavedChanges = false,
  onBack,
  onSave,
  onReset,
  onHelp,
  onNotifications
}: SettingsHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleHelp = () => {
    if (onHelp) {
      onHelp();
    } else {
      toast({
        title: "Справка",
        description: "Здесь будет справочная информация по настройкам системы",
        variant: "default",
      });
    }
  };

  const handleNotifications = () => {
    if (onNotifications) {
      onNotifications();
    } else {
      toast({
        title: "Уведомления",
        description: "Настройки уведомлений открыты",
        variant: "default",
      });
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
      {/* Декоративная линия */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Кнопка назад */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="group p-2 hover:bg-orange-50 rounded-xl transition-all duration-200 sm:hidden transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
              </button>
            )}

            {/* Иконка настроек */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-orange-300 transition-all duration-300 transform hover:scale-105">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              {/* Индикатор несохраненных изменений */}
              {hasUnsavedChanges && (
                <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-400 border-2 border-white shadow-sm animate-pulse" />
              )}
            </div>

            {/* Информация о странице */}
            <div 
              className="min-w-0 flex-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate transition-all duration-300`}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Правая часть - действия */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Кнопка справки */}
              {(onHelp || true) && (
                <button
                  onClick={handleHelp}
                  className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Справка"
                >
                  <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>
              )}

              {/* Кнопка уведомлений */}
              {(onNotifications || true) && (
                <button
                  onClick={handleNotifications}
                  className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Уведомления"
                >
                  <Bell className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </button>
              )}

              {/* Кнопка сброса */}
              {onReset && (
                <button
                  onClick={onReset}
                  className="group p-2.5 hover:bg-yellow-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Сбросить"
                >
                  <RotateCcw className="h-5 w-5 text-gray-600 group-hover:text-yellow-600 transition-colors" />
                </button>
              )}

              {/* Кнопка сохранения */}
              {onSave && (
                <button
                  onClick={onSave}
                  className={`group p-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg ${
                    hasUnsavedChanges 
                      ? 'bg-green-100 hover:bg-green-200' 
                      : 'hover:bg-green-50'
                  }`}
                  aria-label="Сохранить"
                >
                  <Save className={`h-5 w-5 transition-colors ${
                    hasUnsavedChanges 
                      ? 'text-green-700' 
                      : 'text-gray-600 group-hover:text-green-600'
                  }`} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
