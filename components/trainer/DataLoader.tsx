// components/trainer/DataLoader.tsx
"use client";

import { ReactNode } from 'react';
import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';

interface DataLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function DataLoader({ children, fallback }: DataLoaderProps) {
  const { isLoading, error } = useTrainerDataQuery();

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Ошибка загрузки данных</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Перезагрузить страницу
        </button>
      </div>
    );
  }

  if (isLoading) {
    return fallback || (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Загрузка данных...</p>
      </div>
    );
  }

  return <>{children}</>;
}
