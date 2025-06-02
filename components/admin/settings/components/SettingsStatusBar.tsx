// components/admin/settings/components/SettingsStatusBar.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Download } from 'lucide-react';

interface SettingsStatusBarProps {
  lastSaved: Date | null;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const SettingsStatusBar = React.memo(({ 
  lastSaved, 
  onImport, 
  onExport 
}: SettingsStatusBarProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Последнее сохранение: {lastSaved.toLocaleString('ru-RU')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".json"
          onChange={onImport}
          className="hidden"
          id="import-settings"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('import-settings')?.click()}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Импорт
        </Button>
        <Button
          variant="outline"
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Экспорт
        </Button>
      </div>
    </div>
  );
});

SettingsStatusBar.displayName = 'SettingsStatusBar';
