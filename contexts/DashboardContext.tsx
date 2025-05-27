// contexts/DashboardContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  UnifiedTrainer, 
  UnifiedClient, 
  UnifiedEvent, 
  DashboardStats, 
  Analytics 
} from '@/types/dashboard';

interface DashboardContextType {
  trainers: UnifiedTrainer[];
  clients: UnifiedClient[];
  events: UnifiedEvent[];
  stats: DashboardStats;
  analytics: Analytics | null;
  loading: boolean;
  error: string | null;
  syncAllData: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const dashboardData = useDashboardData();

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
