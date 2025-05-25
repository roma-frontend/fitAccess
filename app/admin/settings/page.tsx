// app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Building, 
  Users, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Globe,
  Mail,
  Phone,
  Clock,
  CreditCard,
  FileText,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { GeneralSettings } from '@/components/admin/settings/GeneralSettings';
import { NotificationSettings } from '@/components/admin/settings/Notificationsettings';
import { UserManagement } from '@/components/admin/settings/UserManagment';
import { SecuritySettings } from '@/components/admin/settings/SecuritySettings';
import { AppearanceSettings } from '@/components/admin/settings/AppearanceSettings';
import { IntegrationSettings } from '@/components/admin/settings/IntegrationSettings';
import { SystemSettings } from '@/components/admin/settings/SystemSettings';
import { BackupSettings } from '@/components/admin/settings/BackupSettings';

// Типы для настроек
export interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    timezone: string;
    language: string;
    currency: string;
  };
  business: {
    workingHours: {
      monday: { start: string; end: string; closed: boolean };
      tuesday: { start: string; end: string; closed: boolean };
      wednesday: { start: string; end: string; closed: boolean };
      thursday: { start: string; end: string; closed: boolean };
      friday: { start: string; end: string; closed: boolean };
      saturday: { start: string; end: string; closed: boolean };
      sunday: { start: string; end: string; closed: boolean };
    };
    bookingSettings: {
      advanceBookingDays: number;
      cancellationHours: number;
      autoConfirmBookings: boolean;
      allowWaitlist: boolean;
    };
    paymentSettings: {
      acceptedMethods: string[];
      autoChargeEnabled: boolean;
      lateFeeAmount: number;
      gracePeriodDays: number;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPassword: string;
      fromEmail: string;
      fromName: string;
    };
    sms: {
      enabled: boolean;
      provider: string;
      apiKey: string;
      fromNumber: string;
    };
    push: {
      enabled: boolean;
      firebaseKey: string;
    };
    templates: {
      bookingConfirmation: boolean;
      bookingReminder: boolean;
      paymentDue: boolean;
      membershipExpiry: boolean;
      welcomeMessage: boolean;
    };
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionSettings: {
      sessionTimeout: number;
      maxConcurrentSessions: number;
      requireTwoFactor: boolean;
    };
    accessControl: {
      ipWhitelist: string[];
      maxLoginAttempts: number;
      lockoutDuration: number;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    customCSS: string;
  };
  integrations: {
    googleCalendar: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
    stripe: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
      webhookSecret: string;
    };
    mailchimp: {
      enabled: boolean;
      apiKey: string;
      listId: string;
    };
  };
  system: {
    maintenance: {
      enabled: boolean;
      message: string;
      allowedIPs: string[];
    };
    logging: {
      level: 'error' | 'warn' | 'info' | 'debug';
      retentionDays: number;
    };
    performance: {
      cacheEnabled: boolean;
      cacheTTL: number;
      compressionEnabled: boolean;
    };
  };
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockConfig: SystemConfig = {
        general: {
          siteName: 'FitAccess',
          siteDescription: 'Современный фитнес-центр с персональным подходом',
          contactEmail: 'info@fitaccess.ru',
          contactPhone: '+7 (495) 123-45-67',
          address: 'г. Москва, ул. Спортивная, д. 1',
          timezone: 'Europe/Moscow',
          language: 'ru',
          currency: 'RUB'
        },
        business: {
          workingHours: {
            monday: { start: '06:00', end: '23:00', closed: false },
            tuesday: { start: '06:00', end: '23:00', closed: false },
            wednesday: { start: '06:00', end: '23:00', closed: false },
            thursday: { start: '06:00', end: '23:00', closed: false },
            friday: { start: '06:00', end: '23:00', closed: false },
            saturday: { start: '08:00', end: '22:00', closed: false },
            sunday: { start: '08:00', end: '22:00', closed: false }
          },
          bookingSettings: {
            advanceBookingDays: 30,
            cancellationHours: 24,
            autoConfirmBookings: true,
            allowWaitlist: true
          },
          paymentSettings: {
            acceptedMethods: ['card', 'cash', 'bank_transfer'],
            autoChargeEnabled: true,
            lateFeeAmount: 500,
            gracePeriodDays: 3
          }
        },
        notifications: {
          email: {
            enabled: true,
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'noreply@fitaccess.ru',
            smtpPassword: '',
            fromEmail: 'noreply@fitaccess.ru',
            fromName: 'FitAccess'
          },
          sms: {
            enabled: false,
            provider: 'twilio',
            apiKey: '',
            fromNumber: ''
          },
          push: {
            enabled: true,
            firebaseKey: ''
          },
          templates: {
            bookingConfirmation: true,
            bookingReminder: true,
            paymentDue: true,
            membershipExpiry: true,
            welcomeMessage: true
          }
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          sessionSettings: {
            sessionTimeout: 30,
            maxConcurrentSessions: 3,
            requireTwoFactor: false
          },
          accessControl: {
            ipWhitelist: [],
            maxLoginAttempts: 5,
            lockoutDuration: 15
          }
        },
        appearance: {
          theme: 'light',
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          logo: '',
          favicon: '',
          customCSS: ''
        },
        integrations: {
          googleCalendar: {
            enabled: false,
            clientId: '',
            clientSecret: ''
          },
          stripe: {
            enabled: true,
            publicKey: '',
            secretKey: '',
            webhookSecret: ''
          },
          mailchimp: {
            enabled: false,
            apiKey: '',
            listId: ''
          }
        },
        system: {
          maintenance: {
            enabled: false,
            message: 'Сайт временно недоступен для технического обслуживания',
            allowedIPs: ['127.0.0.1']
          },
          logging: {
            level: 'info',
            retentionDays: 30
          },
          performance: {
            cacheEnabled: true,
            cacheTTL: 3600,
            compressionEnabled: true
          }
        }
      };

      setConfig(mockConfig);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Сохранение настроек:', config);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Показать уведомление об успешном сохранении
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      alert('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, updates: any) => {
    if (!config) return;
    
    setConfig(prev => prev ? {
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    } : null);
    setHasUnsavedChanges(true);
  };

  const exportSettings = () => {
    if (!config) return;
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitaccess-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        setHasUnsavedChanges(true);
        alert('Настройки успешно импортированы!');
      } catch (error) {
        alert('Ошибка импорта настроек. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка настроек...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Ошибка загрузки настроек</p>
          <Button onClick={loadSettings} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Настройки системы
            </h1>
            <p className="text-gray-600">
              Управление конфигурацией и параметрами системы
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Статус сохранения */}
            <div className="flex items-center gap-2 text-sm">
              {hasUnsavedChanges ? (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Есть несохраненные изменения
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Сохранено {lastSaved.toLocaleTimeString('ru')}
                </div>
              ) : null}
            </div>

            {/* Действия */}
            <Button variant="outline" onClick={loadSettings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            
            <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
                        <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
            
            <Button 
              onClick={saveSettings}
              disabled={saving || !hasUnsavedChanges}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Предупреждение о несохраненных изменениях */}
      {hasUnsavedChanges && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800">
            <Info className="h-5 w-5" />
            <span className="font-medium">У вас есть несохраненные изменения</span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Не забудьте сохранить изменения перед переходом на другую страницу.
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

        {/* Общие настройки */}
        <TabsContent value="general">
          <GeneralSettings 
            config={config.general}
            businessConfig={config.business}
            onUpdate={(updates) => updateConfig('general', updates)}
            onBusinessUpdate={(updates) => updateConfig('business', updates)}
          />
        </TabsContent>

        {/* Управление пользователями */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* Настройки уведомлений */}
        <TabsContent value="notifications">
          <NotificationSettings 
            config={config.notifications}
            onUpdate={(updates) => updateConfig('notifications', updates)}
          />
        </TabsContent>

        {/* Настройки безопасности */}
        <TabsContent value="security">
          <SecuritySettings 
            config={config.security}
            onUpdate={(updates) => updateConfig('security', updates)}
          />
        </TabsContent>

        {/* Настройки внешнего вида */}
        <TabsContent value="appearance">
          <AppearanceSettings 
            config={config.appearance}
            onUpdate={(updates) => updateConfig('appearance', updates)}
          />
        </TabsContent>

        {/* Настройки интеграций */}
        <TabsContent value="integrations">
          <IntegrationSettings 
            config={config.integrations}
            onUpdate={(updates) => updateConfig('integrations', updates)}
          />
        </TabsContent>

        {/* Системные настройки */}
        <TabsContent value="system">
          <SystemSettings 
            config={config.system}
            onUpdate={(updates) => updateConfig('system', updates)}
          />
        </TabsContent>

        {/* Резервные копии */}
        <TabsContent value="backup">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

