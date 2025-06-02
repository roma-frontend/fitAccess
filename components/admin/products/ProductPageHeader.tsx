// components/admin/products/ProductPageHeader.tsx
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface ProductPageHeaderProps {
  onBack: () => void;
  onCreateProduct: () => void;
  isLoading?: boolean;
}

export const ProductPageHeader = memo(function ProductPageHeader({
  onBack,
  onCreateProduct,
  isLoading = false
}: ProductPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
            Управление продуктами
          </h1>
          <p className="text-gray-600">
            Создавайте, редактируйте и управляйте продуктами
          </p>
        </div>
      </div>

      <Button
        onClick={onCreateProduct}
        disabled={isLoading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Добавить продукт
      </Button>
    </div>
  );
});
