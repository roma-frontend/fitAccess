"use client";

import React from 'react';
import ProductsFilters from '@/components/ProductsFilters';
import CartButton from '@/components/CartButton';
import ProductGrid from './ProductGrid';
import Cart from '../products/Cart';

export default function ShopView() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Заголовок и корзина */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Магазин спортивного питания</h1>
          <p className="text-gray-600 mt-2">Качественные добавки для ваших тренировок</p>
        </div>
        <CartButton />
      </div>

      {/* Фильтры и товары */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Фильтры */}
        <div className="lg:col-span-1">
          <ProductsFilters />
        </div>

        {/* Сетка товаров */}
        <div className="lg:col-span-3">
          <ProductGrid />
        </div>
      </div>

      {/* Корзина */}
      <Cart />
    </div>
  );
}
