// lib/api/products.ts
import type { Product, ProductFormData } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Типы для API ответов
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Функции для работы с API
export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const result: ApiResponse<Product[]> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch products');
  }

  return result.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const result: ApiResponse<Product> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch product');
  }

  return result.data;
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create product: ${response.statusText}`);
  }

  const result: ApiResponse<Product> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to create product');
  }

  return result.data;
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update product: ${response.statusText}`);
  }

  const result: ApiResponse<Product> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to update product');
  }

  return result.data;
}

export async function deleteProduct(id: string, deleteType: 'soft' | 'hard' = 'soft'): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deleteType }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.statusText}`);
  }

  const result: ApiResponse<null> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete product');
  }
}

export async function bulkUpdateProducts(
  ids: string[], 
  updates: Partial<ProductFormData>
): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/bulk`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, updates }),
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk update products: ${response.statusText}`);
  }

  const result: ApiResponse<Product[]> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to bulk update products');
  }

  return result.data;
}

export async function bulkDeleteProducts(
  ids: string[], 
  deleteType: 'soft' | 'hard' = 'soft'
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/bulk`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, deleteType }),
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk delete products: ${response.statusText}`);
  }

  const result: ApiResponse<null> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to bulk delete products');
  }
}
