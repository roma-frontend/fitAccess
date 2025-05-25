// components/admin/products/ProductStats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, Star, AlertTriangle, TrendingUp, ShoppingCart } from "lucide-react";
import { Product } from "./types";

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.inStock), 0);
  const popularProducts = products.filter(p => p.isPopular).length;
  const lowStockProducts = products.filter(p => p.inStock < 10).length;
  const outOfStockProducts = products.filter(p => p.inStock === 0).length;
  const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

  const stats = [
    {
      title: "Всего товаров",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Общая стоимость",
      value: `${totalValue.toLocaleString()} ₽`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Популярные",
      value: popularProducts,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Заканчиваются",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Нет в наличии",
      value: outOfStockProducts,
      icon: ShoppingCart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Средняя цена",
      value: `${Math.round(averagePrice)} ₽`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`${stat.bgColor} ${stat.borderColor} border-l-4`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
