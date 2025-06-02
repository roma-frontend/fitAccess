// hooks/useUrlSyncedFilters.ts
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { usePersistentFilters } from './usePersistentFilters';

export function useUrlSyncedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, updateFilter, updateMultipleFilters, resetFilters } = usePersistentFilters();

  // Синхронизируем URL с фильтрами при изменении фильтров
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (filters.searchTerm) params.set('search', filters.searchTerm);
    if (filters.categoryFilter !== 'all') params.set('category', filters.categoryFilter);
    if (filters.stockFilter !== 'all') params.set('stock', filters.stockFilter);
    if (filters.popularFilter !== 'all') params.set('popular', filters.popularFilter);
    if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'asc') params.set('sortOrder', filters.sortOrder);

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Синхронизируем фильтры с URL при загрузке страницы
  useEffect(() => {
    const urlFilters: any = {};
    
    const search = searchParams.get('search');
    if (search) urlFilters.searchTerm = search;

    const category = searchParams.get('category');
    if (category) urlFilters.categoryFilter = category;

    const stock = searchParams.get('stock');
    if (stock) urlFilters.stockFilter = stock;

    const popular = searchParams.get('popular');
    if (popular) urlFilters.popularFilter = popular;

    const sortBy = searchParams.get('sortBy');
    if (sortBy) urlFilters.sortBy = sortBy;

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder) urlFilters.sortOrder = sortOrder;

    if (Object.keys(urlFilters).length > 0) {
      updateMultipleFilters(urlFilters);
    }
  }, [searchParams, updateMultipleFilters]);

  // Обновляем URL при изменении фильтров (с debounce)
  useEffect(() => {
    const timeoutId = setTimeout(syncToUrl, 300);
    return () => clearTimeout(timeoutId);
  }, [syncToUrl]);

  const resetFiltersAndUrl = useCallback(() => {
    resetFilters();
    router.replace('', { scroll: false });
  }, [resetFilters, router]);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters: resetFiltersAndUrl,
  };
}
