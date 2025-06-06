// app/admin/settings/page.tsx
"use client";

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsManager } from '@/hooks/useSettingsManager';
import { useSettingsImportExport } from '@/hooks/useSettingsImportExport';
import { useSettingsActions } from '@/hooks/useSettingsActions';
import { SettingsHeader } from '@/components/admin/settings/components/SettingsHeader';
import { SettingsLoadingState } from '@/components/admin/settings/components/SettingsLoadingState';
import { SettingsErrorState } from '@/components/admin/settings/components/SettingsErrorState';
import { UnsavedChangesAlert } from '@/components/admin/settings/components/UnsavedChangesAlert';
import { SettingsStatusBar } from '@/components/admin/settings/components/SettingsStatusBar';
import { SettingsTabs } from '@/components/admin/settings/components/SettingsTabs';
// ✅ ИСПРАВЛЯЕМ ИМПОРТ - УБИРАЕМ SettingsOperationSkeleton ОТСЮДА
import { SettingsPageSkeleton } from '@/components/admin/settings/components/SettingsPageSkeleton';
// ✅ ИМПОРТИРУЕМ SettingsOperationSkeleton ОТСЮДА
import {
  SettingsOperationSkeleton,
  SettingsExportSkeleton,
  SettingsImportSkeleton,
  SettingsResetSkeleton,
  SettingsValidationSkeleton
} from '@/components/admin/settings/components/SettingsOperationSkeletons';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  const {
    config,
    loading,
    saving,
    lastSaved,
    hasUnsavedChanges,
    loadSettings,
    saveSettings,
    updateConfig,
  } = useSettingsManager();

  const { exportSettings, importSettings } = useSettingsImportExport(
    config,
    (newConfig) => updateConfig('general', newConfig),
    (value) => { }
  );

  const { resetSettings, showHelp, showNotifications } = useSettingsActions(
    loadSettings,
    (value) => { }
  );

  const handleBack = () => router.push('/admin');

  // ✅ Исправленные обработчики
  const handleImport = async () => {
    setActiveOperation('import');

    let input: HTMLInputElement | null = null;

    try {
      input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      document.body.appendChild(input);

      const success = await new Promise<boolean>((resolve) => {
        if (!input) {
          resolve(false);
          return;
        }

        input.onchange = async (e: Event) => {
          try {
            // ✅ Правильное приведение типов через unknown
            const fileEvent = e as unknown as ChangeEvent<HTMLInputElement>;
            if (fileEvent.target?.files?.length) {
              await importSettings(fileEvent);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (error) {
            console.error('Ошибка импорта:', error);
            alert('Ошибка при импорте настроек. Проверьте формат файла.');
            resolve(false);
          }
        };

        input.oncancel = () => resolve(false);
        input.click();
      });

      if (success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Ошибка импорта:', error);
      alert('Произошла ошибка при импорте настроек.');
    } finally {
      if (input && document.body.contains(input)) {
        document.body.removeChild(input);
      }
      setActiveOperation(null);
    }
  };

  const handleExport = async () => {
    setActiveOperation('export');
    try {
      await exportSettings();
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте настроек.');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.'
    );

    if (!confirmed) return;

    setActiveOperation('reset');
    try {
      await resetSettings();
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (error) {
      console.error('Ошибка сброса:', error);
      alert('Ошибка при сбросе настроек.');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleSave = async () => {
    setActiveOperation('saving');
    try {
      await saveSettings();
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении настроек.');
    } finally {
      setActiveOperation(null);
    }
  };

  // Состояния загрузки и ошибки
  if (loading) {
    return <SettingsPageSkeleton />;
  }

  if (!config) {
    return <SettingsErrorState onBack={handleBack} onRetry={loadSettings} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <SettingsHeader
          title="Настройки системы"
          subtitle="Управление конфигурацией и параметрами"
          showBackButton={true}
          showActions={true}
          hasUnsavedChanges={hasUnsavedChanges}
          onBack={handleBack}
          onSave={handleSave}
          onReset={handleReset}
          onHelp={showHelp}
          onNotifications={showNotifications}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <UnsavedChangesAlert hasUnsavedChanges={hasUnsavedChanges} />

          <SettingsStatusBar
            lastSaved={lastSaved}
            onImport={handleImport}
            onExport={handleExport}
          />

          <SettingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            config={config}
            updateConfig={updateConfig}
          />
        </div>
      </div>

      {/* Операционные скелетоны */}
      {activeOperation === 'saving' && <SettingsOperationSkeleton operation="Сохранение настроек..." />}
      {activeOperation === 'import' && <SettingsImportSkeleton />}
      {activeOperation === 'export' && <SettingsExportSkeleton />}
      {activeOperation === 'reset' && <SettingsResetSkeleton />}
      {activeOperation === 'validation' && <SettingsValidationSkeleton />}

      {saving && !activeOperation && <SettingsOperationSkeleton operation="Обработка..." />}
    </>
  );
}
