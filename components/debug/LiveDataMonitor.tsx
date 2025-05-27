// components/debug/LiveDataMonitor.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useDataMonitor } from '@/hooks/useDataMonitor';

export default function LiveDataMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { snapshots, currentSnapshot, checkSyncStatus } = useDataMonitor();

  const [syncStatus, setSyncStatus] = useState<string[]>([]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        const issues = checkSyncStatus();
        setSyncStatus(issues);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, checkSyncStatus]);

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 bg-white shadow-lg"
        >
          <Activity className="h-4 w-4" />
          Monitor
          {syncStatus.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {syncStatus.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                {autoRefresh ? (
                  <Wifi className="h-3 w-3 text-green-600" />
                ) : (
                  <WifiOff className="h-3 w-3 text-gray-400" />
                )}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Статус синхронизации */}
          <div className="flex items-center gap-2">
            {syncStatus.length === 0 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Синхронизировано</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700">
                  {syncStatus.length} проблем
                </span>
              </>
            )}
          </div>

          {/* Текущие данные */}
          {currentSnapshot && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600">
                Текущие данные:
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">Dashboard</div>
                  <div>T: {currentSnapshot.dashboard.trainers}</div>
                  <div>C: {currentSnapshot.dashboard.clients}</div>
                  <div>E: {currentSnapshot.dashboard.events}</div>
                </div>
                
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-medium">Schedule</div>
                  <div>E: {currentSnapshot.schedule.events}</div>
                  <div className="mt-2">
                    {currentSnapshot.schedule.loading ? (
                      <RefreshCw className="h-3 w-3 animate-spin mx-auto" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-600 mx-auto" />
                    )}
                  </div>
                </div>
                
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-medium">SuperAdmin</div>
                  <div>T: {currentSnapshot.superAdmin.trainers}</div>
                  <div>C: {currentSnapshot.superAdmin.clients}</div>
                </div>
              </div>
            </div>
          )}

          {/* Проблемы синхронизации */}
          {syncStatus.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-orange-700">
                Проблемы:
              </div>
              {syncStatus.map((issue, index) => (
                <div key={index} className="text-xs p-2 bg-orange-50 rounded text-orange-800">
                  {issue.replace('⚠️ ', '')}
                </div>
              ))}
            </div>
          )}

          {/* История изменений */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600">
              История ({snapshots.length} записей):
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {snapshots.slice(-5).reverse().map((snapshot, index) => (
                <div key={index} className="text-xs p-1 bg-gray-50 rounded">
                  {snapshot.timestamp.toLocaleTimeString()} - 
                  T:{snapshot.dashboard.trainers} 
                  C:{snapshot.dashboard.clients} 
                  E:{snapshot.dashboard.events}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
