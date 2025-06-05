"use client";

import React, { memo, useEffect } from 'react';
import { useProductsStore } from '@/stores/productsStore';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';

interface ConvexProductsProviderProps {
  children: React.ReactNode;
}

const ConvexProductsProvider = memo(({ children }: ConvexProductsProviderProps) => {
  const { products, isLoading, error, refetch } = useShopProductsAPI();
  
  // Получаем функции из store с правильной типизацией
  const setProducts = useProductsStore((state) => state.setProducts);
  const setLoading = useProductsStore((state) => state.setLoading);
  const setError = useProductsStore((state) => state.setError);

  useEffect(() => {
    console.log('🔄 ConvexProductsProvider: Обновление состояния', {
      isLoading,
      error,
      productsCount: products?.length || 0,
      hasProducts: products && products.length > 0
    });

    // Обновляем состояние в store
    setLoading(isLoading);
    setError(error);
    
    if (products) {
      setProducts(products);
      
      // Запускаем фильтрацию если есть продукты
      if (products.length > 0) {
        setTimeout(() => {
          useProductsStore.getState().filterProducts();
        }, 0);
      }
    }
  }, [products, isLoading, error, setProducts, setLoading, setError]);

  // Добавляем функцию перезагрузки в глобальный объект для отладки
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refetchProducts = refetch;
      console.log('🔧 ConvexProductsProvider: Добавлена функция window.refetchProducts() для отладки');
    }
  }, [refetch]);

  return <>{children}</>;
});

ConvexProductsProvider.displayName = 'ConvexProductsProvider';

export default ConvexProductsProvider;
