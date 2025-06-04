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

export function useShopProductsAPI() {
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Только загрузка данных, без фильтрации
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/shop/products');
        const data = await response.json();

        if (data.success) {
          setAllProducts(data.data || []);
        } else {
          setError(data.error || 'Ошибка загрузки');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    products: allProducts,
    loading,
    error,
    refetch: () => window.location.reload()
  };
}

export type { UseShopProductsAPIProps };
