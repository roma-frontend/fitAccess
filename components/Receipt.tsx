import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatProductPrice } from '@/hooks/useShopProducts';

interface ReceiptProps {
  receipt: {
    receiptId: string;
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    paidAt: string;
    customer: {
      email: string;
      name: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    company: {
      name: string;
      address: string;
      inn: string;
      phone: string;
    };
  };
}

export default function Receipt({ receipt }: ReceiptProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{receipt.company.name}</CardTitle>
        <p className="text-sm text-gray-600">{receipt.company.address}</p>
        <p className="text-sm text-gray-600">ИНН: {receipt.company.inn}</p>
        <p className="text-sm text-gray-600">{receipt.company.phone}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Чек #{receipt.receiptId}</h3>
          <p className="text-sm text-gray-600">Заказ: {receipt.orderId}</p>
          <p className="text-sm text-gray-600">
            Дата: {new Date(receipt.paidAt).toLocaleString('ru-RU')}
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Покупатель:</h4>
          <p className="text-sm">{receipt.customer.name}</p>
          <p className="text-sm text-gray-600">{receipt.customer.email}</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Товары:</h4>
                    <div className="space-y-2">
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-600">
                    {item.quantity} × {formatProductPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  {formatProductPrice(item.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Итого:</span>
            <span>{formatProductPrice(receipt.amount)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Оплачено картой
          </p>
        </div>

        <div className="border-t pt-4 text-center text-xs text-gray-500">
          <p>ID платежа: {receipt.paymentId}</p>
          <p className="mt-2">Спасибо за покупку!</p>
        </div>
      </CardContent>
    </Card>
  );
}

