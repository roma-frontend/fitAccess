import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';
import OrderDetails from './OrderDetails';
import NextSteps from './NextSteps';
import ReceiptSection from './ReceiptSection';

const OrderConfirmView = memo(() => {
  const { 
    paymentMethod, 
    pickupType, 
    receipt, 
    setOrderStep, 
    setShowReceipt,
    resetOrder 
  } = useShopStore();

  const handleNewOrder = () => {
    resetOrder();
    setOrderStep('shop');
  };

  const handleGoToDashboard = () => {
    window.location.href = '/member-dashboard';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Success Message */}
          <SuccessMessage paymentMethod={paymentMethod} receipt={receipt} />

          {/* Receipt Section */}
          {receipt && (
            <ReceiptSection 
              receipt={receipt} 
              onShowReceipt={() => setShowReceipt(true)} 
            />
          )}

          {/* Next Steps */}
          <NextSteps pickupType={pickupType} />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleGoToDashboard}
              className="flex-1"
            >
              В личный кабинет
            </Button>
            <Button onClick={handleNewOrder} className="flex-1">
              Заказать еще
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

const SuccessMessage = memo(({ 
  paymentMethod, 
  receipt 
}: { 
  paymentMethod: string; 
  receipt: any; 
}) => {
  const getOrderId = () => {
    return receipt?.receiptId || 
           receipt?.orderId || 
           Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {paymentMethod === "card" ? "Оплата прошла успешно!" : "Заказ принят!"}
      </h2>
      
      <p className="text-gray-600 mb-6">
        Ваш заказ №{getOrderId()}
        {paymentMethod === "card" ? " оплачен и принят" : " принят"} в обработку. 
        Ожидаемое время приготовления: 10-15 минут.
      </p>
    </>
  );
});

OrderConfirmView.displayName = 'OrderConfirmView';
SuccessMessage.displayName = 'SuccessMessage';

export default OrderConfirmView;
