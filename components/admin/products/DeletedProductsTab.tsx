// components/admin/products/DeletedProductsTab.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trash2, Package, Archive, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOptimisticProducts } from '@/hooks/useOptimisticProducts';
import { Product } from '@/types/product';

export function DeletedProductsTab() {
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { 
    products: optimisticProducts, 
    isPending, 
    handleRestore, 
    handleDelete 
  } = useOptimisticProducts(deletedProducts);

  const fetchDeletedProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products/deleted');
      const result = await response.json();
      
      if (result.success) {
        setDeletedProducts(result.data || []);
        console.log("✅ Загружено удаленных продуктов:", result.data?.length || 0);
      } else {
        toast({
          title: "❌ Ошибка загрузки удаленных продуктов",
          description: "Не удалось получить список",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки удаленных продуктов:", error);
      toast({
        title: "❌ Ошибка загрузки удаленных продуктов",
        description: "Проверьте подключение к интернету",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Загрузка удаленных продуктов...</p>
        <p className="text-sm text-gray-500">Получение данных из базы</p>
      </div>
    );
  }

  if (optimisticProducts.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <Archive className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Нет удаленных продуктов</h3>
            <p className="text-sm mb-4">Деактивированные продукты будут отображаться здесь</p>
            <Button 
              variant="outline" 
              onClick={fetchDeletedProducts}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить список
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Archive className="h-6 w-6 text-red-600" />
              <div>
                <h2 className="text-xl">Удаленные продукты</h2>
                <p className="text-sm text-gray-500 font-normal">
                  Найдено {optimisticProducts.length} деактивированных продуктов
                </p>
              </div>
              {isPending && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Обработка...</span>
                </div>
              )}
            </CardTitle>
            
            <Button
              onClick={fetchDeletedProducts}
              variant="outline"
              size="sm"
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optimisticProducts.map((product) => (
              <Card 
                key={product._id} 
                className={`border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-300 hover:shadow-lg ${
                  isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'
                }`}
              >
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {/* Header продукта */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <Badge variant="destructive" className="ml-2 shrink-0">
                        Удален
                      </Badge>
                    </div>
                    
                    {/* Информация о продукте */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-500">Категория:</p>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500">Цена:</p>
                        <span className="font-semibold text-gray-900">
                          {product.price}₽
                        </span>
                      </div>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-500">Остаток:</p>
                        <span className={`font-medium ${
                          product.inStock === 0 ? 'text-red-600' : 
                          product.inStock <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.inStock} шт.
                        </span>
                      </div>
                      {product.isPopular && (
                        <div className="space-y-1">
                          <p className="text-gray-500">Статус:</p>
                          <Badge variant="secondary" className="text-xs">
                            ⭐ Популярный
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Дата удаления */}
                    {product.updatedAt && (
                      <div className="pt-2 border-t border-red-200">
                        <p className="text-xs text-gray-500">
                          Удален: {new Date(product.updatedAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                    
                    {/* Кнопки действий */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(product._id, product.name)}
                        disabled={isPending}
                        className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Обработка...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Восстановить
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product._id, product.name, 'hard')}
                        disabled={isPending}
                        className="hover:bg-red-700 transition-colors"
                        title="Удалить навсегда"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Информационная панель */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Управление удаленными продуктами</h4>
              <p className="text-sm text-blue-700">
                Вы можете восстановить продукты в каталог или удалить их навсегда. 
                Восстановленные продукты снова станут доступны для покупки.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

