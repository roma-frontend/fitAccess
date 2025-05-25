// app/debug-auth/page.tsx (исправленная версия)
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<string>('');
  const [hasAuthToken, setHasAuthToken] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAuth();
      updateCookieInfo();
    }
  }, [mounted]);

  const updateCookieInfo = () => {
    if (mounted && typeof window !== 'undefined') {
      setCookies(document.cookie || 'Куки отсутствуют');
      setHasAuthToken(document.cookie.includes('auth_token'));
    }
  };

  const checkAuth = async () => {
    if (!mounted) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setAuthStatus(data);
      updateCookieInfo();
    } catch (error) {
      setAuthStatus({ error: 'Ошибка проверки' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      checkAuth();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const clearAllCookies = () => {
    if (mounted && typeof window !== 'undefined') {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      checkAuth();
    }
  };

  // Показываем загрузку пока компонент не смонтирован
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Инициализация...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Отладка аутентификации
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkAuth}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Проверка статуса аутентификации и токенов
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p>Проверка аутентификации...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Статус аутентификации */}
                <div className="flex items-center gap-3">
                  {authStatus?.authenticated ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {authStatus?.authenticated ? 'Аутентифицирован' : 'Не аутентифицирован'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {authStatus?.authenticated 
                        ? 'Токен валиден и пользователь авторизован'
                        : 'Токен отсутствует или невалиден'
                      }
                    </p>
                  </div>
                </div>

                {/* Информация о пользователе */}
                {authStatus?.user && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3">Данные пользователя:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <p className="font-mono break-all">{authStatus.user.userId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p>{authStatus.user.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Имя:</span>
                        <p>{authStatus.user.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Роль:</span>
                        <Badge className={
                          authStatus.user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          authStatus.user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          authStatus.user.role === 'trainer' ? 'bg-green-100 text-green-800' :
                          authStatus.user.role === 'member' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {authStatus.user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ошибка */}
                {authStatus?.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Ошибка:</h4>
                    <p className="text-sm text-red-700">{authStatus.error}</p>
                  </div>
                )}

                {/* Действия */}
                <div className="flex gap-4 flex-wrap">
                  {authStatus?.authenticated ? (
                    <Button 
                      variant="outline" 
                      onClick={logout}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Выйти
                    </Button>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/member-login'}
                      >
                        Войти как участник
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/staff-login'}
                      >
                        Войти как персонал
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={clearAllCookies}
                    className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                  >
                    Очистить все куки
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Быстрые ссылки */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Быстрые ссылки для тестирования</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={() => window.location.href = '/setup-users'}
              >
                <span className="text-sm font-medium">Создать</span>
                <span className="text-xs text-gray-500">пользователей</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={() => window.location.href = '/member-login'}
              >
                <span className="text-sm font-medium">Вход</span>
                <span className="text-xs text-gray-500">участника</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={() => window.location.href = '/staff-login'}
              >
                <span className="text-sm font-medium">Вход</span>
                <span className="text-xs text-gray-500">персонала</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={() => window.location.href = '/admin'}
              >
                <span className="text-sm font-medium">Админ</span>
                <span className="text-xs text-gray-500">панель</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Информация о куки - только после монтирования */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🍪 Информация о куки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>auth_token:</strong> 
                <span className={hasAuthToken ? 'text-green-600' : 'text-red-600'}>
                  {hasAuthToken ? ' ✅ Установлен' : ' ❌ Отсутствует'}
                </span>
              </p>
              <p><strong>Все куки:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {cookies}
              </pre>
              
              {/* Дополнительная информация - только после монтирования */}
              {mounted && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="font-medium text-blue-800 mb-2">Диагностика:</h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Браузер: {navigator.userAgent.split(' ')[0]}</li>
                    <li>• URL: {window.location.href}</li>
                    <li>• Протокол: {window.location.protocol}</li>
                    <li>• Время проверки: {new Date().toLocaleString('ru-RU')}</li>
                    <li>• Компонент смонтирован: ✅</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
