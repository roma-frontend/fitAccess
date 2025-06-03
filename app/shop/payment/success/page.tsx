"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShopStore } from '@/stores/shopStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { setOrderStep } = useShopStore();
  
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    if (paymentIntentId) {
      // Переходим к подтверждению заказа
      setOrderStep('confirm');
    }
  }, [paymentIntentId, setOrderStep]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Платеж успешен!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Ваш заказ был успешно оплачен и передан в обработку.
          </p>
          
          {paymentIntentId && (
            <p className="text-sm text-gray-500">
              ID платежа: {paymentIntentId}
            </p>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                                Вернуться в магазин
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/orders">
                Мои заказы
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

