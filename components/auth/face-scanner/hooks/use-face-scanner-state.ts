// components/auth/face-scanner/hooks/use-face-scanner-state.ts
"use client";

import { useState, useCallback } from "react";

interface FaceScannerState {
  isScanning: boolean;
  isLoading: boolean;
  modelsLoaded: boolean;
  isLoadingModels: boolean;
  faceapi: any;
}

export function useFaceScannerState() {
  const [state, setState] = useState<FaceScannerState>({
    isScanning: false,
    isLoading: false,
    modelsLoaded: false,
        isLoadingModels: false,
    faceapi: null,
  });

  const updateState = useCallback((updates: Partial<FaceScannerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setScanning = useCallback((isScanning: boolean) => {
    updateState({ isScanning });
  }, [updateState]);

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  const setModelsLoaded = useCallback((modelsLoaded: boolean) => {
    updateState({ modelsLoaded });
  }, [updateState]);

  const setLoadingModels = useCallback((isLoadingModels: boolean) => {
    updateState({ isLoadingModels });
  }, [updateState]);

  const setFaceapi = useCallback((faceapi: any) => {
    updateState({ faceapi });
  }, [updateState]);

  return {
    ...state,
    setScanning,
    setLoading,
    setModelsLoaded,
    setLoadingModels,
    setFaceapi,
    updateState,
  };
}

