// components/admin/settings/components/SettingsLoadingState.tsx
"use client";

import React from 'react';
import { SettingsHeader } from './SettingsHeader';

interface SettingsLoadingStateProps {
  onBack: () => void;
}

export const SettingsLoadingState = React.memo(({ onBack }: SettingsLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SettingsHeader
        title="Настройки системы"
        subtitle="Загрузка..."
        showBackButton={true}
        showActions={false}
        onBack={onBack}
      />
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка настроек...</p>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsLoadingState.displayName = 'SettingsLoadingState';
