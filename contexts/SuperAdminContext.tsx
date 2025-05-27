// contexts/SuperAdminContext.tsx (используем единую функцию)
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ensureDebugSystem } from '@/utils/cleanTypes';

interface SuperAdminContextType {
  trainers: any[];
  clients: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addTrainer?: (trainer: any) => void;
  updateTrainer?: (id: string, data: any) => void;
  deleteTrainer?: (id: string) => void;
  addClient?: (client: any) => void;
  updateClient?: (id: string, data: any) => void;
  deleteClient?: (id: string) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [trainers, setTrainers] = useState<any[]>([
    { _id: "trainer1", name: "Анна Петрова", role: "Персональный тренер", status: "active" },
    { _id: "trainer2", name: "Дмитрий Козлов", role: "Фитнес тренер", status: "active" },
    { _id: "trainer3", name: "Елена Васильева", role: "Йога инструктор", status: "active" },
  ]);

  const [clients, setClients] = useState<any[]>([
    { _id: "client1", name: "Анна Смирнова", role: "client", status: "active" },
    { _id: "client2", name: "Дмитрий Козлов", role: "client", status: "active" },
    { _id: "client3", name: "Елена Васильева", role: "client", status: "active" },
    { _id: "client4", name: "Михаил Петров", role: "client", status: "active" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    console.log("🔄 SuperAdmin: обновление данных...");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    console.log("✅ SuperAdmin: данные обновлены");
  };

  const addTrainer = (trainer: any) => {
    console.log('➕ SuperAdmin: добавление тренера', trainer);
    setTrainers(prev => [...prev, { ...trainer, _id: `trainer_${Date.now()}` }]);
  };

  const updateTrainer = (id: string, data: any) => {
    console.log('📝 SuperAdmin: обновление тренера', id, data);
    setTrainers(prev => prev.map(t => t._id === id ? { ...t, ...data } : t));
  };

  const deleteTrainer = (id: string) => {
    console.log('🗑️ SuperAdmin: удаление тренера', id);
    setTrainers(prev => prev.filter(t => t._id !== id));
  };

  const addClient = (client: any) => {
    console.log('➕ SuperAdmin: добавление клиента', client);
    setClients(prev => [...prev, { ...client, _id: `client_${Date.now()}` }]);
  };

  const updateClient = (id: string, data: any) => {
    console.log('📝 SuperAdmin: обновление клиента', id, data);
    setClients(prev => prev.map(c => c._id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    console.log('🗑️ SuperAdmin: удаление клиента', id);
    setClients(prev => prev.filter(c => c._id !== id));
  };

  // ✅ РЕГИСТРИРУЕМ В DEBUG СИСТЕМЕ С ЕДИНОЙ ФУНКЦИЕЙ
  useEffect(() => {
    if (typeof window !== "undefined") {
      // ✅ ИСПОЛЬЗУЕМ ЕДИНУЮ ФУНКЦИЮ ИНИЦИАЛИЗАЦИИ
      ensureDebugSystem();

      const superAdminContext = {
        trainers,
        clients,
        loading,
        error,
        refreshData,
        getStats: () => ({
          totalTrainers: trainers.length,
          totalClients: clients.length,
          loading,
          lastUpdate: new Date().toISOString(),
        }),
        addTrainer,
        updateTrainer,
        deleteTrainer,
        addClient,
        updateClient,
        deleteClient,
      };

      window.fitAccessDebug.superAdmin = superAdminContext;
      console.log("✅ SuperAdmin контекст зарегистрирован в debug системе");
    }
  }, []);

  // ✅ ОБНОВЛЯЕМ ДАННЫЕ В DEBUG СИСТЕМЕ ПРИ ИЗМЕНЕНИЯХ
  useEffect(() => {
    if (typeof window !== "undefined" && window.fitAccessDebug?.superAdmin) {
      window.fitAccessDebug.superAdmin.trainers = trainers;
      window.fitAccessDebug.superAdmin.clients = clients;
      window.fitAccessDebug.superAdmin.loading = loading;
      window.fitAccessDebug.superAdmin.error = error;
    }
  }, [trainers, clients, loading, error]);

  const value: SuperAdminContextType = {
    trainers,
    clients,
    loading,
    error,
    refreshData,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addClient,
    updateClient,
    deleteClient,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
}
