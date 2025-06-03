import React, { memo } from 'react';
import { useCartStoreWithDefaults } from '@/hooks/useStoreWithDefaults';
import { useShopStore } from '@/stores/shopStore';
import { useHydration } from '@/hooks/useHydration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

const CartButton = memo(() => {
  const isHydrated = useHydration();
  const { toggleCart, getTotalItems } = useCartStoreWithDefaults();
  const { orderStep } = useShopStore();
  
  // Показываем базовую версию до гидратации
  if (!isHydrated) {
    return (
      <Button 
        variant="outline" 
        className="relative"
        aria-label="Корзина (загрузка...)"
        disabled
      >
        <ShoppingCart className="w-5 h-5" aria-hidden="true" />
        <span className="ml-2 hidden sm:inline">Корзина</span>
      </Button>
    );
  }

  const totalItems = getTotalItems();
  const hasItems = totalItems > 0;

  // Не показываем кнопку корзины на шагах оплаты и подтверждения
  if (orderStep !== 'shop') {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={toggleCart}
      className="relative"
      aria-label={
        hasItems 
          ? `Открыть корзину с ${totalItems} товарами`
          : "Открыть пустую корзину"
      }
    >
      <ShoppingCart className="w-5 h-5" aria-hidden="true" />
      
      {hasItems && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
          aria-label={`Количество товаров в корзине: ${totalItems}`}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
      
      <span className="ml-2 hidden sm:inline">
        Корзина
        {hasItems && (
          <span className="sr-only"> ({totalItems} товаров)</span>
        )}
      </span>
    </Button>
  );
});

CartButton.displayName = 'CartButton';

export default CartButton;

