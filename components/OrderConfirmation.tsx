// OrderConfirmation.tsx (исправленная версия)
import React from 'react';
import { useShopStore } from '@/stores/shopStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, CreditCard, Package } from 'lucide-react';
import Receipt from './Receipt';

export default function OrderConfirmation() {
  const { receipt, setOrderStep, resetOrder } = useShopStore();

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleBackToShop = () => {
    resetOrder();
  };

  if (!receipt) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p>Информация о заказе не найдена</p>
            <Button onClick={handleBackToShop} className="mt-4">
              Вернуться в магазин
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Безопасное получение email с fallback
  const customerEmail = receipt.customer?.email || 'ваш email';
  const orderId = receipt.orderId || receipt.receiptId || 'неизвестен';

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Индикатор прогресса */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Заказ завершен</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            {/* Шаг 1 - Корзина */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Корзина</span>
            </div>

            <div className="h-px bg-green-500 flex-1"></div>

            {/* Шаг 2 - Оплата */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Оплата</span>
            </div>

            <div className="h-px bg-green-500 flex-1"></div>

            {/* Шаг 3 - Подтверждение */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Завершено</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Сообщение об успехе */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Заказ успешно оформлен!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Ваш заказ #{orderId} был успешно оплачен и передан в обработку.
            </p>
            
            {/* ✅ Условное отображение email */}
            {customerEmail !== 'ваш email' && (
              <p className="text-sm text-gray-500">
                Вы получите уведомление на email {customerEmail} когда заказ будет готов к получению.
              </p>
            )}
            
            {/* Информация о получении */}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-blue-800 mb-2">Информация о получении</h4>
              <p className="text-sm text-blue-600">📍 Самовывоз из фитнес-центра FitAccess</p>
              <p className="text-sm text-blue-600">⏰ Готовность заказа: в течение 30 минут</p>
              <p className="text-sm text-blue-600">📞 Телефон: +7 (495) 123-45-67</p>
            </div>
          </CardContent>
        </Card>

        {/* Чек */}
        <div className="print:block">
          <Receipt receipt={receipt} />
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-4 justify-center print:hidden">
          <Button onClick={handlePrintReceipt} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Скачать чек
          </Button>
          <Button onClick={handleBackToShop}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в магазин
          </Button>
        </div>
      </div>
    </div>
  );
}
