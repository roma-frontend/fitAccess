// app/admin/debug/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyncDebugPanel } from '@/components/debug/SyncDebugPanel';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DebugSystemTest } from "@/components/debug/DebugSystemTest";
import { ArrowLeft, Bug, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminSecondHeader, MobileActionGroup, ResponsiveButton } from "@/components/admin/users/AdminSecondHeader";
import { useQuery } from "convex/react";

export default function DebugPage() {
  const [systemInfo, setSystemInfo] = useState({
    contexts: 0,
    events: 0,
    notifications: 0,
    lastUpdate: null as Date | null
  });

  const updateSystemInfo = () => {
    if (typeof window !== 'undefined' && window.fitAccessDebug) {
      const debug = window.fitAccessDebug;
      setSystemInfo({
        contexts: Object.keys(debug).filter(key => 
          typeof debug[key] === 'object' && 
          debug[key] !== null && 
          !['help', 'sync', 'stats'].includes(key)
        ).length,
        events: debug.schedule?.events?.length || 0,
        notifications: debug.dashboard?.notifications?.length || 0,
        lastUpdate: new Date()
      });
    }
  };

  useEffect(() => {
    updateSystemInfo();
    const interval = setInterval(updateSystemInfo, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <AdminSecondHeader
        title="Отладка"
        description="Мониторинг системы"
        icon={Bug}
        actions={
          <MobileActionGroup>
            <div className="hidden sm:flex">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                🟢 Система активна
              </Badge>
            </div>
            
            <ResponsiveButton 
              onClick={updateSystemInfo} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:ml-2">Обновить</span>
            </ResponsiveButton>
          </MobileActionGroup>
        }
      />

      {/* Общая информация о системе */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Обзор системы</span>
            <Button onClick={updateSystemInfo} variant="outline" size="sm">
              🔄 Обновить
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemInfo.contexts}</div>
              <div className="text-sm text-gray-600">Активных контекстов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemInfo.events}</div>
              <div className="text-sm text-gray-600">Событий в системе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemInfo.notifications}</div>
              <div className="text-sm text-gray-600">Уведомлений</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">
                {systemInfo.lastUpdate ? 
                  `Обновлено: ${systemInfo.lastUpdate.toLocaleTimeString()}` : 
                  'Нет данных'
                }
              </div>
              <Badge variant="outline" className="mt-1">
                🟢 Система активна
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test" className="flex items-center gap-2">
            🧪 Тестирование системы
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            📊 Мониторинг синхронизации
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <DebugSystemTest />
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <SyncDebugPanel />
        </TabsContent>
      </Tabs>

      {/* Быстрые команды */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🚀 Быстрые команды</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.fitAccessDebug?.help) {
                  window.fitAccessDebug.help();
                  console.log('📖 Справка выведена в консоль');
                }
              }}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">📖</span>
              <span>Справка</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.fitAccessDebug?.sync) {
                  window.fitAccessDebug.sync();
                  console.log('🔄 Синхронизация запущена');
                }
              }}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">🔄</span>
              <span>Синхронизация</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.fitAccessDebug?.clear) {
                  window.fitAccessDebug.clear();
                  console.log('🗑️ Очистка выполнена');
                  updateSystemInfo();
                }
              }}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">🗑️</span>
              <span>Очистить</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.fitAccessDebug?.test) {
                  window.fitAccessDebug.test();
                  console.log('🧪 Тест запущен');
                }
              }}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">🧪</span>
              <span>Тест</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Информация для разработчиков */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💻 Информация для разработчиков</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <div className="mb-2"><strong>Доступные команды в консоли:</strong></div>
            <div className="space-y-1 text-gray-700">
              <div>• <code>window.fitAccessDebug.help()</code> - Показать справку</div>
              <div>• <code>window.fitAccessDebug.stats()</code> - Получить статистику</div>
              <div>• <code>window.fitAccessDebug.sync()</code> - Запустить синхронизацию</div>
              <div>• <code>window.fitAccessDebug.test()</code> - Запустить тесты</div>
              <div>• <code>window.diagnoseContexts()</code> - Диагностика контекстов</div>
              <div>• <code>window.forceRegisterContexts()</code> - Принудительная регистрация</div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div><strong>Контексты:</strong></div>
              <div className="text-gray-700">
                <div>• <code>window.fitAccessDebug.schedule</code> - Контекст расписания</div>
                <div>• <code>window.fitAccessDebug.dashboard</code> - Контекст дашборда</div>
                <div>• <code>window.fitAccessDebug.superAdmin</code> - Контекст супер админа</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
