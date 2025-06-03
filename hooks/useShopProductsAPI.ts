// hooks/useShopProductsAPI.ts
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Id } from "@/convex/_generated/dataModel";

export interface ShopProduct {
  _id: Id<"products"> | string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  imageUrl?: string;
  inStock: number;
  minStock?: number;
  isPopular?: boolean;
  isActive: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  createdAt: number;
  updatedAt?: number;
}

interface APIResponse {
  success: boolean;
  data: ShopProduct[];
  count: number;
  timestamp?: string;
  error?: string;
}

interface UseShopProductsAPIProps {
  searchQuery?: string;
  category?: string;
  priceRange?: [number, number] | null;
  sortBy?: 'name' | 'price' | 'popularity' | 'inStock' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export function useShopProductsAPI({
  searchQuery = '',
  category = 'all',
  priceRange = null,
  sortBy = 'newest',
  sortOrder = 'desc',
}: UseShopProductsAPIProps = {}) {
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        console.log('🔄 useShopProductsAPI: Начинаем загрузку продуктов');
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('/api/shop/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!isMounted) return;

        console.log('📡 useShopProductsAPI: Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: APIResponse = await response.json();
        console.log('📦 useShopProductsAPI: Получены данные:', {
          success: data.success,
          count: data.count,
          hasData: !!data.data,
          dataLength: data.data?.length || 0,
          dataType: typeof data.data,
          isArray: Array.isArray(data.data)
        });

        if (!isMounted) return;

        if (data.success) {
          // Безопасная проверка данных
          let products: ShopProduct[] = [];
          
          if (Array.isArray(data.data)) {
            // Фильтруем только валидные продукты
            products = data.data.filter((product, index) => {
              if (!product || typeof product !== 'object') {
                console.warn(`⚠️ Невалидный продукт на позиции ${index}:`, product);
                return false;
              }
              if (!product._id || !product.name) {
                console.warn(`⚠️ Продукт без _id или name на позиции ${index}:`, product);
                return false;
              }
              return true;
            });
          } else {
            console.warn('⚠️ data.data не является массивом:', data.data);
          }
          
          console.log('✅ useShopProductsAPI: Установлено валидных продуктов:', products.length);
          setAllProducts(products);
          setError(null);
        } else {
          const errorMsg = data.error || 'Неизвестная ошибка API';
          console.error('❌ useShopProductsAPI: API ошибка:', errorMsg);
          setError(errorMsg);
          setAllProducts([]);
        }
      } catch (err) {
        console.error('❌ useShopProductsAPI: Ошибка запроса:', err);
        
        if (!isMounted) return;

        if (err instanceof Error && err.name === 'AbortError') {
          setError('Время ожидания истекло. Попробуйте обновить страницу.');
        } else {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки продуктов');
        }
        setAllProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Фильтрация и сортировка с безопасными проверками
  const filteredProducts = useMemo(() => {
    // Безопасная проверка
    if (!Array.isArray(allProducts)) {
      console.warn('⚠️ allProducts не является массивом:', allProducts);
      return [];
    }

    let filtered = [...allProducts];

    try {
      // Фильтр по поиску
      if (searchQuery?.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(product => {
          if (!product) return false;
          
          const name = product.name?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const category = product.category?.toLowerCase() || '';
          
          return name.includes(query) || description.includes(query) || category.includes(query);
        });
      }

      // Фильтр по категории
      if (category && category !== 'all') {
        filtered = filtered.filter(product => product?.category === category);
      }

      // Фильтр по цене
      if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
        const [minPrice, maxPrice] = priceRange;
        filtered = filtered.filter(product => {
          const price = product?.price || 0;
          return price >= minPrice && price <= maxPrice;
        });
      }

      // Фильтр только активные товары
      filtered = filtered.filter(product => product?.isActive !== false);

      // Сортировка
      filtered.sort((a, b) => {
        if (!a || !b) return 0;
        
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = (a.name || '').localeCompare(b.name || '');
            break;
          case 'price':
            comparison = (a.price || 0) - (b.price || 0);
            break;
          case 'popularity':
            comparison = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
            break;
          case 'inStock':
            comparison = (b.inStock || 0) - (a.inStock || 0);
            break;
          case 'newest':
            comparison = (b.createdAt || 0) - (a.createdAt || 0);
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    } catch (filterError) {
      console.error('❌ Ошибка фильтрации продуктов:', filterError);
      return [];
    }
  }, [allProducts, searchQuery, category, priceRange, sortBy, sortOrder]);

  const refetch = () => {
    console.log('🔄 useShopProductsAPI: Принудительная перезагрузка');
    setLoading(true);
    setError(null);
    setAllProducts([]);
    window.location.reload();
  };

  const result = {
    products: filteredProducts || [],
    isLoading: loading,
    loading,
    error,
    refetch,
    hasProducts: (filteredProducts || []).length > 0,
    productsCount: (filteredProducts || []).length,
    totalCount: (allProducts || []).length,
  };

  console.log('📊 useShopProductsAPI результат:', {
    productsLength: result.products.length,
    isLoading: result.isLoading,
    error: result.error,
    totalCount: result.totalCount,
    productsType: typeof result.products,
    isArray: Array.isArray(result.products)
  });

  return result;
}

export type { UseShopProductsAPIProps };
