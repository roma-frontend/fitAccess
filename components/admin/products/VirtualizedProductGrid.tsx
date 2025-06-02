// components/admin/products/VirtualizedProductGrid.tsx
import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ProductCard } from './ProductCard';
import { Product } from '@/hooks/useProducts';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string, deleteType?: 'soft' | 'hard') => void;
  isLoading?: boolean;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string, deleteType?: 'soft' | 'hard') => void;
    itemsPerRow: number;
  };
}

export const VirtualizedProductGrid = memo(function VirtualizedProductGrid({
  products,
  onEdit,
  onDelete,
  isLoading = false
}: ProductGridProps) {
  // Вычисляем количество элементов в строке на основе ширины экрана
  const itemsPerRow = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    
    const width = window.innerWidth;
    if (width < 768) return 1; // mobile
    if (width < 1024) return 2; // tablet
    if (width < 1280) return 3; // desktop
    return 4; // large desktop
  }, []);

  // Группируем продукты по строкам
  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < products.length; i += itemsPerRow) {
      result.push(products.slice(i, i + itemsPerRow));
    }
    return result;
  }, [products, itemsPerRow]);

  const Row = memo(function Row({ index, style, data }: RowProps) {
    const { products: allProducts, onEdit, onDelete, itemsPerRow } = data;
    const rowProducts = allProducts.slice(index * itemsPerRow, (index + 1) * itemsPerRow);

    return (
      <div style={style} className="px-2">
        <div className={`grid gap-4 ${
          itemsPerRow === 1 ? 'grid-cols-1' :
          itemsPerRow === 2 ? 'grid-cols-2' :
          itemsPerRow === 3 ? 'grid-cols-3' :
          'grid-cols-4'
        }`}>
          {rowProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  });

  const itemData = useMemo(() => ({
    products,
    onEdit,
    onDelete,
    itemsPerRow
  }), [products, onEdit, onDelete, itemsPerRow]);

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">Продукты не найдены</div>
      </div>
    );
  }

  const rowCount = Math.ceil(products.length / itemsPerRow);

  return (
    <div className="w-full">
      <List
        height={600}
        itemCount={rowCount}
        itemSize={280} // Высота строки с карточками
        width="100%"
        itemData={itemData}
        overscanCount={2} // Предзагружаем 2 строки сверху и снизу
      >
        {Row}
      </List>
    </div>
  );
});

// Компонент скелетона для загрузки
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
