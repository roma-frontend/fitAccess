// app/test-shop/page.tsx (полная обновленная версия)
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingCart, 
  User, 
  CheckCircle, 
  AlertCircle, 
  LogIn,
  RefreshCw,
  Shield
} from "lucide-react";

export default function TestShopPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setAuthStatus(data);
      console.log('Auth status:', data);
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      setAuthStatus({ authenticated: false, error: 'Ошибка проверки' });
    } finally {
      setLoading(false);
    }
  };

  const loginAsMember = async () => {
    try {
      // Здесь можно добавить быстрый вход участника для тестирования
      // Пока просто перенаправляем на страницу входа
      sessionStorage.setItem('returnUrl', '/shop');
      window.location.href = '/member-login';
    } catch (error) {
      alert('Ошибка входа');
      console.error('Login error:', error);
    }
  };

  const loginAsStaff = async () => {
    try {
      const response = await fetch('/api/debug/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-login',
          email: 'romangulanyan@gmail.com',
          password: 'Hovik-1970'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Вход выполнен как супер-админ! Но магазин недоступен для персонала.');
        checkAuth(); // Обновляем статус
      } else {
        alert('Ошибка входа: ' + result.error);
      }
    } catch (error) {
      alert('Ошибка входа');
      console.error('Login error:', error);
    }
  };

  const goToShop = () => {
    window.location.href = '/shop';
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'super-admin':
        return 'Супер Администратор';
      case 'manager':
        return 'Менеджер';
      case 'trainer':
        return 'Тренер';
      case 'member':
        return 'Участник';
      default:
        return role;
    }
  };

  const canAccessShop = authStatus?.authenticated && authStatus?.user?.role === 'member';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Проверка доступа к магазину...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Тест магазина</h1>
          <p className="text-gray-600">Проверка доступа для разных ролей</p>
        </div>

        {/* Статус авторизации */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Статус авторизации
            </CardTitle>
          </CardHeader>
          <CardContent>
            {authStatus?.authenticated ? (
              <div className="space-y-3">
                <Alert className={canAccessShop ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                  {canAccessShop ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <AlertDescription className={canAccessShop ? "text-green-800" : "text-yellow-800"}>
                    <strong>Авторизован:</strong> {authStatus.user?.name} ({authStatus.user?.email})
                    <br />
                    <strong>Доступ к магазину:</strong> {canAccessShop ? 'РАЗРЕШЕН' : 'ЗАПРЕЩЕН'}
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Роль:</span>
                  <Badge variant={canAccessShop ? "default" : "secondary"}>
                    {getRoleDisplayName(authStatus.user?.role)}
                  </Badge>
                </div>
                
                {canAccessShop ? (
                  <Button onClick={goToShop} className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Перейти в магазин
                  </Button>
                ) : (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Магазин доступен только для <strong>участников</strong> фитнес-центра.
                      <br />
                      Персонал может управлять заказами через админ-панель.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Не авторизован:</strong> {authStatus?.error || 'Требуется вход в систему'}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Button onClick={loginAsMember} className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти как участник
                  </Button>
                  
                  <Button onClick={loginAsStaff} variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Войти как персонал (тест)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Действия */}
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={checkAuth} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Проверить снова
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/debug-auth'} 
              variant="outline" 
              className="w-full"
            >
              Детальная отладка
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/member-login'} 
              variant="outline" 
              className="w-full"
            >
              Вход для участников
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/staff-login'} 
              variant="outline" 
              className="w-full"
            >
              Вход для персонала
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="w-full"
            >
              На главную
            </Button>
          </CardContent>
        </Card>

        {/* Информация */}
        <Card>
          <CardHeader>
            <CardTitle>Правила доступа</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-3">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="font-medium text-green-800 mb-1">✅ Участники (Members)</h4>
                <p className="text-green-700">Полный доступ к магазину, могут покупать товары</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-1">⚠️ Персонал (Staff)</h4>
                <p className="text-yellow-700">Доступ к админ-панели, но НЕ к покупкам в магазине</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h4 className="font-medium text-red-800 mb-1">❌ Гости</h4>
                <p className="text-red-700">Нет доступа к магазину, требуется авторизация</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Тестовые данные */}
        <Card>
          <CardHeader>
            <CardTitle>Тестовые данные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Для тестирования персонала:</strong></p>
              <div className="bg-gray-50 p-3 rounded">
                <p>Email: romangulanyan@gmail.com</p>
                <p>Пароль: Hovik-1970</p>
                <p>Роль: Супер-администратор</p>
              </div>
              
              <p className="mt-4"><strong>Тестовая карта Stripe:</strong></p>
              <div className="bg-gray-50 p-3 rounded">
                <p>Номер: 4242 4242 4242 4242</p>
                <p>Срок: любая будущая дата</p>
                <p>CVC: любые 3 цифры</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
