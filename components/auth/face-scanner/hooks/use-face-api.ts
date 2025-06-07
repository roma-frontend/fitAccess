// components/auth/face-scanner/hooks/use-face-api.ts
"use client";

import { useState, useRef } from "react";

export function useFaceAPI() {
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
      
      const faceApiModule = await import('@vladmandic/face-api');
      setFaceapi(faceApiModule);
      
      console.log('📦 Face API модуль загружен, пробуем источники...');
      
      // ✅ Сначала локальные, потом CDN
      const sources = [
        {
          name: 'Локальные файлы',
          path: '/models'
        },
        {
          name: 'UNPKG CDN',
          path: 'https://unpkg.com/face-api.js@0.22.2/weights'
        },
        {
          name: 'JSDelivr CDN',
          path: 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'
        }
      ];

      let loadedFrom = '';

      for (const source of sources) {
        try {
          console.log(`📥 Пробуем загрузить из: ${source.name} (${source.path})`);
          
          await faceApiModule.nets.tinyFaceDetector.loadFromUri(source.path);
          
          console.log(`✅ tiny_face_detector загружен из: ${source.name}`);
          loadedFrom = source.name;
          break;
          
        } catch (sourceError) {
          console.warn(`❌ ${source.name} не сработал:`, sourceError);
          continue;
        }
      }

      if (!loadedFrom) {
        throw new Error('Не удалось загрузить модели ни из одного источника');
      }
      
      setModelSource(loadedFrom);
      setModelsLoaded(true);
      console.log(`✅ Face API готов! Загружено из: ${loadedFrom}`);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки Face API:', error);
      setError((error as Error).message);
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
