import React, { memo } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useShopStore } from '@/stores/shopStore';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';

const CheckoutView = memo(() => {
  const { items, getTotalPrice } = useCartStore();
  const { setOrderStep } = useShopStore();

  if (items.length === 0) {
    // Если корзина пуста, возвращаемся в магазин
    setOrderStep('shop');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CheckoutForm />
      <OrderSummary items={items} totalPrice={getTotalPrice()} />
    </div>
  );
});

CheckoutView.displayName = 'CheckoutView';

export default CheckoutView;
