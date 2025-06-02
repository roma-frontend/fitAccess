// components/admin/settings/components/UnsavedChangesAlert.tsx
"use client";

import React from 'react';
import { Info } from 'lucide-react';

interface UnsavedChangesAlertProps {
  hasUnsavedChanges: boolean;
}

export const UnsavedChangesAlert = React.memo(({ hasUnsavedChanges }: UnsavedChangesAlertProps) => {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-2 text-orange-800">
        <Info className="h-5 w-5" />
        <span className="font-medium">У вас есть несохраненные изменения</span>
      </div>
      <p className="text-sm text-orange-700 mt-1">
        Не забудьте сохранить изменения перед переходом на другую страницу.
      </p>
    </div>
  );
});

UnsavedChangesAlert.displayName = 'UnsavedChangesAlert';
