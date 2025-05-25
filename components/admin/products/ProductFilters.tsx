// components/admin/products/ProductFilters.tsx
"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Package } from "lucide-react";
import { Product } from "./types";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  categoryFilter: Product['category'] | 'all';
  onCategoryFilterChange: (category: Product['category'] | 'all') => void;
  stockFilter: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  onStockFilterChange: (stock: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock') => void;
  popularFilter: 'all' | 'popular' | 'regular';
  onPopularFilterChange: (popular: 'all' | 'popular' | 'regular') => void;
  totalProducts: number;
  filteredProducts: number;
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  stockFilter,
  onStockFilterChange,
  popularFilter,
  onPopularFilterChange,
  totalProducts,
  filteredProducts
}: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onCategoryFilterChange('all');
    onStockFilterChange('all');
    onPopularFilterChange('all');
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || popularFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Фильтры
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                {[searchTerm, categoryFilter !== 'all', stockFilter !== 'all', popularFilter !== 'all'].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Категория</label>
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="supplements">Добавки</SelectItem>
                  <SelectItem value="drinks">Напитки</SelectItem>
                  <SelectItem value="snacks">Снеки</SelectItem>
                  <SelectItem value="merchandise">Мерч</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Наличие</label>
              <Select value={stockFilter} onValueChange={onStockFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Все товары" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  <SelectItem value="in-stock">В наличии</SelectItem>
                  <SelectItem value="low-stock">Заканчивается</SelectItem>
                  <SelectItem value="out-of-stock">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Популярность</label>
              <Select value={popularFilter} onValueChange={onPopularFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Все товары" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                  <SelectItem value="regular">Обычные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>
            Показано {filteredProducts} из {totalProducts} продуктов
          </span>
        </div>
        {hasActiveFilters && (
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            Фильтры применены
          </Badge>
        )}
      </div>
    </div>
  );
}
