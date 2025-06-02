// components/admin/products/InfiniteProductGrid.tsx
import React, { useEffect, useRef, memo } from 'react';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { ProductCard } from './ProductCard';
import { Product } from '@/hooks/useProducts';

interface InfiniteProductGridProps {
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string, deleteType?: 'soft' | 'hard') => void;
}

export const InfiniteProductGrid = memo(function InfiniteProductGrid({
  category,
  search,
  sortBy,
  sortOrder,
  onEdit,
  onDelete
}: InfiniteProductGridProps) {
  const {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteProducts({
    category,
    search,
    sortBy,
    sortOrder,
    limit: 20
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Автоматическая загрузка при достижении конца списка
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Триггер для загрузки следующей страницы */}
      <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-sm text-gray-600">Загрузка...</span>
          </div>
        )}
        {!hasNextPage && products.length > 0 && (
          <span className="text-sm text-gray-500">Все продукты загружены</span>
        )}
      </div>
    </div>
  );
});

const ProductGridSkeleton = memo(function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
