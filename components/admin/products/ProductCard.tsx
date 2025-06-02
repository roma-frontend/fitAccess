// components/admin/products/ProductCard.tsx
import React, { memo, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, Package } from "lucide-react";
import { LazyImage } from "@/components/ui/LazyImage";
import { Product } from "@/hooks/useProducts";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string, deleteType: 'soft' | 'hard') => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete
}: ProductCardProps) {
  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(product._id, product.name, 'soft');
  }, [product._id, product.name, onDelete]);

  const getStockStatus = useCallback(() => {
    if (product.inStock === 0) return { label: 'Нет в наличии', color: 'destructive' };
    if (product.inStock <= 10) return { label: 'Заканчивается', color: 'warning' };
    return { label: 'В наличии', color: 'success' };
  }, [product.inStock]);

  const stockStatus = getStockStatus();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <LazyImage
          src={product.imageUrl}
          alt={product.name}
          className="h-48 w-full rounded-t-lg"
        />
        
        {/* Overlay с действиями */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEdit}
            className="transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Бейджи */}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isPopular && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Популярный
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <Badge 
            variant={stockStatus.color as any}
            className="text-xs"
          >
            <Package className="h-3 w-3 mr-1" />
            {product.inStock}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                ₽{product.price}
              </span>
              <Badge variant="outline" className="w-fit">
                {product.category}
              </Badge>
            </div>
            
            <Badge variant={stockStatus.color as any}>
              {stockStatus.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
