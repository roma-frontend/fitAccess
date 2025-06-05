// hooks/useAnalyticsCache.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  period: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export function useAnalyticsCache<T>(
  key: string,
  fetcher: (period: string) => Promise<T>,
  period: string
) {
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${key}-${period}`;

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем кэш
      const cached = cache.get(cacheKey);
      const now = Date.now();
      
      if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }

      // Загружаем новые данные
      const newData = await fetcher(period);
      
      // Сохраняем в кэш
      const newCache = new Map(cache);
      newCache.set(cacheKey, {
        data: newData,
        timestamp: now,
        period
      });
      setCache(newCache);
      setData(newData);
      
      return newData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      console.error(`Error fetching ${key}:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, period, cacheKey, cache, fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache
  };
}
