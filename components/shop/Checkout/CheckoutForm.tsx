"use client";

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  paymentIntentId: string;
  onSuccess: (receipt: any) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({
  paymentIntentId,
  onSuccess,
  onError
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      toast({
        title: "Обработка платежа",
        description: "Пожалуйста, подождите...",
      });

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/shop/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Платеж успешен!",
          description: "Подтверждаем заказ...",
        });

        const confirmResponse = await fetch('/api/payments/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId: paymentIntentId,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmData.success) {
          toast({
            title: "Заказ подтвержден!",
            description: "Перенаправляем к деталям заказа...",
          });
          onSuccess(confirmData.receipt);
        } else {
          throw new Error(confirmData.error || 'Ошибка подтверждения платежа');
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setMessage(errorMessage);
      onError(errorMessage);
      
      toast({
        title: "Ошибка платежа",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (error.type === 'card_error' || error.type === 'validation_error') {
      return error.message;
    }
    
    switch (error.code) {
      case 'card_declined':
        return 'Карта отклонена. Попробуйте другую карту или обратитесь в банк.';
      case 'insufficient_funds':
        return 'Недостаточно средств на карте.';
      case 'expired_card':
        return 'Срок действия карты истек.';
      case 'incorrect_cvc':
        return 'Неверный CVC код.';
      case 'processing_error':
        return 'Ошибка обработки платежа. Попробуйте еще раз.';
      default:
        return error.message || 'Произошла ошибка при обработке платежа';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Платежная информация</h3>
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
              }
            }
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Адрес для выставления счета</h3>
        <AddressElement 
          options={{
            mode: 'billing',
            allowedCountries: ['RU'],
            defaultValues: {
              name: '',
              address: {
                country: 'RU',
              }
            }
          }}
        />
      </div>

      {message && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Обработка платежа...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Оплатить заказ
          </>
        )}
      </Button>

      <div className="text-sm text-gray-500 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Ваши платежные данные защищены SSL-шифрованием</span>
        </div>
        <p>Платежи обрабатываются через Stripe</p>
      </div>
    </form>
  );
}
