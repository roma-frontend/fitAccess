// app/admin/settings/page.tsx
"use client";

import React, { useState } from 'react';
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

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');

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
    (newConfig) => updateConfig('general', newConfig), // Это нужно будет исправить
    (value) => {} // setHasUnsavedChanges - нужно добавить в хук
  );

  const { resetSettings, showHelp, showNotifications } = useSettingsActions(
    loadSettings,
    (value) => {} // setHasUnsavedChanges - нужно добавить в хук
  );

  const handleBack = () => router.push('/admin');

  // Состояния загрузки и ошибки
  if (loading) {
    return <SettingsLoadingState onBack={handleBack} />;
  }

  if (!config) {
    return <SettingsErrorState onBack={handleBack} onRetry={loadSettings} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SettingsHeader
        title="Настройки системы"
        subtitle="Управление конфигурацией и параметрами"
        showBackButton={true}
        showActions={true}
        hasUnsavedChanges={hasUnsavedChanges}
        onBack={handleBack}
        onSave={saveSettings}
        onReset={resetSettings}
        onHelp={showHelp}
        onNotifications={showNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UnsavedChangesAlert hasUnsavedChanges={hasUnsavedChanges} />
        
        <SettingsStatusBar
          lastSaved={lastSaved}
          onImport={importSettings}
          onExport={exportSettings}
        />

        <SettingsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          config={config}
          updateConfig={updateConfig}
        />
      </div>
    </div>
  );
}
