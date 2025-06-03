"use client";

import React from 'react';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';
import { useProductsStore } from '@/stores/productsStore';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, Package, Plus } from 'lucide-react';

export default function ProductsGrid() {
  // Получаем данные из store
  const storeData = useProductsStore();
  
  // Проверяем, что store работает
  if (!storeData) {
    console.error('❌ ProductsGrid: useProductsStore вернул undefined');
    return <div>Ошибка загрузки store</div>;
  }

  const { 
    searchQuery, 
    selectedCategory, 
    priceRange, 
    sortBy, 
    sortOrder,
    resetFilters 
  } = storeData;

  console.log('🏪 ProductsGrid: Store данные:', {
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    sortOrder,
    storeType: typeof storeData
  });

  // Используем хук с параметрами из store
  const apiData = useShopProductsAPI({
    searchQuery,
    category: selectedCategory,
    priceRange,
    sortBy,
    sortOrder,
  });

  // Проверяем, что API хук работает
  if (!apiData) {
    console.error('❌ ProductsGrid: useShopProductsAPI вернул undefined');
    return <div>Ошибка загрузки API</div>;
  }

  const { products, isLoading, error, refetch, totalCount } = apiData;

  // Безопасная проверка products
  const safeProducts = Array.isArray(products) ? products : [];
  const safeTotalCount = typeof totalCount === 'number' ? totalCount : 0;

  console.log('🔍 ProductsGrid render:', {
    productsCount: safeProducts.length,
    isLoading,
    error,
    totalCount: safeTotalCount,
    searchQuery,
    selectedCategory,
    priceRange,
    productsType: typeof products,
    productsIsArray: Array.isArray(products),
    firstProduct: safeProducts[0]
  });

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Загружаем продукты...
          </h3>
          <p className="text-gray-500">
            Подключаемся к базе данных
          </p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ошибка загрузки продуктов
          </h3>
          <p className="text-gray-500 mb-4">
            {error}
          </p>
          <div className="space-y-2">
            <Button onClick={refetch} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/test-data'} 
              variant="secondary"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать тестовые данные
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Пустое состояние - нет продуктов
  if (!safeProducts || safeProducts.length === 0) {
    const hasFilters = searchQuery || selectedCategory !== 'all' || priceRange;
    
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Package className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasFilters ? 'Товары не найдены' : 'Нет товаров в магазине'}
          </h3>
          <p className="text-gray-500 mb-4">
            {hasFilters 
              ? 'Попробуйте изменить параметры поиска или фильтры'
              : 'В данный момент товары отсутствуют в базе данных'
            }
          </p>
          <div className="space-y-2">
            {hasFilters ? (
              <Button 
                onClick={resetFilters}
                variant="outline"
              >
                Сбросить фильтры
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/admin/test-data'} 
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать тестовые товары
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Отображение продуктов
  return (
    <div className="space-y-6">
      {/* Заголовок с количеством */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Товары ({safeProducts.length})
        </h2>
        
        {safeTotalCount !== safeProducts.length && safeTotalCount > 0 && (
          <p className="text-sm text-gray-500">
            Показано {safeProducts.length} из {safeTotalCount}
          </p>
        )}
      </div>

      {/* Сетка продуктов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeProducts.map((product, index) => {
          // Дополнительная проверка для каждого продукта
          if (!product || !product._id) {
            console.warn('⚠️ Невалидный продукт на позиции:', index, product);
            return null;
          }
          
          return (
            <ProductCard 
              key={product._id} 
              product={product}
            />
          );
        })}
      </div>
    </div>
  );
}
