"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Store, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import CartButton from '../CartButton';

interface NavigationHeaderProps {
  title?: string;
  subtitle?: string;
  showCart?: boolean;
  backUrl?: string;
  backLabel?: string;
}

export default function NavigationHeader({
  title = "Магазин спортивного питания",
  subtitle = "Качественные добавки для ваших тренировок",
  showCart = true,
  backUrl = "/",
  backLabel = "На главную"
}: NavigationHeaderProps) {
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const totalItems = getTotalItems();

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть - навигация и заголовок */}
          <div className="flex items-center gap-4">
            {/* Кнопка возврата */}
            <Link href={backUrl}>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Button>
            </Link>
            
            {/* Заголовок с иконкой */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base hidden sm:block">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Правая часть - корзина и дополнительные элементы */}
          <div className="flex items-center gap-3">
            {/* Мини-статистика корзины (только на больших экранах) */}
            {showCart && totalItems > 0 && (
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
                <span>В корзине: {totalItems} товаров</span>
              </div>
            )}
            
            {/* Кнопка корзины */}
            {showCart && <CartButton />}
          </div>
        </div>
      </div>
    </div>
  );
}
