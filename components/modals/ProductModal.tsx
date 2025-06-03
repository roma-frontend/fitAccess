import React from 'react';
import { ShopProduct } from '@/hooks/useShopProductsAPI';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/common/SafeImage';
import { generateProductImageAlt, generateFallbackText } from '@/utils/altTextUtils';
import { AccessibleDialog } from '../ui/accessible-dialog';
import { formatProductPrice } from '@/hooks/useShopProducts';

interface ProductModalProps {
  product: ShopProduct;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const imageAlt = generateProductImageAlt(product);
  const fallbackText = generateFallbackText(product.name);

  return (
    <AccessibleDialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Подробная информация о товаре: ${product.name}`}
      description={`Цена: ${formatProductPrice(product.price)}. ${product.description}`}
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Изображение */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={imageAlt}
            fill
            className="rounded-lg"
            fallbackText={fallbackText}
          />
        </div>

        {/* Информация */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Пищевая ценность */}
          {product.nutrition && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Пищевая ценность на порцию:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.nutrition.calories && (
                  <div>Калории: {product.nutrition.calories}</div>
                )}
                {product.nutrition.protein && (
                  <div>Белки: {product.nutrition.protein}г</div>
                )}
                {product.nutrition.carbs && (
                  <div>Углеводы: {product.nutrition.carbs}г</div>
                )}
                {product.nutrition.fat && (
                  <div>Жиры: {product.nutrition.fat}г</div>
                )}
              </div>
            </div>
          )}

          {/* Цена и кнопки */}
          <div className="space-y-4">
            <div className="text-3xl font-bold text-blue-600">
              {formatProductPrice(product.price)}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={onAddToCart} 
                className="flex-1"
                aria-label={`Добавить ${product.name} в корзину за ${formatProductPrice(product.price)}`}
              >
                Добавить в корзину
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                aria-label="Закрыть окно с информацией о товаре"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AccessibleDialog>
  );
}
