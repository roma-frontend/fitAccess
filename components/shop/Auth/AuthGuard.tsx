import React, { memo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, LogIn, Shield, AlertCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRoleDisplayName } from '@/utils/productUtils';
import { Badge } from '@/components/ui/badge';

interface AuthGuardProps {
  isAuthenticated: boolean;
  hasShopAccess: boolean;
  user: any;
  loading: boolean;
}

const AuthGuard = memo(({ isAuthenticated, hasShopAccess, user, loading }: AuthGuardProps) => {
  const router = useRouter();

  // Добавляем отладочную информацию
  useEffect(() => {
    console.log('🛡️ AuthGuard Debug:', {
      loading,
      isAuthenticated,
      hasShopAccess,
      userRole: user?.role,
      userEmail: user?.email,
      shouldShowGuard: loading || !isAuthenticated
    });
  }, [loading, isAuthenticated, hasShopAccess, user]);

  if (loading) {
    console.log('🔄 AuthGuard: Показываем загрузку');
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    console.log('❌ AuthGuard: Пользователь не авторизован');
    return <LoginRequired />;
  }

  // ИСПРАВЛЕНО: Убираем проверку hasShopAccess или делаем её более гибкой
  // Если пользователь авторизован, разрешаем доступ к магазину
  console.log('✅ AuthGuard: Пользователь авторизован, доступ разрешен');
  return null; // Доступ разрешен
});

// Остальные компоненты остаются без изменений...
const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Проверка доступа к магазину...</p>
    </div>
  </div>
));

const LoginRequired = memo(() => {
  const router = useRouter();

  const handleLogin = () => {
    sessionStorage.setItem("returnUrl", "/shop");
    router.push("/member-login");
  };

  const handleStaffLogin = () => {
    sessionStorage.setItem("returnUrl", "/shop");
    router.push("/staff-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Добро пожаловать в магазин FitAccess</CardTitle>
          <CardDescription>
            Для совершения покупок необходимо войти в систему
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Магазин доступен всем авторизованным пользователям
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Войти как участник
            </Button>

            <Button
              variant="outline"
              onClick={handleStaffLogin}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Вход для персонала
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full"
            >
              На главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AuthGuard.displayName = 'AuthGuard';
LoadingState.displayName = 'LoadingState';
LoginRequired.displayName = 'LoginRequired';

export default AuthGuard;
