// stores/productsStore.ts
import { create } from 'zustand';

export interface ProductsStore {
  // Поиск
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Категория
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Диапазон цен
  priceRange: [number, number] | null;
  setPriceRange: (range: [number, number] | null) => void;
  
  // Сортировка
  sortBy: 'name' | 'price' | 'popularity' | 'inStock' | 'newest';
  setSortBy: (sort: 'name' | 'price' | 'popularity' | 'inStock' | 'newest') => void;
  
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Сброс всех фильтров
  resetFilters: () => void;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  // Начальные значения
  searchQuery: '',
  selectedCategory: 'all',
  priceRange: null,
  sortBy: 'newest',
  sortOrder: 'desc',
  
  // Действия
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setPriceRange: (range: [number, number] | null) => set({ priceRange: range }),
  setSortBy: (sort: 'name' | 'price' | 'popularity' | 'inStock' | 'newest') => set({ sortBy: sort }),
  setSortOrder: (order: 'asc' | 'desc') => set({ sortOrder: order }),
  
  resetFilters: () => set({
    searchQuery: '',
    selectedCategory: 'all',
    priceRange: null,
    sortBy: 'newest',
    sortOrder: 'desc',
  }),
}));
