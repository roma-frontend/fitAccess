"use client";

import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, User, Mail } from 'lucide-react';
import { ShopPaymentItem } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CheckoutForm from './Checkout/CheckoutForm';

interface PaymentFormProps {
  items: ShopPaymentItem[];
  totalAmount: number;
  pickupType: string;
  notes?: string;
  onSuccess: (receipt: any) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  items,
  totalAmount,
  pickupType,
  notes,
  onSuccess,
  onError
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // ✅ Состояние для данных пользователя
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // ✅ Отладка состояния
  console.log('🔍 PaymentForm state:', {
    user,
    authLoading,
    customerData,
    showCustomerForm,
    dataReady,
    clientSecret: !!clientSecret
  });

  // ✅ Инициализируем данные пользователя
  useEffect(() => {
    console.log('🔄 PaymentForm: useEffect для инициализации данных', { user, authLoading });
    
    if (!authLoading) {
      if (user && user.email && user.name) {
        console.log('👤 PaymentForm: пользователь найден с полными данными:', user);
        setCustomerData({
          email: user.email,
          name: user.name,
          phone: '' // ✅ Всегда пустой, так как user.phone не существует
        });
        setShowCustomerForm(false);
        setDataReady(true);
      } else if (user) {
        console.log('⚠️ PaymentForm: пользователь найден, но данные неполные:', user);
        setCustomerData({
          email: user.email || '',
          name: user.name || '',
          phone: ''
        });
        setShowCustomerForm(true);
        setDataReady(false);
      } else {
        console.log('👤 PaymentForm: пользователь не найден, показываем форму');
        setCustomerData({
          email: '',
          name: '',
          phone: ''
        });
        setShowCustomerForm(true);
        setDataReady(false);
      }
    }
  }, [user, authLoading]);

  // ✅ Создаем PaymentIntent только когда данные готовы
  useEffect(() => {
    console.log('🔄 PaymentForm: useEffect для создания PaymentIntent', {
      dataReady,
      clientSecret: !!clientSecret,
      loading,
      customerData
    });

    if (dataReady && !clientSecret && !loading) {
      console.log('🚀 PaymentForm: условия выполнены, создаем PaymentIntent');
      createPaymentIntent();
    }
  }, [dataReady, clientSecret, loading]);

  const createPaymentIntent = async () => {
    console.log('💳 PaymentForm: начинаем создание PaymentIntent');
    console.log('📋 PaymentForm: текущие данные:', {
      user,
      customerData,
      finalEmail: user?.email || customerData.email,
      finalName: user?.name || customerData.name
    });

    // ✅ Получаем финальные данные
    const finalEmail = user?.email || customerData.email;
    const finalName = user?.name || customerData.name;
    const finalPhone = customerData.phone; // ✅ Только из формы
    
    // ✅ Проверяем обязательные поля
    if (!finalEmail || !finalName) {
      const errorMsg = `Недостаточно данных: email="${finalEmail}", name="${finalName}"`;
      console.error('❌ PaymentForm:', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      toast({
        title: "Подготовка к оплате",
        description: "Инициализируем платежную систему...",
      });

      // ✅ Подготавливаем данные для API
      const requestData = {
        items,
        totalAmount,
        pickupType,
        notes: notes || '',
        userId: user?.id || 'guest',
        memberId: user?.id || undefined,
        memberEmail: finalEmail,
        customerName: finalName,
        customerPhone: finalPhone || undefined,
      };

      console.log('📡 PaymentForm: отправляем запрос с данными:', requestData);

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 PaymentForm: получен ответ:', {
        status: response.status,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📡 PaymentForm: данные ответа:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);

      toast({
        title: "Готово к оплате",
        description: "Платежная форма готова к использованию",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания платежа';
      console.error('❌ PaymentForm: ошибка создания PaymentIntent:', errorMessage);
      setError(errorMessage);
      onError(errorMessage);
      
      toast({
        title: "Ошибка инициализации",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerDataSubmit = () => {
    console.log('✅ PaymentForm: обработка отправки формы клиента:', customerData);

    if (!customerData.email || !customerData.name) {
      toast({
        title: "Заполните данные",
        description: "Email и имя обязательны для оформления заказа",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ PaymentForm: данные клиента валидны, устанавливаем dataReady = true');
    setDataReady(true);
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
    locale: 'ru' as const,
  };

  // ✅ Показываем загрузку пока определяем пользователя
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Проверка авторизации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Проверяем данные пользователя...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Показываем форму данных клиента
  if (showCustomerForm && !dataReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Данные для заказа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Для оформления заказа укажите ваши контактные данные:
          </p>
          
          {/* ✅ Отладочная информация (только в development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Отладка:</strong><br/>
              User: {user ? 'найден' : 'не найден'}<br/>
              User email: {user?.email || 'нет'}<br/>
              User name: {user?.name || 'нет'}<br/>
              Form email: {customerData.email}<br/>
              Form name: {customerData.name}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={customerData.email}
                  onChange={(e) => {
                    console.log('📝 Email изменен:', e.target.value);
                    setCustomerData(prev => ({ ...prev, email: e.target.value }));
                  }}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="name">Имя *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={customerData.name}
                  onChange={(e) => {
                    console.log('📝 Имя изменено:', e.target.value);
                    setCustomerData(prev => ({ ...prev, name: e.target.value }));
                  }}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Телефон (необязательно)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={customerData.phone}
                onChange={(e) => {
                  console.log('📝 Телефон изменен:', e.target.value);
                  setCustomerData(prev => ({ ...prev, phone: e.target.value }));
                }}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleCustomerDataSubmit}
            disabled={loading || !customerData.email.trim() || !customerData.name.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Подготовка платежа...
              </>
            ) : (
              'Продолжить к оплате'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Подготовка к оплате</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Инициализация платежной формы...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ошибка оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 mb-4">{error}</div>
          
          {/* ✅ Расширенная отладочная информация (только в development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
              <p><strong>Отладочная информация:</strong></p>
              <p>User: {user ? 'авторизован' : 'не авторизован'}</p>
              <p>User ID: {user?.id || 'нет'}</p>
              <p>User Email: {user?.email || 'нет'}</p>
              <p>User Name: {user?.name || 'нет'}</p>
              <p>Form Email: {customerData.email || 'нет'}</p>
              <p>Form Name: {customerData.name || 'нет'}</p>
              <p>Form Phone: {customerData.phone || 'нет'}</p>
              <p>Show Form: {showCustomerForm ? 'да' : 'нет'}</p>
              <p>Data Ready: {dataReady ? 'да' : 'нет'}</p>
            </div>
          )}
          
          <Button
            onClick={() => {
              console.log('🔄 PaymentForm: повторная попытка');
              setError('');
              if (dataReady) {
                createPaymentIntent();
              } else {
                setShowCustomerForm(true);
              }
            }}
            disabled={loading}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Загрузка...</CardTitle>
        </CardHeader>
        <CardContent>
                    <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оплата заказа</CardTitle>
        {/* ✅ Показываем данные клиента (без user.phone) */}
        <div className="text-sm text-gray-600">
          <p>👤 {user?.name || customerData.name}</p>
          <p>📧 {user?.email || customerData.email}</p>
          {customerData.phone && (
            <p>📞 {customerData.phone}</p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            paymentIntentId={paymentIntentId}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}

