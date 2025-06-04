// app/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ValidatedInput } from '@/components/ValidatedInput';
import { Mail, ArrowLeft, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'member' | 'staff'>('member');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите email адрес'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), userType })
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        toast({
          title: 'Письмо отправлено! 📧',
          description: 'Проверьте вашу почту для восстановления пароля'
        });
      } else {
        throw new Error(data.error || 'Ошибка отправки письма');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить письмо'
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Письмо отправлено!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">
              Инструкции по восстановлению пароля отправлены на {email}
            </p>
            <p className="text-sm text-gray-500">
              Проверьте папку "Спам", если письмо не пришло в течение 5 минут
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Отправить повторно
              </Button>
              <Button
                onClick={() => router.push(userType === 'staff' ? '/staff-login' : '/member-login')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к входу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Восстановление пароля</CardTitle>
          <p className="text-gray-600">
            Введите email для получения инструкций
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Тип аккаунта
              </label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={userType === 'member' ? 'default' : 'outline'}
                  onClick={() => setUserType('member')}
                  className="flex-1"
                >
                  👤 Участник
                </Button>
                <Button
                  type="button"
                  variant={userType === 'staff' ? 'default' : 'outline'}
                  onClick={() => setUserType('staff')}
                  className="flex-1"
                >
                  🛡️ Персонал
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email адрес *
              </label>
              <ValidatedInput
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Отправляем...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Отправить инструкции
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => router.push(userType === 'staff' ? '/staff-login' : '/member-login')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
