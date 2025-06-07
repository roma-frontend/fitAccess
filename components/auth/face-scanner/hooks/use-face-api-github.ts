// components/auth/face-scanner/hooks/use-face-api-github.ts
"use client";

import { useState, useRef } from "react";

export function useFaceAPIGitHub() {
  const [faceapi, setFaceapi] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelSource, setModelSource] = useState<string>("");
  const [error, setError] = useState<string>("");
  const loadingRef = useRef(false);

  const loadFaceAPI = async () => {
    if (loadingRef.current || (faceapi && modelsLoaded)) return;
    
    try {
      loadingRef.current = true;
      setIsLoadingModels(true);
      setError("");
      
      console.log('🤖 Загружаем Face API...');
      
      // ✅ Загружаем модуль
      const faceApiModule = await import('@vladmandic/face-api');
      setFaceapi(faceApiModule);
      console.log('📦 Face API модуль загружен');
      
      // ✅ Используем GitHub Raw (единственный рабочий источник)
      const githubUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/a86f011d72124e5fb93e59d5c4ab98f699dd5c9c/weights';
      
      console.log('📥 Загружаем модели из GitHub Raw...');
      console.log('URL:', githubUrl);
      
      // ✅ Загружаем с подробным логированием
      await faceApiModule.nets.tinyFaceDetector.loadFromUri(githubUrl);
      console.log('✅ tiny_face_detector успешно загружен из GitHub Raw');
      
      setModelSource('GitHub Raw');
      setModelsLoaded(true);
      console.log('✅ Face API полностью готов!');
      
    } catch (error) {
      console.error('❌ Ошибка загрузки Face API из GitHub Raw:', {
        error,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      setError(`Ошибка загрузки: ${(error as Error).message}`);
      setFaceapi(null);
      setModelsLoaded(false);
      setModelSource("");
      throw error;
    } finally {
      setIsLoadingModels(false);
      loadingRef.current = false;
    }
  };

  return {
    faceapi,
    modelsLoaded,
    isLoadingModels,
    modelSource,
    error,
    loadFaceAPI
  };
}
