// components/admin/products/ProductForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, DollarSign, Hash, Star, Utensils } from "lucide-react";
import { Product, ProductFormData } from "./types";

interface ProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({ product, isOpen, onClose, onSubmit }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: 'supplements',
    price: 0,
    inStock: 0,
    isPopular: false,
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0
    }
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        inStock: product.inStock,
        isPopular: product.isPopular || false,
        nutrition: {
          calories: product.nutrition?.calories || 0,
          protein: product.nutrition?.protein || 0,
          carbs: product.nutrition?.carbs || 0,
          fat: product.nutrition?.fat || 0,
          sugar: product.nutrition?.sugar || 0
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'supplements',
        price: 0,
        inStock: 0,
        isPopular: false,
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugar: 0
        }
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.price <= 0) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения продукта:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'supplements', label: 'Добавки' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'snacks', label: 'Снеки' },
    { value: 'merchandise', label: 'Мерч' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product ? 'Редактировать продукт' : 'Создать новый продукт'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Название продукта *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Введите название"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Категория *
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: Product['category']) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Введите описание продукта"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Price and Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Цена и остатки</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Цена (₽) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Количество на складе
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.inStock}
                  onChange={(e) => setFormData({...formData, inStock: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <Label htmlFor="popular" className="text-sm font-medium">
                  Популярный продукт
                </Label>
              </div>
              <Switch
                id="popular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
              />
            </div>
          </div>

          {/* Nutrition Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              <h3 className="text-lg font-medium text-gray-900">Пищевая ценность</h3>
              <span className="text-sm text-gray-500">(опционально)</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Калории</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.nutrition.calories}
                  onChange={(e) => setFormData({
                    ...formData, 
                    nutrition: {...formData.nutrition, calories: parseInt(e.target.value) || 0}
                  })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein">Белки (г)</Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.protein}
                  onChange={(e) => setFormData({
                    ...formData, 
                    nutrition: {...formData.nutrition, protein: parseFloat(e.target.value) || 0}
                  })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs">Углеводы (г)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.carbs}
                  onChange={(e) => setFormData({
                    ...formData, 
                    nutrition: {...formData.nutrition, carbs: parseFloat(e.target.value) || 0}
                  })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">Жиры (г)</Label>
                <Input
                  id="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.fat}
                  onChange={(e) => setFormData({
                    ...formData, 
                    nutrition: {...formData.nutrition, fat: parseFloat(e.target.value) || 0}
                  })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sugar">Сахар (г)</Label>
                <Input
                  id="sugar"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.sugar}
                  onChange={(e) => setFormData({
                    ...formData, 
                    nutrition: {...formData.nutrition, sugar: parseFloat(e.target.value) || 0}
                  })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Сохранение...' : (product ? 'Обновить продукт' : 'Создать продукт')}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

