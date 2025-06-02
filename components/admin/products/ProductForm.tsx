// components/admin/products/ProductForm.tsx (исправленная версия)
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProducts } from '@/hooks/useProducts';
import type { Product, ProductFormData } from '@/types/product';
import { Loader2, Upload, X } from 'lucide-react';

// Исправленная схема Zod
const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  description: z.string().min(1, 'Описание обязательно').max(500, 'Описание слишком длинное'),
  price: z.number().min(0, 'Цена должна быть положительной'),
  category: z.enum(['supplements', 'drinks', 'snacks', 'merchandise'], {
    required_error: 'Выберите категорию'
  }),
  inStock: z.number().min(0, 'Количество не может быть отрицательным'),
  isPopular: z.boolean(),
  imageUrl: z.string().refine((url) => {
    if (url === '') return true; // Разрешаем пустую строку
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, 'Введите корректный URL изображения или оставьте поле пустым')
}) satisfies z.ZodType<ProductFormData>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts();
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || 'supplements',
      inStock: product?.inStock || 0,
      isPopular: product?.isPopular || false,
      imageUrl: product?.imageUrl || ''
    }
  });

  const watchImageUrl = form.watch('imageUrl');

  useEffect(() => {
    if (watchImageUrl && watchImageUrl.startsWith('http')) {
      setImagePreview(watchImageUrl);
    } else {
      setImagePreview('');
    }
  }, [watchImageUrl]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Если imageUrl пустая, устанавливаем дефолтное изображение
      const formDataWithImage = {
        ...data,
        imageUrl: data.imageUrl || '/images/default-product.jpg'
      };

      if (product) {
        await updateProduct(product._id, formDataWithImage);
      } else {
        await createProduct(formDataWithImage);
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isLoading = isCreating || isUpdating;

  const categoryOptions = [
    { value: 'supplements', label: 'Добавки' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'snacks', label: 'Снеки' },
    { value: 'merchandise', label: 'Мерч' }
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название продукта</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название продукта" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Введите описание продукта"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена (₽)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Популярный товар</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Отображать в разделе рекомендуемых товаров
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Изображение */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL изображения (необязательно)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500">
                    Если не указать изображение, будет использовано изображение по умолчанию
                  </div>
                </FormItem>
              )}
            />

            {/* Превью изображения */}
            {imagePreview && (
              <div className="space-y-2">
                <Label>Превью изображения</Label>
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Превью"
                    className="w-full h-48 object-cover"
                    onError={() => setImagePreview('')}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      form.setValue('imageUrl', '');
                      setImagePreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {!imagePreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Введите URL изображения выше для предварительного просмотра
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Или оставьте поле пустым для использования изображения по умолчанию
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? 'Сохранить изменения' : 'Создать продукт'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
