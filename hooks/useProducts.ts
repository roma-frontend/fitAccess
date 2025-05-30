// hooks/useProducts.ts (исправленная версия)
"use client";

import { useState, useEffect } from "react";

// Типы остаются те же
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  inStock: number;
  isPopular?: boolean;
  isActive?: boolean; // Добавьте это поле!
  image?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: Product['category'];
  price: number;
  inStock: number;
  isPopular: boolean;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
}

// Хук для получения продуктов через API
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🔄 Загрузка продуктов через API...");
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Продукты загружены:", result.count);
        const productsData = Array.isArray(result.data) ? result.data : [];
        setProducts(productsData);
      } else {
        console.error("❌ Ошибка API:", result.error);
        setError(result.error);
        setProducts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки продуктов';
      console.error("❌ Ошибка сети:", err);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { 
    products: products || [],
    isLoading, 
    error, 
    refetch: fetchProducts 
  };
}

export function useProductsByCategory(category: string) {
  const { products } = useProducts();
  return Array.isArray(products) ? products.filter(p => p.category === category) : [];
}

export function usePopularProducts() {
  const { products } = useProducts();
  return Array.isArray(products) ? products.filter(p => p.isPopular) : [];
}

// Хук для управления продуктами через API
export function useProductManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Создание продукта
  const createProduct = async (productData: ProductFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Создание продукта через API:", productData);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Продукт создан через API:", result.data);
        return true;
      } else {
        console.error("❌ Ошибка создания:", result.error);
        setError(result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания продукта';
      console.error("❌ Ошибка сети:", err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление продукта
  const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    console.log("🔄 useProductManagement: Начало обновления", { id, productData });
    
    setIsLoading(true);
    setError(null);
  
    try {
      console.log("🔄 Обновление продукта через API:", id, productData);
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
  
      console.log("🔄 Ответ сервера:", response.status, response.statusText);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Ошибка HTTP:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("🔄 Результат API:", result);
      
      if (result.success) {
        console.log("✅ Продукт обновлен через API:", result.data);
        return true;
      } else {
        console.error("❌ Ошибка обновления:", result.error);
        setError(result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления продукта';
      console.error("❌ Ошибка сети:", err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление продукта
  const deleteProduct = async (id: string, deleteType: 'soft' | 'hard' = 'soft'): Promise<boolean> => {
    console.log(`🔄 useProductManagement: Начало удаления`, { id, deleteType });
    
    setIsLoading(true);
    setError(null);
  
    try {
      console.log(`🔄 ${deleteType === 'hard' ? 'Физическое' : 'Мягкое'} удаление продукта через API:`, id);
      
      const url = `/api/products/${id}?type=${deleteType}`;
      console.log("🔄 URL запроса:", url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log("🔄 Ответ сервера:", response.status, response.statusText);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Ошибка HTTP:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
  
      const result = await response.json();
      console.log("🔄 Результат API:", result);
      
      if (result.success) {
        console.log("✅ Продукт удален через API:", result.message);
        return true;
      } else {
        console.error("❌ Ошибка удаления:", result.error);
        setError(result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления продукта';
      console.error("❌ Ошибка сети:", err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    error
  };
}

// Хук для получения продуктов в формате Product
export function useProductsAsProduct(): Product[] {
  const { products } = useProducts();
  return Array.isArray(products) ? products : [];
}

// Статистика продуктов
export function useProductStats() {
  const { products } = useProducts();

  if (!Array.isArray(products) || products.length === 0) return null;

  return {
    total: products.length,
    inStock: products.filter(p => p.inStock > 10).length,
    lowStock: products.filter(p => p.inStock > 0 && p.inStock <= 10).length,
    outOfStock: products.filter(p => p.inStock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.inStock), 0),
    averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
    popularCount: products.filter(p => p.isPopular).length,
  };
}
