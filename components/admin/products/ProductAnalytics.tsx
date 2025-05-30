// components/admin/products/ProductAnalytics.tsx
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Star,
  PieChart
} from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface ProductAnalyticsProps {
  products: Product[];
}

export function ProductAnalytics({ products }: ProductAnalyticsProps) {
  const analytics = useMemo(() => {
    if (!products.length) return null;

    // Общая статистика
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.inStock), 0);
    const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;
    const totalStock = products.reduce((sum, p) => sum + p.inStock, 0);

    // Статистика по категориям
    const categoryStats = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { count: 0, value: 0, stock: 0 };
      }
      acc[product.category].count++;
      acc[product.category].value += product.price * product.inStock;
      acc[product.category].stock += product.inStock;
      return acc;
    }, {} as Record<string, { count: number; value: number; stock: number }>);

    // Статистика по остаткам
    const stockStats = {
      inStock: products.filter(p => p.inStock > 10).length,
      lowStock: products.filter(p => p.inStock > 0 && p.inStock <= 10).length,
      outOfStock: products.filter(p => p.inStock === 0).length,
    };

    // Популярные продукты
    const popularCount = products.filter(p => p.isPopular).length;

    // Топ продукты по стоимости
    const topValueProducts = [...products]
      .sort((a, b) => (b.price * b.inStock) - (a.price * a.inStock))
      .slice(0, 5);

    // Продукты с низкими остатками
    const lowStockProducts = products
      .filter(p => p.inStock > 0 && p.inStock <= 10)
      .sort((a, b) => a.inStock - b.inStock);

    return {
      totalProducts,
      totalValue,
      averagePrice,
      totalStock,
      categoryStats,
      stockStats,
      popularCount,
      topValueProducts,
      lowStockProducts
    };
  }, [products]);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Нет данных для анализа</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryNames = {
    supplements: 'Добавки',
    drinks: 'Напитки',
    snacks: 'Снеки',
    merchandise: 'Мерч'
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общая стоимость</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalValue.toLocaleString()}₽
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Средняя цена</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.averagePrice).toLocaleString()}₽
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общий остаток</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalStock.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Популярные</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.popularCount}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика по категориям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Статистика по категориям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.categoryStats).map(([category, stats]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </span>
                    <Badge variant="outline">{stats.count} шт.</Badge>
                  </div>
                  <Progress 
                    value={(stats.count / analytics.totalProducts) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Стоимость: {stats.value.toLocaleString()}₽</span>
                    <span>Остаток: {stats.stock} шт.</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Статистика остатков */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Состояние остатков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">В наличии</span>
                  <Badge className="bg-green-100 text-green-800">
                    {analytics.stockStats.inStock} шт.
                  </Badge>
                </div>
                <Progress 
                  value={(analytics.stockStats.inStock / analytics.totalProducts) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-700">Заканчиваются</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {analytics.stockStats.lowStock} шт.
                  </Badge>
                </div>
                <Progress 
                  value={(analytics.stockStats.lowStock / analytics.totalProducts) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">Нет в наличии</span>
                  <Badge className="bg-red-100 text-red-800">
                    {analytics.stockStats.outOfStock} шт.
                  </Badge>
                </div>
                <Progress 
                  value={(analytics.stockStats.outOfStock / analytics.totalProducts) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ продукты по стоимости */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Топ по стоимости остатков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topValueProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.price}₽ × {product.inStock} шт.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {(product.price * product.inStock).toLocaleString()}₽
                    </p>
                    {product.isPopular && (
                      <Star className="h-3 w-3 text-yellow-500 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Продукты с низкими остатками */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Требуют пополнения
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.lowStockProducts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Все продукты в достаточном количестве</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {categoryNames[product.category]}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-orange-100 text-orange-800">
                        {product.inStock} шт.
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
