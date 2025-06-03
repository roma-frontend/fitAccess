"use client";

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import CheckoutForm from './CheckoutForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { ShopPaymentItem } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  React.useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      toast({
        title: "Подготовка к оплате",
        description: "Инициализируем платежную систему...",
      });

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          totalAmount,
          pickupType,
          notes,
        }),
      });

      const data = await response.json();

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
          <Button
            onClick={createPaymentIntent}
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
