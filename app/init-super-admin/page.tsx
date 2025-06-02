// app/init-super-admin/page.tsx (новый файл)
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2 } from "lucide-react";

export default function InitSuperAdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [exists, setExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/create-super-admin', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setExists(data.exists);
      }
    } catch (error) {
      console.error('Ошибка проверки супер-админа:', error);
    } finally {
      setChecking(false);
    }
  };

  const createSuperAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-super-admin', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setExists(data.exists);
      }
    } catch (error) {
      console.error('Ошибка создания супер-админа:', error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Проверка системы...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {exists ? 'Супер-админ уже существует!' : 'Супер-админ создан!'}
            </h2>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-purple-800 mb-2">Данные для входа:</h4>
              <div className="text-sm text-purple-700 space-y-1">
                <p><strong>Email:</strong> romangulanyan@gmail.com</p>
                <p><strong>Пароль:</strong> Hovik-1970</p>
                <Badge className="bg-purple-100 text-purple-800 mt-2">Супер-администратор</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/staff-login'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Войти в систему
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                На главную
              </Button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Возможности супер-админа:</h4>
              <ul className="text-sm text-yellow-700 space-y-1 text-left">
                <li>• Создание и управление всеми пользователями</li>
                <li>• Назначение ролей админов и менеджеров</li>
                <li>• Полный доступ к системе</li>
                <li>• Управление настройками</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Инициализация системы</CardTitle>
          <CardDescription>
            Создание супер-администратора для управления системой
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Будет создан супер-админ:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Email:</strong> romangulanyan@gmail.com</p>
                <p><strong>Имя:</strong> Роман Гуланян</p>
                <p><strong>Роль:</strong> Супер-администратор</p>
              </div>
            </div>

            <Button 
              onClick={createSuperAdmin}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Создать супер-админа
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
