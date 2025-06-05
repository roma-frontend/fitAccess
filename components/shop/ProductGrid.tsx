// Обновите ProductGrid.tsx
import React, { memo, useEffect } from 'react';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';
import { useProductsStore } from '@/stores/productsStore';
import ProductCard from './ProductCard';
import { Loader2, Package, AlertCircle } from 'lucide-react';

const ProductGrid = memo(() => {
  // Получаем данные из API - исправляем destructuring
  const { products: apiProducts, isLoading: apiLoading, error: apiError } = useShopProductsAPI();
  
  // Получаем состояние из store
  const { 
    filteredProducts, 
    loading: storeLoading, 
    error: storeError,
    setProducts,
    setLoading,
    setError 
  } = useProductsStore();

  // Синхронизируем API данные со store
  useEffect(() => {
    setLoading(apiLoading);
  }, [apiLoading, setLoading]);

  useEffect(() => {
    setError(apiError);
  }, [apiError, setError]);

  useEffect(() => {
    if (apiProducts && apiProducts.length > 0) {
      console.log('🔄 ProductGrid: Обновляем store с продуктами:', apiProducts.length);
      setProducts(apiProducts);
    }
  }, [apiProducts, setProducts]);

  const loading = apiLoading || storeLoading;
  const error = apiError || storeError;

  // Остальная логика остается той же...
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Загружаем продукты...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-2">Ошибка загрузки продуктов</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Продукты не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';
export default ProductGrid;
