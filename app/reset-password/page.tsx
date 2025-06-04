// app/reset-password/page.tsx (обновленная версия с перенаправлением)
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ValidatedInput } from '@/components/ValidatedInput';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { validatePasswordStrength } from '@/utils/validation';
import { Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const userType = searchParams.get('type') || 'member';

  // Проверяем токен при загрузке
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Недействительная ссылка для сброса пароля');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userType })
        });

        const data = await response.json();
        
        if (data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(data.error || 'Токен недействителен или истек');
        }
            } catch (error) {
        setTokenValid(false);
        setError('Ошибка проверки токена');
      }
    };

    verifyToken();
  }, [token, userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    const passwordStrength = validatePasswordStrength(password);
    if (passwordStrength.score < 3) {
      setError('Пароль недостаточно надежный');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          userType
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Пароль успешно изменен! 🎉',
          description: 'Перенаправляем на страницу входа...'
        });

        // Перенаправляем на страницу успеха
        setTimeout(() => {
          router.push(`/password-reset-success?type=${userType}`);
        }, 1500);
      } else {
        setError(data.error || 'Ошибка смены пароля');
      }
    } catch (error) {
      setError('Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePasswordStrength(password);
  const isFormValid = password && confirmPassword && password === confirmPassword && passwordStrength.score >= 3;

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Проверка ссылки...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Ссылка недействительна</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push(userType === 'staff' ? '/staff-login' : '/member-login')}
                className="w-full"
              >
                Вернуться к входу
              </Button>
              <Button
                onClick={() => router.push('/forgot-password')}
                variant="outline"
                className="w-full"
              >
                Запросить новую ссылку
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Новый пароль
            </CardTitle>
            <p className="text-gray-600">
              Создайте надежный пароль для вашего аккаунта
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Новый пароль *
                </label>
                <ValidatedInput
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  required
                  showPasswordToggle
                  className="h-11 w-full"
                />
                {password && (
                  <PasswordStrengthIndicator
                    strength={passwordStrength}
                    password={password}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Подтвердите пароль *
                </label>
                <ValidatedInput
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  required
                  showPasswordToggle
                  className="h-11 w-full"
                />
                {confirmPassword && (
                  <div className="mt-2">
                    {password === confirmPassword ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Пароли совпадают</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Пароли не совпадают</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full h-11 transition-all duration-300 ${
                  isFormValid
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Сохраняем...
                  </>
                ) : (
                  "Сохранить новый пароль"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Индикатор безопасности */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Требования к паролю
              </span>
            </div>
            <div className="space-y-1 text-xs text-green-800">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                }`} />
                <span>Минимум 8 символов</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`} />
                <span>Заглавные буквы</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`} />
                <span>Строчные буквы</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  /\d/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`} />
                <span>Цифры</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`} />
                <span>Специальные символы</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

