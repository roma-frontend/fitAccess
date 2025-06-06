// components/admin/settings/components/SettingsHeader.tsx
"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Save, 
  Download, 
  Upload, 
  RotateCcw,
  Settings,
  Bell,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { MobileSettingsNavigation } from './MobileSettingsNavigation';

export interface SettingsHeaderProps {
  /** Заголовок страницы настроек */
  title: string;
  /** Подзаголовок или описание */
  subtitle?: string;
  /** Есть ли несохраненные изменения */
  hasUnsavedChanges?: boolean;
  /** Показывать ли кнопку "Назад" */
  showBackButton?: boolean;
  /** Показывать ли кнопки действий */
  showActions?: boolean;
  /** Мобильное устройство */
  isMobile?: boolean;
  /** Планшет */
  isTablet?: boolean;
  /** Идет ли сохранение */
  saving?: boolean;
  /** Обработчик нажатия на кнопку "Назад" */
  onBack?: () => void;
  /** Обработчик сохранения */
  onSave?: () => void;
  /** Обработчик сброса настроек */
  onReset?: () => void;
  /** Обработчик экспорта */
  onExport?: () => void;
  /** Обработчик импорта */
  onImport?: () => void;
  /** Обработчик справки */
  onHelp?: () => void;
  /** Обработчик уведомлений */
  onNotifications?: () => void;
}

export function SettingsHeader({
  title,
  subtitle,
  hasUnsavedChanges = false,
  showBackButton = true,
  showActions = true,
  isMobile = false,
  isTablet = false,
  saving = false,
  onBack,
  onSave,
  onReset,
  onExport,
  onImport,
  onHelp,
  onNotifications
}: SettingsHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Определяем иконку устройства для отладки
  const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Monitor;

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
      {/* Декоративная линия */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      {/* Индикатор несохраненных изменений */}
      {hasUnsavedChanges && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 animate-pulse" />
      )}
      
      <div className={`px-4 py-3 ${isMobile ? '' : 'sm:px-6 sm:py-4'}`}>
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Кнопка назад с анимацией */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            )}

            {/* Иконка настроек с анимацией */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-spin-slow" />
              </div>
              
              {/* Индикатор статуса */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
                hasUnsavedChanges 
                  ? 'bg-orange-400 animate-pulse' 
                  : saving 
                    ? 'bg-blue-400 animate-spin'
                    : 'bg-green-400'
              }`} />
            </div>

            {/* Информация о настройках с анимацией */}
            <div 
              className="min-w-0 flex-1 cursor-pointer group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center gap-2">
                <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate transition-all duration-300 ${
                  isHovered ? 'from-blue-600 to-purple-600' : ''
                }`}>
                  {title}
                </h1>
                
                {/* Индикатор устройства для отладки */}
                {process.env.NODE_ENV === 'development' && (
                  <DeviceIcon className="h-4 w-4 text-gray-400 opacity-50" />
                )}
              </div>
              
              {/* Подзаголовок и статус */}
              {(subtitle || hasUnsavedChanges || saving) && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {/* Иконка статуса */}
                  {saving ? (
                    <CheckCircle className="h-3 w-3 text-blue-500 animate-spin" />
                  ) : hasUnsavedChanges ? (
                    <AlertTriangle className="h-3 w-3 text-orange-500 animate-pulse" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  
                  <p className="text-sm text-gray-500 truncate">
                    {saving 
                      ? 'Сохранение...' 
                      : hasUnsavedChanges 
                        ? 'Есть несохраненные изменения'
                        : subtitle || 'Все настройки сохранены'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая часть - действия */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2">
              {isMobile ? (
                /* Мобильное меню */
                <MobileSettingsNavigation
                  hasUnsavedChanges={hasUnsavedChanges}
                  onSave={onSave || (() => {})}
                  onImport={onImport || (() => {})}
                  onExport={onExport || (() => {})}
                  onReset={onReset || (() => {})}
                  saving={saving}
                />
              ) : (
                /* Десктопные кнопки */
                <>
                  {/* Кнопка справки */}
                  {onHelp && (
                    <button
                      onClick={onHelp}
                      className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 hidden lg:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                      aria-label="Справка"
                    >
                      <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  )}

                  {/* Кнопка уведомлений */}
                  {onNotifications && (
                    <button
                      onClick={onNotifications}
                      className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 hidden lg:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                      aria-label="Уведомления"
                    >
                      <Bell className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </button>
                  )}

                  {/* Кнопка экспорта */}
                  {onExport && (
                    <button
                      onClick={onExport}
                      disabled={saving}
                      className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Экспорт настроек"
                    >
                      <Download className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                    </button>
                  )}

                  {/* Кнопка импорта */}
                  {onImport && (
                    <button
                      onClick={onImport}
                      disabled={saving}
                      className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Импорт настроек"
                    >
                      <Upload className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  )}

                  {/* Кнопка сохранения */}
                  {onSave && hasUnsavedChanges && (
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className="group p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Сохранить изменения"
                    >
                      <Save className="h-5 w-5 text-white transition-colors" />
                    </button>
                  )}

                  {/* Кнопка меню */}
                  <button
                    className="group p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                    aria-label="Меню"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
