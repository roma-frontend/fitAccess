// hooks/useProducts.ts
import { useProductsQuery, useProductMutations } from './useProductsQuery';
import type { Product, ProductFormData } from '@/types/product';

// Исправленный реэкспорт типов
export type { Product, ProductFormData } from '@/types/product';

export function useProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { products, isLoading, error, refetch } = useProductsQuery(params);
  const mutations = useProductMutations();

  return {
    products,
    isLoading,
    error,
    refetch,
    ...mutations
  };
}

export function useProductManagement() {
  const mutations = useProductMutations();

  return {
    createProduct: async (data: ProductFormData): Promise<boolean> => {
      try {
        await mutations.createProduct(data);
        return true;
      } catch (error) {
        console.error('Create product error:', error);
        return false;
      }
    },
    updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<boolean> => {
      try {
        await mutations.updateProduct(id, data);
        return true;
      } catch (error) {
        console.error('Update product error:', error);
        return false;
      }
    },
    deleteProduct: async (id: string, deleteType: 'soft' | 'hard' = 'soft'): Promise<boolean> => {
      try {
        await mutations.deleteProduct(id, deleteType);
        return true;
      } catch (error) {
        console.error('Delete product error:', error);
        return false;
      }
    }
  };
}
