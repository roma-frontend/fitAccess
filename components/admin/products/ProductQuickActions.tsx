// components/admin/products/ProductQuickActions.tsx (замените импорт toast)
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Download, 
  Upload, 
  RefreshCw, 
  Star, 
  Package, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast"; // Заменили импорт

interface ProductQuickActionsProps {
  products: Product[];
  onRefresh?: () => Promise<void>;
}

export function ProductQuickActions({ products, onRefresh }: ProductQuickActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Используем useToast

  const handleExportProducts = () => {
    try {
      const csvContent = [
        ['Название', 'Описание', 'Категория', 'Цена', 'Остаток', 'Популярный'].join(','),
        ...products.map(p => [
          `"${p.name}"`,
          `"${p.description}"`,
          p.category,
          p.price,
          p.inStock,
          p.isPopular ? 'Да' : 'Нет'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Экспорт завершен",
        description: `Экспортировано ${products.length} продуктов`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdateStock = async () => {
    setIsLoading(true);

    try {
      // Симуляция массового обновления
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Остатки обновлены",
        description: "Все остатки синхронизированы с складом",
        variant: "default",
      });
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      toast({
        title: "Ошибка обновления остатков",
        description: "Попробуйте еще раз",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllPopular = async () => {
    const isConfirmed = confirm("Отметить все продукты как популярные?\n\nЭто действие изменит статус всех продуктов");

    if (!isConfirmed) return;

    setIsLoading(true);

    try {
      // Симуляция массового обновления
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Статус обновлен",
        description: "Все продукты отмечены как популярные",
        variant: "default",
      });
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      toast({
        title: "Ошибка обновления статуса",
        description: "Попробуйте еще раз",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizePrices = async () => {
    const isConfirmed = confirm("Оптимизировать цены?\n\nСистема автоматически скорректирует цены на основе рыночных данных");

    if (!isConfirmed) return;

    setIsLoading(true);

    try {
      // Симуляция оптимизации
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Цены оптимизированы",
        description: "Цены скорректированы для максимизации прибыли",
        variant: "default",
      });
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      toast({
        title: "Ошибка оптимизации цен",
        description: "Попробуйте еще раз",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const lowStockCount = products.filter(p => p.inStock > 0 && p.inStock <= 10).length;
  const outOfStockCount = products.filter(p => p.inStock === 0).length;
  const popularCount = products.filter(p => p.isPopular).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.inStock), 0);

  return (
    <div className="space-y-6">
      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={handleExportProducts}
              disabled={isLoading || products.length === 0}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={handleBulkUpdateStock}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить остатки
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={handleMarkAllPopular}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Star className="h-4 w-4 mr-2" />
              Все популярные
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={handleOptimizePrices}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Оптимизация цен
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Остальной код остается без изменений... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Быстрая сводка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Всего продуктов</span>
                </div>
                <Badge variant="outline">{products.length}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Общая стоимость</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {totalValue.toLocaleString()}₽
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Популярные</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {popularCount} из {products.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Требуют внимания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outOfStockCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Нет в наличии</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {outOfStockCount} шт.
                  </Badge>
                </div>
              )}

              {lowStockCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Заканчиваются</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    {lowStockCount} шт.
                  </Badge>
                </div>
              )}

              {outOfStockCount === 0 && lowStockCount === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Все продукты в достаточном количестве</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Массовые операции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Массовые операции
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              disabled={isLoading}
              onClick={() => {
                toast({
                  title: "Функция в разработке",
                  description: "Импорт продуктов из CSV будет доступен в следующем обновлении",
                  variant: "default",
                });
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Импорт из CSV
            </Button>

            <Button 
              variant="outline" 
              disabled={isLoading}
              onClick={() => {
                toast({
                  title: "Функция в разработке",
                  description: "Массовое редактирование будет доступно в следующем обновлении",
                  variant: "default",
                });
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Массовое редактирование
            </Button>

            <Button 
              variant="outline" 
              disabled={isLoading}
              onClick={async () => {
                if (onRefresh) {
                  try {
                    await onRefresh();
                    toast({
                      title: "Данные обновлены",
                      description: "Список продуктов синхронизирован",
                      variant: "default",
                    });
                  } catch (error) {
                    toast({
                      title: "Ошибка синхронизации",
                      description: "Не удалось обновить данные",
                      variant: "destructive",
                    });
                  }
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Синхронизировать
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

