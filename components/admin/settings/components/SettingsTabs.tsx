// components/admin/settings/components/SettingsTabs.tsx
"use client";

import React, { lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Users,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  FileText,
} from "lucide-react";
import type { SystemConfig } from '@/types/settings';

// Ленивая загрузка компонентов
const GeneralSettings = lazy(() => import('@/components/admin/settings/GeneralSettings').then(m => ({ default: m.GeneralSettings })));
const NotificationSettings = lazy(() => import('@/components/admin/settings/Notificationsettings').then(m => ({ default: m.NotificationSettings })));
const UserManagement = lazy(() => import('@/components/admin/settings/UserManagment').then(m => ({ default: m.UserManagement })));
const SecuritySettings = lazy(() => import('@/components/admin/settings/SecuritySettings').then(m => ({ default: m.SecuritySettings })));
const AppearanceSettings = lazy(() => import('@/components/admin/settings/AppearanceSettings').then(m => ({ default: m.AppearanceSettings })));
const IntegrationSettings = lazy(() => import('@/components/admin/settings/IntegrationSettings').then(m => ({ default: m.IntegrationSettings })));
const SystemSettings = lazy(() => import('@/components/admin/settings/SystemSettings').then(m => ({ default: m.SystemSettings })));
const BackupSettings = lazy(() => import('@/components/admin/settings/BackupSettings').then(m => ({ default: m.BackupSettings })));

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  config: SystemConfig;
  updateConfig: (section: keyof SystemConfig, updates: any) => void;
}

const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export const SettingsTabs = React.memo(({ 
  activeTab, 
  onTabChange, 
  config, 
  updateConfig 
}: SettingsTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Общие
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Пользователи
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Уведомления
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Безопасность
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Внешний вид
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Интеграции
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Система
        </TabsTrigger>
        <TabsTrigger value="backup" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Резервные копии
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Suspense fallback={<TabLoadingSpinner />}>
          <GeneralSettings
            config={config.general}
            businessConfig={config.business}
            onUpdate={(updates) => updateConfig('general', updates)}
            onBusinessUpdate={(updates) => updateConfig('business', updates)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="users">
        <Suspense fallback={<TabLoadingSpinner />}>
          <UserManagement />
        </Suspense>
      </TabsContent>

      <TabsContent value="notifications">
        <Suspense fallback={<TabLoadingSpinner />}>
          <NotificationSettings
            config={config.notifications}
            onUpdate={(updates) => updateConfig('notifications', updates)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="security">
        <Suspense fallback={<TabLoadingSpinner />}>
          <SecuritySettings
            config={config.security}
            onUpdate={(updates) => updateConfig('security', updates)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="appearance">
        <Suspense fallback={<TabLoadingSpinner />}>
          <AppearanceSettings
            config={config.appearance}
            onUpdate={(updates) => updateConfig('appearance', updates)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="integrations">
        <Suspense fallback={<TabLoadingSpinner />}>
          <IntegrationSettings
            config={config.integrations}
            onUpdate={(updates) => updateConfig('integrations', updates)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="system">
        <Suspense fallback={<TabLoadingSpinner />}>
          <SystemSettings
            config={config.system}
            onUpdate={(updates) => updateConfig('system', updates)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="backup">
        <Suspense fallback={<TabLoadingSpinner />}>
          <BackupSettings />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
});
