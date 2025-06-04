// hooks/useProducts.ts
import { useProductsQuery, useProductMutations } from './useProductsQuery';
import type { Product, ProductFormData } from '@/types/product';

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
    createProduct: async (data: ProductFormData): Promise<Product> => {
      try {
        const result = await mutations.createProduct(data);
        return result;
      } catch (error) {
        console.error('Create product error:', error);
        throw error;
      }
    },
    
    updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
      try {
        const result = await mutations.updateProduct(id, data);
        return result;
      } catch (error) {
        console.error('Update product error:', error);
        throw error;
      }
    },
    
    deleteProduct: async (id: string, deleteType: 'soft' | 'hard' = 'soft'): Promise<void> => {
      try {
        await mutations.deleteProduct(id, deleteType);
        // ✅ Для удаления возвращаем void
      } catch (error) {
        console.error('Delete product error:', error);
        throw error;
      }
    },
    
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
    
    createError: mutations.createError,
    updateError: mutations.updateError,
    deleteError: mutations.deleteError,
  };
}
