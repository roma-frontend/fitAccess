// components/admin/products/ProductCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Archive
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string, type?: 'soft' | 'hard') => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const getCategoryColor = (category: Product['category']) => {
    const colors = {
      'supplements': 'bg-blue-100 text-blue-800 border-blue-200',
      'drinks': 'bg-green-100 text-green-800 border-green-200',
      'snacks': 'bg-orange-100 text-orange-800 border-orange-200',
      'merchandise': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[category];
  };

  const getCategoryName = (category: Product['category']) => {
    const names = {
      'supplements': 'Добавки',
      'drinks': 'Напитки',
      'snacks': 'Снеки',
      'merchandise': 'Мерч',
    };
    return names[category];
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-50', text: 'Нет в наличии' };
    if (stock < 10) return { color: 'text-yellow-600 bg-yellow-50', text: 'Заканчивается' };
    return { color: 'text-green-600 bg-green-50', text: 'В наличии' };
  };

  const stockStatus = getStockStatus(product.inStock);


  const handleDelete = (type: 'soft' | 'hard') => {
    onDelete(product._id, product.name, type);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              {product.isPopular && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

            <div className="flex items-center gap-2 mb-3">
              <Badge className={getCategoryColor(product.category)}>
                {getCategoryName(product.category)}
              </Badge>
              {product.isPopular && (
                <Badge variant="secondary" className="text-xs">
                  Популярное
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔄 Клик на мягкое удаление:", product._id, product.name);
                  onDelete(product._id, product.name, 'soft');
                }}
                className="text-yellow-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                Деактивировать
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔄 Клик на жесткое удаление:", product._id, product.name);
                  onDelete(product._id, product.name, 'hard');
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить навсегда
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Цена</p>
              <p className="font-semibold text-green-600">{product.price} ₽</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Остаток</p>
              <p className={`font-semibold ${stockStatus.color.split(' ')[0]}`}>
                {product.inStock} шт
              </p>
            </div>
          </div>
        </div>

        {/* Nutrition Info */}
        {product.nutrition && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Пищевая ценность</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {product.nutrition.calories && (
                <div>
                  <span className="text-gray-600">Калории:</span>
                  <span className="ml-1 font-medium">{product.nutrition.calories}</span>
                </div>
              )}
              {product.nutrition.protein && (
                <div>
                  <span className="text-gray-600">Белки:</span>
                  <span className="ml-1 font-medium">{product.nutrition.protein}г</span>
                </div>
              )}
              {product.nutrition.carbs && (
                <div>
                  <span className="text-gray-600">Углеводы:</span>
                  <span className="ml-1 font-medium">{product.nutrition.carbs}г</span>
                </div>
              )}
              {product.nutrition.fat && (
                <div>
                  <span className="text-gray-600">Жиры:</span>
                  <span className="ml-1 font-medium">{product.nutrition.fat}г</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
          {stockStatus.text}
        </div>
      </CardContent>
    </Card>
  );
}
