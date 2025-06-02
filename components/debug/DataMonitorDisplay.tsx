// components/debug/DataMonitorDisplay.tsx (новый компонент)
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { useDataMonitor } from '@/hooks/useDataMonitor';

export default function DataMonitorDisplay() {
  const [isVisible, setIsVisible] = useState(false);
  const monitor = useDataMonitor();

  const healthStatus = monitor.getHealthStatus();
  const errorSummary = monitor.getErrorSummary();
  const loadingSummary = monitor.getLoadingSummary();
  const syncSummary = monitor.getSyncSummary();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'loading': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'loading': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getChangeIcon = (prev: number, current: number) => {
    if (current > prev) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < prev) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 left-20 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className={`flex items-center gap-2 shadow-lg ${getStatusColor(healthStatus)}`}
        >
          {getStatusIcon(healthStatus)}
          Monitor
          {errorSummary.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {errorSummary.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-96">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Data Monitor
              {getStatusIcon(healthStatus)}
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="status" className="space-y-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Статус</TabsTrigger>
              <TabsTrigger value="sync">Синхронизация</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-3">
              {/* Общий статус */}
              <div className={`p-3 rounded-lg border ${getStatusColor(healthStatus)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Система</span>
                  <Badge className={getStatusColor(healthStatus)}>
                    {healthStatus}
                  </Badge>
                </div>
              </div>

              {/* Ошибки */}
              {errorSummary.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-red-700">Ошибки:</h4>
                  {errorSummary.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded text-xs text-red-700 border border-red-200">
                      <div className="font-medium">{error.context}</div>
                      <div>{error.error}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Состояние загрузки */}
              {loadingSummary.anyLoading && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-blue-700">Загрузка:</h4>
                  <div className="space-y-1">
                    {loadingSummary.dashboard && (
                      <div className="flex items-center gap-2 text-xs">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Dashboard
                      </div>
                    )}
                    {loadingSummary.schedule && (
                      <div className="flex items-center gap-2 text-xs">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Schedule
                      </div>
                    )}
                    {loadingSummary.superAdmin && (
                      <div className="flex items-center gap-2 text-xs">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        SuperAdmin
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Текущие данные */}
              {monitor.currentSnapshot && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Данные:</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">События</div>
                      <div>D: {monitor.currentSnapshot.dashboard.events}</div>
                      <div>S: {monitor.currentSnapshot.schedule.events}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Тренеры</div>
                      <div>D: {monitor.currentSnapshot.dashboard.trainers}</div>
                      <div>SA: {monitor.currentSnapshot.superAdmin.trainers}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Клиенты</div>
                      <div>D: {monitor.currentSnapshot.dashboard.clients}</div>
                      <div>SA: {monitor.currentSnapshot.superAdmin.clients}</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sync" className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">События (D↔S)</span>
                  {syncSummary.eventsSync ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Тренеры (D↔SA)</span>
                  {syncSummary.trainersSync ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Клиенты (D↔SA)</span>
                  {syncSummary.clientsSync ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                <div className={`p-3 rounded-lg border mt-3 ${
                  syncSummary.allInSync 
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {syncSummary.allInSync ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {syncSummary.allInSync ? 'Все синхронизировано' : 'Есть рассинхронизация'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {monitor.snapshots.slice(-10).reverse().map((snapshot, index) => {
                  const prevSnapshot = monitor.snapshots[monitor.snapshots.length - 2 - index];
                  
                  return (
                    <div key={snapshot.timestamp.getTime()} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium mb-1">
                        {snapshot.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="flex items-center gap-1">
                          <span>E:</span>
                          <span>{snapshot.dashboard.events}</span>
                          {prevSnapshot && getChangeIcon(prevSnapshot.dashboard.events, snapshot.dashboard.events)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>T:</span>
                          <span>{snapshot.dashboard.trainers}</span>
                          {prevSnapshot && getChangeIcon(prevSnapshot.dashboard.trainers, snapshot.dashboard.trainers)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>C:</span>
                          <span>{snapshot.dashboard.clients}</span>
                          {prevSnapshot && getChangeIcon(prevSnapshot.dashboard.clients, snapshot.dashboard.clients)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-xs text-gray-500 pt-2 border-t">
                Показаны последние 10 снимков
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
