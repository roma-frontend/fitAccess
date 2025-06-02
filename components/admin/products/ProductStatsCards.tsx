// components/admin/products/ProductStatsCards.tsx
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, Activity, BarChart3, Zap } from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface ProductStatsCardsProps {
  products: Product[];
  filteredCount: number;
}

export const ProductStatsCards = memo(function ProductStatsCards({ 
  products, 
  filteredCount 
}: ProductStatsCardsProps) {
  const stats = React.useMemo(() => ({
    total: products.length,
    filtered: filteredCount,
    popular: products.filter(p => p.isPopular).length,
    lowStock: products.filter(p => p.inStock > 0 && p.inStock <= 10).length
  }), [products, filteredCount]);

  const statsConfig = [
    {
      label: "Всего продуктов",
      value: stats.total,
      icon: Package,
      color: "text-blue-600"
    },
    {
      label: "Отфильтровано",
      value: stats.filtered,
      icon: Activity,
      color: "text-green-600"
    },
    {
      label: "Популярные",
      value: stats.popular,
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      label: "Заканчиваются",
      value: stats.lowStock,
      icon: Zap,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
