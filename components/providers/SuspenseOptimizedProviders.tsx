// components/providers/SuspenseOptimizedProviders.tsx
"use client";

import { Suspense, lazy } from 'react';
import { OptimizedProviders } from './OptimizedProviders';
import FitnessLoader from '@/components/ui/FitnessLoader';

// Ленивая загрузка тяжелых провайдеров
const LazyOptimizedProviders = lazy(() => 
  import('./OptimizedProviders').then(module => ({
    default: module.OptimizedProviders
  }))
);

interface SuspenseOptimizedProvidersProps {
  children: React.ReactNode;
}

export function SuspenseOptimizedProviders({ children }: SuspenseOptimizedProvidersProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FitnessLoader size="lg" variant="dumbbell" text="Загрузка контекста..." />
        </div>
      }
    >
      <LazyOptimizedProviders>
        {children}
      </LazyOptimizedProviders>
    </Suspense>
  );
}
