// components/admin/products/ProductFiltersTyped.tsx
import React from 'react';
import { usePersistentFiltersTyped } from '@/hooks/usePersistentFiltersTyped';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProductFiltersTyped() {
  const {
    filters,
    updateCategoryFilter,
    updateStockFilter,
    updatePopularFilter,
    updateSortBy,
    updateSortOrder,
    updateSearchTerm,
    resetFilters,
    CATEGORY_FILTERS,
    STOCK_FILTERS,
    POPULAR_FILTERS,
    SORT_BY_OPTIONS,
    SORT_ORDER_OPTIONS
  } = usePersistentFiltersTyped();

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <input
        type="text"
        value={filters.searchTerm}
        onChange={(e) => updateSearchTerm(e.target.value)}
        placeholder="Поиск продуктов..."
        className="w-full p-2 border rounded"
      />

      {/* Категория */}
      <Select value={filters.categoryFilter} onValueChange={updateCategoryFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите категорию" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_FILTERS.map((category) => (
            <SelectItem key={category} value={category}>
              {category === 'all' ? 'Все категории' : category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Наличие на складе */}
      <Select value={filters.stockFilter} onValueChange={updateStockFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Наличие на складе" />
        </SelectTrigger>
        <SelectContent>
          {STOCK_FILTERS.map((stock) => (
            <SelectItem key={stock} value={stock}>
              {stock === 'all' ? 'Все товары' : stock}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Популярность */}
      <Select value={filters.popularFilter} onValueChange={updatePopularFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Популярность" />
        </SelectTrigger>
        <SelectContent>
          {POPULAR_FILTERS.map((popular) => (
            <SelectItem key={popular} value={popular}>
              {popular === 'all' ? 'Все товары' : popular}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Сортировка */}
      <div className="flex gap-2">
        <Select value={filters.sortBy} onValueChange={updateSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Сортировать по" />
          </SelectTrigger>
          <SelectContent>
            {SORT_BY_OPTIONS.map((sortBy) => (
              <SelectItem key={sortBy} value={sortBy}>
                {sortBy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortOrder} onValueChange={updateSortOrder}>
          <SelectTrigger>
            <SelectValue placeholder="Порядок" />
          </SelectTrigger>
          <SelectContent>
            {SORT_ORDER_OPTIONS.map((order) => (
              <SelectItem key={order} value={order}>
                {order === 'asc' ? 'По возрастанию' : 'По убыванию'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button 
        onClick={resetFilters}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
