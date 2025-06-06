// app/admin/settings/components/SettingsOperationSkeletons.tsx
"use client";

import React from 'react';

// Скелетон для операций загрузки/сохранения
export const SettingsOperationSkeleton = React.memo(({ operation }: { operation: string }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{operation}</h3>
            <p className="text-sm text-gray-600">Пожалуйста, подождите...</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Скелетон для импорта настроек
export const SettingsImportSkeleton = React.memo(() => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Импорт настроек</h3>
            <p className="text-sm text-gray-600">Загружаем и применяем конфигурацию...</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500">Проверка файла конфигурации</p>
        </div>
      </div>
    </div>
  );
});

// Скелетон для экспорта настроек
export const SettingsExportSkeleton = React.memo(() => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Экспорт настроек</h3>
            <p className="text-sm text-gray-600">Подготавливаем файл конфигурации...</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-gray-500">Сборка данных для экспорта</p>
        </div>
      </div>
    </div>
  );
});

// Скелетон для сброса настроек
export const SettingsResetSkeleton = React.memo(() => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Сброс настроек</h3>
            <p className="text-sm text-gray-600">Восстанавливаем значения по умолчанию...</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '30%' }}></div>
          </div>
          <p className="text-xs text-gray-500">Очистка пользовательских настроек</p>
        </div>
      </div>
    </div>
  );
});

// Скелетон для валидации настроек
export const SettingsValidationSkeleton = React.memo(() => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Валидация настроек</h3>
            <p className="text-sm text-gray-600">Проверяем корректность конфигурации...</p>
          </div>
          
          {/* Progress steps */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Проверка синтаксиса</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Валидация значений</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Проверка зависимостей</span>
            </div>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Display names
SettingsOperationSkeleton.displayName = 'SettingsOperationSkeleton';
SettingsImportSkeleton.displayName = 'SettingsImportSkeleton';
SettingsExportSkeleton.displayName = 'SettingsExportSkeleton';
SettingsResetSkeleton.displayName = 'SettingsResetSkeleton';
SettingsValidationSkeleton.displayName = 'SettingsValidationSkeleton';
