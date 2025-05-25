// components/admin/products/ProductQuickActions.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  Download, 
  Upload,
  Zap,
  TrendingUp,
  Star
} from "lucide-react";
import { Product } from "./types";

interface ProductQuickActionsProps {
  products: Product[];
  onBulkAction: (action: string, productIds: string[]) => void;
}

export function ProductQuickActions({ products, onBulkAction }: ProductQuickActionsProps) {
  const lowStockProducts = products.filter(p => p.inStock > 0 && p.inStock < 10);
  const outOfStockProducts = products.filter(p => p.inStock === 0);
  const popularProducts = products.filter(p => p.isPopular);

  const quickActions = [
    {
      title: "Пополнить склад",
      description: `${lowStockProducts.length} товаров заканчивается`,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      action: () => onBulkAction('restock', lowStockProducts.map(p => p._id)),
      disabled: lowStockProducts.length === 0
    },
    {
      title: "Отметить как популярные",
      description: "Повысить видимость товаров",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      action: () => onBulkAction('mark-popular', products.filter(p => !p.isPopular).map(p => p._id)),
      disabled: products.filter(p => !p.isPopular).length === 0
    },
    {
      title: "Экспорт каталога",
      description: "Скачать CSV файл",
      icon: Download,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      action: () => onBulkAction('export', products.map(p => p._id)),
      disabled: products.length === 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Alerts */}
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-900">Критический остаток</h4>
              </div>
              <p className="text-sm text-red-700">
                {outOfStockProducts.length} товаров закончилось на складе
              </p>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Требует пополнения</h4>
              </div>
              <p className="text-sm text-yellow-700">
                {lowStockProducts.length} товаров заканчивается на складе
              </p>
            </div>
          )}

          {/* Popular Products Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Популярные товары</h4>
              <Badge variant="secondary">{popularProducts.length}</Badge>
            </div>
            <p className="text-sm text-blue-700">
              {popularProducts.length > 0 
                ? `${popularProducts.length} товаров отмечены как популярные`
                : 'Нет товаров, отмеченных как популярные'
              }
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.title}
                  className={`${action.bgColor} ${action.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <h5 className="font-medium text-gray-900">{action.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={action.disabled}
                    onClick={action.action}
                    className="w-full"
                  >
                    Выполнить
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
