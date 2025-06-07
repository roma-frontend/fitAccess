// components/auth/face-scanner/context/face-scanner-context.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useFaceScannerState } from "../hooks/use-face-scanner-state";

interface FaceScannerContextType {
  isScanning: boolean;
  isLoading: boolean;
  modelsLoaded: boolean;
  isLoadingModels: boolean;
  faceapi: any;
  setScanning: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setModelsLoaded: (value: boolean) => void;
  setLoadingModels: (value: boolean) => void;
  setFaceapi: (value: any) => void;
}

const FaceScannerContext = createContext<FaceScannerContextType | null>(null);

export function FaceScannerProvider({ children }: { children: ReactNode }) {
  const state = useFaceScannerState();

  return (
    <FaceScannerContext.Provider value={state}>
      {children}
    </FaceScannerContext.Provider>
  );
}

export function useFaceScannerContext() {
  const context = useContext(FaceScannerContext);
  if (!context) {
    throw new Error('useFaceScannerContext must be used within FaceScannerProvider');
  }
  return context;
}
