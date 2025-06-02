// components/admin/settings/components/SettingsErrorState.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { SettingsHeader } from './SettingsHeader';

interface SettingsErrorStateProps {
  onBack: () => void;
  onRetry: () => void;
}

export const SettingsErrorState = React.memo(({ onBack, onRetry }: SettingsErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SettingsHeader
        title="Настройки системы"
        subtitle="Ошибка загрузки"
        showBackButton={true}
        showActions={false}
        onBack={onBack}
      />
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Ошибка загрузки настроек</p>
          <Button onClick={onRetry} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    </div>
  );
});

SettingsErrorState.displayName = 'SettingsErrorState';
