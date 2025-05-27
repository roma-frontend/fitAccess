// components/debug/ConvexMonitor.tsx (исправленная версия с типами)
"use client";

import { useEffect, useState } from 'react';
import { checkConvexHealth, checkConvexFunctions } from '@/utils/convexHealth';

// ✅ ТИПЫ ДЛЯ СТАТУСА ФУНКЦИЙ
interface FunctionResult {
  success: boolean;
  data?: string;
  error?: string;
}

interface FunctionTestResults {
  [functionName: string]: FunctionResult;
}

interface ConvexStatus {
  isHealthy: boolean;
  isChecking: boolean;
  error: string | null;
  lastCheck: Date | null;
  functionsStatus: FunctionTestResults;
  trainersCount: number;
}

export default function ConvexMonitor() {
  const [convexStatus, setConvexStatus] = useState<ConvexStatus>({
    isHealthy: false,
    isChecking: true,
    error: null,
    lastCheck: null,
    functionsStatus: {},
    trainersCount: 0
  });

  useEffect(() => {
    const checkHealth = async () => {
      setConvexStatus(prev => ({ ...prev, isChecking: true }));
      
      try {
        // Базовая проверка
        const isHealthy = await checkConvexHealth();
        
        // Расширенная проверка функций
        const functionsStatus = await checkConvexFunctions();
        
        // Подсчитываем успешные функции
        const successfulFunctions = Object.values(functionsStatus).filter(
          (result: FunctionResult) => result.success
        ).length;
        
        // ✅ БЕЗОПАСНОЕ ИЗВЛЕЧЕНИЕ КОЛИЧЕСТВА ТРЕНЕРОВ
        let trainersCount = 0;
        const getAllTrainersResult = functionsStatus['trainers:getAllTrainers'];
        if (getAllTrainersResult?.success && getAllTrainersResult.data) {
          const match = getAllTrainersResult.data.match(/(\d+) записей/);
          trainersCount = match ? parseInt(match[1]) : 0;
        }
        
        setConvexStatus({
          isHealthy: isHealthy && successfulFunctions > 0,
          isChecking: false,
          error: null,
          lastCheck: new Date(),
          functionsStatus,
          trainersCount
        });
      } catch (error) {
        setConvexStatus({
          isHealthy: false,
          isChecking: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date(),
          functionsStatus: {},
          trainersCount: 0
        });
      }
    };

    // Первоначальная проверка
    checkHealth();

    // Периодическая проверка каждые 30 секунд
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const successfulFunctions = Object.values(convexStatus.functionsStatus).filter(
    (result: FunctionResult) => result.success
  ).length;
  
  const totalFunctions = Object.keys(convexStatus.functionsStatus).length;

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 10,
      background: convexStatus.isHealthy 
        ? 'rgba(34, 197, 94, 0.9)' 
        : convexStatus.isChecking
          ? 'rgba(251, 191, 36, 0.9)'
          : 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      zIndex: 9998,
      fontFamily: 'monospace',
      border: `2px solid ${convexStatus.isHealthy ? '#22c55e' : convexStatus.isChecking ? '#f59e0b' : '#ef4444'}`,
      maxWidth: '280px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        🔗 Convex {convexStatus.isHealthy ? '✅' : convexStatus.isChecking ? '⏳' : '❌'}
      </div>
      
      <div style={{ fontSize: '10px', marginBottom: '2px' }}>
        Status: {convexStatus.isHealthy ? 'Connected' : convexStatus.isChecking ? 'Checking...' : 'Disconnected'}
      </div>
      
      {convexStatus.trainersCount > 0 && (
        <div style={{ fontSize: '10px', marginBottom: '2px' }}>
          Trainers: {convexStatus.trainersCount}
        </div>
      )}
      
      {totalFunctions > 0 && (
        <div style={{ fontSize: '10px', marginBottom: '2px' }}>
          Functions: {successfulFunctions}/{totalFunctions}
        </div>
      )}
      
      {convexStatus.lastCheck && (
        <div style={{ fontSize: '9px', color: '#cbd5e1' }}>
          Last check: {convexStatus.lastCheck.toLocaleTimeString()}
        </div>
      )}
      
      {convexStatus.error && (
        <div style={{ 
          color: '#fca5a5', 
          marginTop: '4px', 
          fontSize: '9px',
          wordBreak: 'break-word'
        }}>
          {convexStatus.error}
        </div>
      )}
      
      {!convexStatus.isHealthy && !convexStatus.isChecking && (
        <div style={{ 
          color: '#fbbf24', 
          marginTop: '4px', 
          fontSize: '9px' 
        }}>
          💡 Run: npx convex dev
        </div>
      )}
      
      {/* Детальная информация о функциях при клике */}
      <details style={{ marginTop: '4px', fontSize: '9px' }}>
        <summary style={{ cursor: 'pointer', color: '#cbd5e1' }}>
          Functions Status
        </summary>
        <div style={{ marginTop: '2px', maxHeight: '100px', overflow: 'auto' }}>
          {Object.entries(convexStatus.functionsStatus).map(([name, result]: [string, FunctionResult]) => (
            <div key={name} style={{ 
              color: result.success ? '#86efac' : '#fca5a5',
              fontSize: '8px',
              marginBottom: '1px'
            }}>
              {result.success ? '✅' : '❌'} {name.split(':')[1]}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
