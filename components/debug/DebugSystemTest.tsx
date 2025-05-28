// components/admin/debug/DebugSystemTest.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ensureDebugSystem } from '@/utils/cleanTypes';

interface SystemStatus {
  debugSystem: boolean;
  scheduleContext: boolean;
  dashboardContext: boolean;
  superAdminContext: boolean;
  globalFunctions: boolean;
}

export function DebugSystemTest() {
  const [status, setStatus] = useState<SystemStatus>({
    debugSystem: false,
    scheduleContext: false,
    dashboardContext: false,
    superAdminContext: false,
    globalFunctions: false
  });
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const checkSystemStatus = () => {
    if (typeof window === 'undefined') return;

    const newStatus: SystemStatus = {
      debugSystem: !!window.fitAccessDebug,
      scheduleContext: !!window.fitAccessDebug?.schedule,
      dashboardContext: !!window.fitAccessDebug?.dashboard,
      superAdminContext: !!window.fitAccessDebug?.superAdmin,
      // ✅ ИСПРАВЛЕНО: Проверяем что функции действительно существуют
      globalFunctions: !!(
        typeof window.diagnoseContexts !== 'undefined' && 
        typeof window.forceRegisterContexts !== 'undefined'
      )
    };

    setStatus(newStatus);
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // ✅ ИСПРАВЛЕНО: Безопасная проверка существования функций
  const isFunctionAvailable = (obj: any, functionName: string): boolean => {
    return obj && typeof obj[functionName] === 'function';
  };

  const runSystemTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addTestResult('🔄 Начинаем системный тест...');
      
      // 1. Проверяем инициализацию debug системы
      ensureDebugSystem();
      addTestResult('✅ Debug система инициализирована');
      
      // 2. Проверяем доступность контекстов
      if (window.fitAccessDebug?.schedule) {
        addTestResult('✅ Schedule контекст доступен');
        
        // ✅ ИСПРАВЛЕНО: Используем безопасную проверку
        if (isFunctionAvailable(window.fitAccessDebug.schedule, 'getStats')) {
          try {
            const stats = window.fitAccessDebug.schedule.getStats();
            addTestResult(`📊 Schedule статистика: ${JSON.stringify(stats)}`);
          } catch (error) {
            addTestResult(`❌ Ошибка получения статистики Schedule: ${error}`);
          }
        } else {
          addTestResult('⚠️ Функция getStats недоступна в Schedule контексте');
        }
      } else {
        addTestResult('❌ Schedule контекст недоступен');
      }
      
      if (window.fitAccessDebug?.dashboard) {
        addTestResult('✅ Dashboard контекст доступен');
        
        // ✅ ИСПРАВЛЕНО: Используем безопасную проверку
        if (isFunctionAvailable(window.fitAccessDebug.dashboard, 'getStats')) {
          try {
            const stats = window.fitAccessDebug.dashboard.getStats();
            addTestResult(`📊 Dashboard статистика: ${JSON.stringify(stats)}`);
          } catch (error) {
            addTestResult(`❌ Ошибка получения статистики Dashboard: ${error}`);
          }
        } else {
          addTestResult('⚠️ Функция getStats недоступна в Dashboard контексте');
        }
      } else {
        addTestResult('❌ Dashboard контекст недоступен');
      }
      
      // 3. Проверяем глобальные функции
      if (typeof window.diagnoseContexts !== 'undefined' && typeof window.diagnoseContexts === 'function') {
        addTestResult('✅ Глобальная функция diagnoseContexts доступна');
        try {
          const diagnosis = window.diagnoseContexts();
          addTestResult(`🔍 Диагностика: ${JSON.stringify(diagnosis)}`);
        } catch (error) {
          addTestResult(`❌ Ошибка диагностики: ${error}`);
        }
      } else {
        addTestResult('❌ Глобальная функция diagnoseContexts недоступна');
      }
      
      // 4. Тестируем создание события
      if (isFunctionAvailable(window.fitAccessDebug?.schedule, 'createEvent')) {
        try {
          const testEvent = {
            title: 'Тестовое событие',
            type: 'training' as const,
            trainerId: 'test-trainer',
            trainerName: 'Тестовый тренер',
            clientId: 'test-client',
            clientName: 'Тестовый клиент',
            startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            price: 1500,
            status: 'scheduled' as const
          };
          
          if (window.fitAccessDebug?.schedule) {
            await window.fitAccessDebug.schedule.createEvent(testEvent);
            addTestResult('✅ Тестовое событие создано успешно');
          } else {
            addTestResult('❌ Schedule контекст недоступен для создания события');
          }
        } catch (error) {
          addTestResult(`❌ Ошибка создания события: ${error}`);
        }
      } else {
        addTestResult('⚠️ Функция createEvent недоступна в Schedule контексте');
      }
      
      // 5. Проверяем синхронизацию
      if (isFunctionAvailable(window.fitAccessDebug, 'sync')) {
        try {
          await window.fitAccessDebug.sync();
          addTestResult('✅ Синхронизация выполнена успешно');
        } catch (error) {
          addTestResult(`❌ Ошибка синхронизации: ${error}`);
        }
      } else {
        addTestResult('⚠️ Функция sync недоступна');
      }
      
      // 6. Дополнительные тесты
      addTestResult('🔍 Проверяем дополнительные функции...');
      
      // Тест функции help
      if (isFunctionAvailable(window.fitAccessDebug, 'help')) {
        try {
          window.fitAccessDebug.help();
          addTestResult('✅ Функция help работает');
        } catch (error) {
          addTestResult(`❌ Ошибка функции help: ${error}`);
        }
      }
      
      // Тест функции stats
      if (isFunctionAvailable(window.fitAccessDebug, 'stats')) {
        try {
          const globalStats = window.fitAccessDebug.stats();
          addTestResult(`📊 Глобальная статистика: ${JSON.stringify(globalStats)}`);
        } catch (error) {
          addTestResult(`❌ Ошибка получения глобальной статистики: ${error}`);
        }
      }
      
      addTestResult('🎉 Системный тест завершен!');
      
    } catch (error) {
      addTestResult(`❌ Критическая ошибка теста: ${error}`);
    } finally {
      setIsRunning(false);
      checkSystemStatus();
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // ✅ ИСПРАВЛЕНО: Безопасные вызовы функций в быстрых действиях
  const executeQuickAction = (actionName: string, action: () => void) => {
    try {
      action();
      addTestResult(`✅ ${actionName} выполнено успешно`);
    } catch (error) {
      addTestResult(`❌ Ошибка ${actionName}: ${error}`);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Статус системы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="mb-2">🔧</div>
              <div className="text-sm font-medium">Debug система</div>
              <Badge className={status.debugSystem ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status.debugSystem ? 'Активна' : 'Неактивна'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="mb-2">📅</div>
              <div className="text-sm font-medium">Schedule</div>
              <Badge className={status.scheduleContext ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status.scheduleContext ? 'Подключен' : 'Отключен'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="mb-2">📊</div>
              <div className="text-sm font-medium">Dashboard</div>
              <Badge className={status.dashboardContext ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status.dashboardContext ? 'Подключен' : 'Отключен'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="mb-2">👑</div>
              <div className="text-sm font-medium">Super Admin</div>
              <Badge className={status.superAdminContext ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status.superAdminContext ? 'Подключен' : 'Отключен'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="mb-2">🌐</div>
              <div className="text-sm font-medium">Глобальные функции</div>
              <Badge className={status.globalFunctions ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status.globalFunctions ? 'Доступны' : 'Недоступны'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Тестирование системы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={runSystemTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? '🔄 Выполняется...' : '🚀 Запустить тест'}
            </Button>
            
            <Button 
              onClick={clearResults} 
              variant="outline"
              disabled={testResults.length === 0}
            >
              🗑️ Очистить результаты
            </Button>
            
            <Button 
              onClick={checkSystemStatus} 
              variant="outline"
            >
              🔄 Обновить статус
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h4 className="font-medium mb-3">Результаты тестирования:</h4>
              <div className="space-y-2 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-0 flex-shrink-0">
                      [{index + 1}]
                    </span>
                    <span className="break-all">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => executeQuickAction('Справка', () => {
                if (isFunctionAvailable(window.fitAccessDebug, 'help')) {
                  window.fitAccessDebug.help();
                  console.log('📖 Справка выведена в консоль');
                } else {
                  throw new Error('Функция help недоступна');
                }
              })}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">❓</span>
              <span>Справка</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => executeQuickAction('Статистика', () => {
                if (isFunctionAvailable(window.fitAccessDebug, 'stats')) {
                  const stats = window.fitAccessDebug.stats();
                  console.log('📊 Статистика системы:', stats);
                } else {
                  throw new Error('Функция stats недоступна');
                }
              })}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">📊</span>
              <span>Статистика</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => executeQuickAction('Диагностика', () => {
                if (typeof window.diagnoseContexts !== 'undefined' && typeof window.diagnoseContexts === 'function') {
                  const diagnosis = window.diagnoseContexts();
                  console.log('🔍 Диагностика:', diagnosis);
                } else {
                  throw new Error('Функция diagnoseContexts недоступна');
                }
              })}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">🔍</span>
              <span>Диагностика</span>
                        </Button>
            
            <Button 
              variant="outline" 
              onClick={() => executeQuickAction('Обновление всех данных', () => {
                if (isFunctionAvailable(window.fitAccessDebug, 'refreshAll')) {
                  window.fitAccessDebug.refreshAll();
                } else {
                  throw new Error('Функция refreshAll недоступна');
                }
              })}
              className="h-auto flex-col gap-2 py-4"
            >
              <span className="text-2xl">🔄</span>
              <span>Обновить все</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительная карточка с детальной информацией */}
      <Card>
        <CardHeader>
          <CardTitle>Детальная информация о системе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Информация о контекстах */}
            <div>
              <h4 className="font-medium mb-3">Доступные контексты:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>window.fitAccessDebug</span>
                  <Badge variant={status.debugSystem ? "default" : "secondary"}>
                    {status.debugSystem ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>window.fitAccessDebug.schedule</span>
                  <Badge variant={status.scheduleContext ? "default" : "secondary"}>
                    {status.scheduleContext ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>window.fitAccessDebug.dashboard</span>
                  <Badge variant={status.dashboardContext ? "default" : "secondary"}>
                    {status.dashboardContext ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>window.fitAccessDebug.superAdmin</span>
                  <Badge variant={status.superAdminContext ? "default" : "secondary"}>
                    {status.superAdminContext ? '✅' : '❌'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Информация о функциях */}
            <div>
              <h4 className="font-medium mb-3">Доступные функции:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>window.diagnoseContexts</span>
                  <Badge variant={typeof window !== 'undefined' && typeof window.diagnoseContexts !== 'undefined' ? "default" : "secondary"}>
                    {typeof window !== 'undefined' && typeof window.diagnoseContexts !== 'undefined' ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>window.forceRegisterContexts</span>
                  <Badge variant={typeof window !== 'undefined' && typeof window.forceRegisterContexts !== 'undefined' ? "default" : "secondary"}>
                    {typeof window !== 'undefined' && typeof window.forceRegisterContexts !== 'undefined' ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>fitAccessDebug.help</span>
                  <Badge variant={typeof window !== 'undefined' && isFunctionAvailable(window.fitAccessDebug, 'help') ? "default" : "secondary"}>
                    {typeof window !== 'undefined' && isFunctionAvailable(window.fitAccessDebug, 'help') ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>fitAccessDebug.sync</span>
                  <Badge variant={typeof window !== 'undefined' && isFunctionAvailable(window.fitAccessDebug, 'sync') ? "default" : "secondary"}>
                    {typeof window !== 'undefined' && isFunctionAvailable(window.fitAccessDebug, 'sync') ? '✅' : '❌'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки для принудительной инициализации */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Принудительные действия:</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => executeQuickAction('Принудительная инициализация debug системы', () => {
                  ensureDebugSystem();
                  checkSystemStatus();
                })}
              >
                🔧 Инициализировать debug
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => executeQuickAction('Принудительная регистрация контекстов', () => {
                  if (typeof window.forceRegisterContexts !== 'undefined' && typeof window.forceRegisterContexts === 'function') {
                    window.forceRegisterContexts();
                    checkSystemStatus();
                  } else {
                    throw new Error('Функция forceRegisterContexts недоступна');
                  }
                })}
              >
                📋 Зарегистрировать контексты
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => executeQuickAction('Очистка debug данных', () => {
                  if (window.fitAccessDebug) {
                    // Очищаем данные но сохраняем структуру
                    if (window.fitAccessDebug.schedule) {
                      window.fitAccessDebug.schedule.events = [];
                    }
                    if (window.fitAccessDebug.dashboard) {
                      window.fitAccessDebug.dashboard.notifications = [];
                    }
                    if (window.fitAccessDebug.notifications) {
                      window.fitAccessDebug.notifications = [];
                    }
                    checkSystemStatus();
                  } else {
                    throw new Error('Debug система недоступна');
                  }
                })}
              >
                🗑️ Очистить данные
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Карточка с реальными данными */}
      <Card>
        <CardHeader>
          <CardTitle>Текущие данные в системе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">События Schedule</h5>
              <div className="text-2xl font-bold text-blue-600">
                {typeof window !== 'undefined' && window.fitAccessDebug?.schedule?.events?.length || 0}
              </div>
              <div className="text-sm text-blue-600">активных событий</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-800 mb-2">Уведомления Dashboard</h5>
              <div className="text-2xl font-bold text-green-600">
                {typeof window !== 'undefined' && window.fitAccessDebug?.dashboard?.notifications?.length || 0}
              </div>
              <div className="text-sm text-green-600">уведомлений</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-medium text-purple-800 mb-2">Общие уведомления</h5>
              <div className="text-2xl font-bold text-purple-600">
                {typeof window !== 'undefined' && window.fitAccessDebug?.notifications?.length || 0}
              </div>
              <div className="text-sm text-purple-600">в системе</div>
            </div>
          </div>
          
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => executeQuickAction('Обновление счетчиков', () => {
              checkSystemStatus();
              // Принудительно обновляем компонент
              setStatus(prevStatus => ({ ...prevStatus }));
            })}
          >
            🔄 Обновить счетчики
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

