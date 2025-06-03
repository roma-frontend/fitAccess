import React, { memo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useShopStore } from '@/stores/shopStore';
import { formatPrice } from '@/utils/priceUtils';
import CartItem from './CartItem';

const CartView = memo(() => {
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const { setOrderStep } = useShopStore();

  if (items.length === 0) {
    return <EmptyCart onContinueShopping={() => setOrderStep('shop')} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Корзина</CardTitle>
          <CardDescription>
            {getTotalItems()} товаров на сумму {formatPrice(getTotalPrice())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Итого:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOrderStep('shop')}
                className="flex-1"
              >
                Продолжить покупки
              </Button>
              <Button
                onClick={() => setOrderStep('checkout')}
                className="flex-1"
              >
                Оформить заказ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

const EmptyCart = memo(({ onContinueShopping }: { onContinueShopping: () => void }) => (
  <div className="max-w-4xl mx-auto">
    <Card>
      <CardContent className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Корзина пуста
        </h3>
        <p className="text-gray-600 mb-4">
          Добавьте товары из магазина
        </p>
        <Button onClick={onContinueShopping}>
          Перейти в магазин
        </Button>
      </CardContent>
    </Card>
  </div>
));

CartView.displayName = 'CartView';
EmptyCart.displayName = 'EmptyCart';

export default CartView;
