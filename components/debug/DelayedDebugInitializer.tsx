// components/debug/DelayedDebugInitializer.tsx (обновляем импорты)
"use client";

import { useEffect, useState } from 'react';
import { initDebugCommands, registerGlobalDebugCommands } from '@/utils/debugCommands';
import { getContext, isContextAvailable, getAllContextStats } from '@/utils/typeUtils';

export default function DelayedDebugInitializer() {
  const [debugStatus, setDebugStatus] = useState({
    schedule: false,
    dashboard: false,
    superAdmin: false,
    initialized: false,
    error: null as string | null,
    attempts: 0
  });

  useEffect(() => {
    // ✅ ЖДЕМ ДОЛЬШЕ ПЕРЕД ПЕРВОЙ ПОПЫТКОЙ
    const timer = setTimeout(() => {
      const initializeDebug = () => {
        try {
          console.log('🔍 Попытка инициализации debug системы...');
          
          // ✅ ИСПОЛЬЗУЕМ БЕЗОПАСНЫЕ УТИЛИТЫ ДЛЯ ПРОВЕРКИ КОНТЕКСТОВ
          const schedule = getContext('schedule');
          const dashboard = getContext('dashboard');
          const superAdmin = getContext('superAdmin');

          console.log('🔍 Состояние контекстов:', getAllContextStats());

          setDebugStatus(prev => ({
            ...prev,
            schedule: isContextAvailable('schedule'),
            dashboard: isContextAvailable('dashboard'),
            superAdmin: isContextAvailable('superAdmin'),
            attempts: prev.attempts + 1
          }));

          // ✅ ИНИЦИАЛИЗИРУЕМ ЕСЛИ ХОТЯ БЫ ОДИН КОНТЕКСТ ДОСТУПЕН
          if (schedule || dashboard || superAdmin) {
            console.log('🎯 Инициализируем debug систему с доступными контекстами...');
            
            const debugCommands = initDebugCommands({
              schedule,
              dashboard,
              superAdmin
            });
            
            registerGlobalDebugCommands(debugCommands);
            
            setDebugStatus(prev => ({ 
              ...prev, 
              initialized: true 
            }));
            
            console.log('✅ Debug система инициализирована');
            console.log('💡 Доступные команды: fitAccessDebug.help()');
            
            // ✅ АВТОМАТИЧЕСКАЯ ПРОВЕРКА СИНХРОНИЗАЦИИ
            setTimeout(() => {
              if (window.fitAccessDebug?.checkSync) {
                console.log('🔍 Автоматическая проверка синхронизации...');
                window.fitAccessDebug.checkSync();
              }
            }, 1000);
            
            return true; // Успешная инициализация
          }
          
          return false; // Контексты еще не готовы
        } catch (error) {
          console.warn('⚠️ Ошибка инициализации debug системы:', error);
          setDebugStatus(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error.message : 'Unknown error'
          }));
          return false;
        }
      };

      // ✅ ПЫТАЕМСЯ ИНИЦИАЛИЗИРОВАТЬ С ИНТЕРВАЛОМ
      const attemptInit = () => {
        if (debugStatus.attempts >= 15) {
          console.warn('⚠️ Превышено максимальное количество попыток инициализации debug системы');
          setDebugStatus(prev => ({ 
            ...prev, 
            error: 'Превышено максимальное количество попыток' 
          }));
          return;
        }

        const success = initializeDebug();
        if (!success && !debugStatus.initialized) {
          // Повторяем попытку через 2 секунды
          setTimeout(attemptInit, 2000);
        }
      };

      attemptInit();
    }, 3000); // ✅ ЖДЕМ 3 СЕКУНДЫ ПЕРЕД ПЕРВОЙ ПОПЫТКОЙ
    
    return () => clearTimeout(timer);
  }, [debugStatus.initialized, debugStatus.attempts]);

  // ✅ ПОКАЗЫВАЕМ СТАТУС ТОЛЬКО В DEVELOPMENT
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      left: 10,
      background: debugStatus.initialized 
        ? 'rgba(34, 197, 94, 0.9)' 
        : debugStatus.error 
          ? 'rgba(239, 68, 68, 0.9)'
          : 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      zIndex: 9999,
      fontFamily: 'monospace',
      border: debugStatus.initialized 
        ? '2px solid #22c55e' 
        : debugStatus.error
          ? '2px solid #ef4444'
          : '1px solid #666',
      transition: 'all 0.3s ease',
            maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        🔧 Debug System {debugStatus.initialized ? '✅' : debugStatus.error ? '❌' : '⏳'}
      </div>
      <div>Schedule: {debugStatus.schedule ? '✅' : '❌'}</div>
      <div>Dashboard: {debugStatus.dashboard ? '✅' : '❌'}</div>
      <div>SuperAdmin: {debugStatus.superAdmin ? '✅' : '❌'}</div>
      
      {debugStatus.attempts > 0 && (
        <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
          Попытка: {debugStatus.attempts}/15
        </div>
      )}
      
      {debugStatus.error && (
        <div style={{ 
          color: '#fca5a5', 
          marginTop: '4px', 
          fontSize: '10px',
          wordBreak: 'break-word'
        }}>
          Error: {debugStatus.error}
        </div>
      )}
      
      {debugStatus.initialized && (
        <div style={{ 
          color: '#a7f3d0', 
          marginTop: '4px', 
          fontSize: '10px',
          fontWeight: 'bold' 
        }}>
          💡 fitAccessDebug.help()
        </div>
      )}
      
      {!debugStatus.initialized && !debugStatus.error && (
        <div style={{ 
          color: '#fbbf24', 
          marginTop: '4px', 
          fontSize: '10px' 
        }}>
          Ожидание контекстов...
        </div>
      )}
    </div>
  );
}

