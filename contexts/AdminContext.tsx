// contexts/AdminContext.tsx (исправленная версия)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminStats {
  totalUsers: number;
  totalManagers: number;
  systemLoad: number;
  systemAlerts: number;
  activeUsers: number;
  monthlyRevenue: number;
  newRegistrations: number;
  systemStatus: "healthy" | "warning" | "critical";
}


interface AdminContextType {
  stats: AdminStats;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshData: () => Promise<void>; // ← Добавляем для единообразия
}


const defaultStats: AdminStats = {
  totalUsers: 0,
  totalManagers: 0,
  systemLoad: 0,
  systemAlerts: 0,
  activeUsers: 0,
  monthlyRevenue: 0,
  newRegistrations: 0,
  systemStatus: "healthy",
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Загрузка статистики администратора...');

      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Мок данные для демонстрации
      const mockStats: AdminStats = {
        totalUsers: 1247 + Math.floor(Math.random() * 10), // Небольшие изменения для демонстрации
        totalManagers: 8,
        systemLoad: Math.random() * 0.9 + 0.1, // 10-100%
        systemAlerts: Math.floor(Math.random() * 5), // 0-4 уведомления
        activeUsers: 156 + Math.floor(Math.random() * 20),
        monthlyRevenue: 2850000 + Math.floor(Math.random() * 100000),
        newRegistrations: 23 + Math.floor(Math.random() * 5),
        systemStatus: Math.random() > 0.8 ? "warning" : "healthy",
      };

      setStats(mockStats);
      console.log('✅ Статистика администратора загружена');
    } catch (err) {
      console.error("❌ Ошибка загрузки статистики:", err);
      setError("Не удалось загрузить статистику");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    console.log('🔄 Обновление статистики администратора...');
    await fetchStats();
  };

  // Алиас для единообразия с другими контекстами
  const refreshData = async () => {
    await refreshStats();
  };

  useEffect(() => {
    fetchStats();

    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const value: AdminContextType = {
    stats,
    loading,
    error,
    refreshStats,
    refreshData // ← Добавляем для единообразия
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
