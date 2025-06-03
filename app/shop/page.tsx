"use client";

import React from 'react';
import { useShopStore } from '@/stores/shopStore';
import OrderConfirmation from '@/components/OrderConfirmation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShopView from '@/components/shop/ShopView';
import PaymentView from '@/components/shop/Payment/PaymentView';

export default function ShopPage() {
  const { orderStep, setOrderStep } = useShopStore();

  const handleBackToShop = () => {
    setOrderStep('shop');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      {orderStep !== 'shop' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToShop}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться в магазин
            </Button>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="py-6">
        {orderStep === 'shop' && <ShopView />}
        {orderStep === 'payment' && <PaymentView />}
        {orderStep === 'confirm' && <OrderConfirmation />}
      </div>
    </div>
  );
}
