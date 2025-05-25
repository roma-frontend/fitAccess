"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CreditCard, Lock } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  items: any[];
  totalAmount: number;
  pickupType: string;
  notes: string;
  onSuccess: (receipt: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  items,
  totalAmount,
  pickupType,
  notes,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setError('');

  console.log('🔐 Начинаем процесс оплаты...');
  
  // Проверяем авторизацию перед началом
  try {
    const authCheck = await fetch('/api/auth/check');
    const authData = await authCheck.json();
    console.log('👤 Статус авторизации:', authData);
    
    if (!authData.authenticated) {
      setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
      return;
    }
    
    if (authData.user.role !== 'member') {
      setError('Покупки доступны только участникам фитнес-центра.');
      return;
    }
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    setError('Ошибка проверки авторизации');
    return;
  }

    if (!stripe || !elements) {
      setError("Платежная система не загружена. Попробуйте обновить страницу.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Форма карты не найдена");
      return;
    }

    setProcessing(true);

    try {
      console.log("🔐 Начинаем процесс оплаты...");

      // Создаем Payment Intent
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount,
          pickupType,
          notes,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Ошибка создания платежа");
      }

      const { clientSecret, paymentIntentId } = responseData;

      if (!clientSecret) {
        throw new Error("Не получен секретный ключ платежа");
      }

      console.log("✅ Payment Intent создан, подтверждаем платеж...");

      // Подтверждаем платеж
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        console.error("❌ Ошибка Stripe:", stripeError);
        throw new Error(getStripeErrorMessage(stripeError));
      }

      if (paymentIntent?.status === "succeeded") {
        console.log("✅ Платеж успешен, создаем заказ...");

        // Создаем заказ
        const orderResponse = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            totalAmount,
            pickupType,
            paymentMethod: "card",
            notes,
            status: "confirmed",
            paymentIntentId,
          }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderData.error || "Ошибка создания заказа");
        }

        // Генерируем чек
        const receipt = {
          receiptId: `PAY-${paymentIntentId.slice(-8)}`,
          orderId: orderData.orderId,
          paymentId: paymentIntentId,
          amount: totalAmount,
          currency: "RUB",
          paidAt: new Date().toISOString(),
          paymentMethod: "Банковская карта",
          items: items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.totalPrice,
          })),
          company: {
            name: "FitAccess",
            address: "г. Москва, ул. Спортивная, д. 1",
            inn: "1234567890",
            phone: "+7 (495) 123-45-67",
          },
        };

        console.log("✅ Заказ создан, вызываем onSuccess");
        onSuccess(receipt);

        toast({
          title: "Оплата прошла успешно!",
          description: "Ваш заказ принят в обработку",
        });
      } else {
        throw new Error(`Неожиданный статус платежа: ${paymentIntent?.status}`);
      }
    } catch (error) {
      console.error("💥 Ошибка обработки платежа:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка платежа";
      setError(errorMessage);
      onError(errorMessage);

      toast({
        variant: "destructive",
        title: "Ошибка оплаты",
        description: errorMessage,
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStripeErrorMessage = (error: any): string => {
    switch (error.code) {
      case "card_declined":
        return "Карта отклонена. Проверьте данные карты или используйте другую карту.";
      case "expired_card":
        return "Срок действия карты истек.";
      case "incorrect_cvc":
        return "Неверный CVC код.";
      case "insufficient_funds":
        return "Недостаточно средств на карте.";
      case "invalid_expiry_month":
        return "Неверный месяц истечения срока действия.";
      case "invalid_expiry_year":
        return "Неверный год истечения срока действия.";
      case "invalid_number":
        return "Неверный номер карты.";
      case "processing_error":
        return "Ошибка обработки платежа. Попробуйте еще раз.";
      default:
        return error.message || "Ошибка при обработке платежа";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Оплата банковской картой
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Данные карты</label>
            <div className="p-4 border rounded-lg bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">К оплате:</span>
              <span className="text-xl font-bold">{totalAmount} ₽</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                Способ получения:{" "}
                {pickupType === "counter"
                  ? "На стойке ресепшн"
                  : pickupType === "locker"
                    ? "В автомате"
                    : "За столиком"}
              </p>
              {notes && <p>Комментарий: {notes}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Обработка платежа...
              </div>
            ) : (
              `Оплатить ${totalAmount} ₽`
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Lock className="h-3 w-3" />
            <span>Ваши данные защищены SSL-шифрованием</span>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Нажимая "Оплатить", вы соглашаетесь с условиями оплаты.
              <br />
              Данные карты не сохраняются на наших серверах.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
