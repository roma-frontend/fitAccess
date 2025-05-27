// components/debug/PerformanceMonitor.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Gauge, Clock, Zap, RefreshCw } from "lucide-react";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentUpdates: number;
  dataFetchTime: number;
  lastUpdate: Date;
}

export default function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentUpdates: 0,
    dataFetchTime: 0,
    lastUpdate: new Date()
  });

  const renderStartRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);

  // Мониторинг производительности рендеринга
  useEffect(() => {
    renderStartRef.current = performance.now();
    updateCountRef.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartRef.current;
      
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderTime * 100) / 100,
        componentUpdates: updateCountRef.current,
        memoryUsage: (performance as any).memory ? 
          Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
        lastUpdate: new Date()
      }));
    };
  });

  // Мониторинг времени загрузки данных
  const measureDataFetch = async (fetchFunction: () => Promise<any>) => {
    const start = performance.now();
    try {
      await fetchFunction();
    } finally {
      const fetchTime = performance.now() - start;
      setMetrics(prev => ({
        ...prev,
        dataFetchTime: Math.round(fetchTime * 100) / 100
      }));
    }
  };

  const getPerformanceStatus = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'warning';
    return 'critical';
  };

  const renderTimeStatus = getPerformanceStatus(metrics.renderTime, [16, 50]);
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, [50, 100]);
  const fetchTimeStatus = getPerformanceStatus(metrics.dataFetchTime, [100, 500]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 bg-white shadow-lg"
        >
          <Gauge className="h-4 w-4" />
          Performance
          <Badge 
            variant={renderTimeStatus === 'critical' ? 'destructive' : 'secondary'}
            className="ml-1"
          >
            {metrics.renderTime}ms
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-72">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Performance Monitor
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

        <CardContent className="space-y-3">
          {/* Время рендеринга */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="text-sm">Render Time</span>
            </div>
            <Badge 
              variant={
                renderTimeStatus === 'good' ? 'default' :
                renderTimeStatus === 'warning' ? 'secondary' : 'destructive'
              }
            >
              {metrics.renderTime}ms
            </Badge>
          </div>

          {/* Использование памяти */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span className="text-sm">Memory Usage</span>
            </div>
            <Badge 
              variant={
                memoryStatus === 'good' ? 'default' :
                memoryStatus === 'warning' ? 'secondary' : 'destructive'
              }
            >
              {metrics.memoryUsage}MB
            </Badge>
          </div>

          {/* Время загрузки данных */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span className="text-sm">Data Fetch</span>
            </div>
            <Badge 
              variant={
                fetchTimeStatus === 'good' ? 'default' :
                fetchTimeStatus === 'warning' ? 'secondary' : 'destructive'
              }
            >
              {metrics.dataFetchTime}ms
            </Badge>
          </div>

          {/* Количество обновлений */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3" />
              <span className="text-sm">Updates</span>
            </div>
            <Badge variant="outline">
              {metrics.componentUpdates}
            </Badge>
          </div>

          {/* Последнее обновление */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            Last update: {metrics.lastUpdate.toLocaleTimeString()}
          </div>

          {/* Рекомендации */}
          {(renderTimeStatus === 'critical' || memoryStatus === 'critical') && (
            <div className="p-2 bg-red-50 rounded text-xs text-red-700">
              ⚠️ Производительность снижена. Проверьте оптимизацию компонентов.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
