// components/auth/face-scanner/video-scanner.tsx
"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFaceAPIGitHub } from "./hooks/use-face-api-github";

export interface FaceDetectionData {
  detection: any;
  landmarks?: any; // ✅ Добавляем landmarks
  descriptor?: Float32Array; // ✅ Добавляем дескриптор
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface VideoScannerProps {
  onFaceDetected: (faceData: FaceDetectionData) => void;
  disabled?: boolean;
  className?: string;
}

export function VideoScanner({ onFaceDetected, disabled = false, className }: VideoScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string>("");
  const [faceCount, setFaceCount] = useState(0);
  const [modelsStatus, setModelsStatus] = useState<string>("");
  
  const { toast } = useToast();
  const { faceapi, modelsLoaded, isLoadingModels, modelSource, error, loadFaceAPI } = useFaceAPIGitHub();

  // ✅ Загрузка всех необходимых моделей
  const loadAllModels = useCallback(async () => {
    if (!faceapi) return;
    
    try {
      setModelsStatus("🤖 Загрузка дополнительных моделей...");
      
      const githubUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/a86f011d72124e5fb93e59d5c4ab98f699dd5c9c/weights';
      
      // Загружаем landmarks модель
      if (!faceapi.nets.faceLandmark68Net.isLoaded) {
        console.log('📥 Загружаем face landmarks...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(githubUrl);
        console.log('✅ Face landmarks загружены');
      }
      
      // Загружаем recognition модель
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        console.log('📥 Загружаем face recognition...');
        await faceapi.nets.faceRecognitionNet.loadFromUri(githubUrl);
        console.log('✅ Face recognition загружены');
      }
      
      setModelsStatus("✅ Все модели загружены");
      
    } catch (error) {
      console.error('❌ Ошибка загрузки дополнительных моделей:', error);
      setModelsStatus("⚠️ Базовая детекция доступна");
    }
  }, [faceapi]);

  // ✅ Полная детекция с landmarks и дескрипторами
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceapi || !modelsLoaded) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    try {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      // ✅ Полная детекция: detection + landmarks + descriptor
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      // ✅ Рисуем детекцию и landmarks
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      setFaceCount(detections.length);

      if (detections.length === 1) {
        const detection = detections[0];
        const faceData: FaceDetectionData = {
          detection: detection.detection,
          landmarks: detection.landmarks,
          descriptor: detection.descriptor,
          box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height,
          }
        };

        setDetectionStatus("✅ Лицо полностью распознано");
        onFaceDetected(faceData);
      } else if (detections.length === 0) {
        setDetectionStatus("👤 Поместите лицо в кадр");
      } else {
        setDetectionStatus("⚠️ Обнаружено несколько лиц");
      }

    } catch (error) {
      console.error('❌ Ошибка детекции:', error);
      setDetectionStatus("❌ Ошибка детекции");
    }
  }, [faceapi, modelsLoaded, onFaceDetected]);

  const startScanning = useCallback(async () => {
    if (disabled) {
      toast({
        variant: "destructive",
        title: "Сканер отключен",
        description: "Сканирование лица недоступно",
      });
      return;
    }

    setIsScanning(true);
    setDetectionStatus("🚀 Запуск...");

    try {
      console.log('🎥 Запускаем камеру...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }, 
          facingMode: "user"
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });

        if (!faceapi || !modelsLoaded) {
          setDetectionStatus("🤖 Загрузка Face API из GitHub...");
          await loadFaceAPI();
        }
        
        // ✅ Загружаем дополнительные модели
        await loadAllModels();
        
        setDetectionStatus("🔍 Поиск лица...");
        detectionIntervalRef.current = setInterval(detectFace, 300);
      }

    } catch (error) {
      console.error("❌ Ошибка запуска:", error);
      setIsScanning(false);
      setDetectionStatus("❌ Ошибка");
      
      toast({
        variant: "destructive",
        title: "Ошибка сканирования",
        description: (error as Error).message,
      });
    }
  }, [disabled, faceapi, modelsLoaded, loadFaceAPI, loadAllModels, detectFace, toast]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setDetectionStatus("");
    setModelsStatus("");
    setFaceCount(0);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  useEffect(() => {
    return () => stopScanning();
  }, [stopScanning]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Статус загрузки */}
      {isLoadingModels && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span>Загрузка моделей из GitHub Raw...</span>
          </div>
        </div>
      )}

      {/* Статус дополнительных моделей */}
      {modelsStatus && (
        <div className="p-2 bg-blue-100 text-blue-800 rounded text-sm">
          {modelsStatus}
        </div>
      )}

      {/* Источник моделей */}
      {modelSource && (
        <div className="p-2 bg-green-100 text-green-800 rounded text-sm">
          ✅ Модели загружены из: {modelSource}
        </div>
      )}

      {/* Ошибки */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ Ошибка: {error}
        </div>
      )}

      {/* Статус детекции */}
      {detectionStatus && (
        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-center">
          <div className="font-medium">{detectionStatus}</div>
          {faceCount > 0 && (
            <div className="text-sm mt-1">Лиц в кадре: {faceCount}</div>
          )}
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex space-x-2">
        {!isScanning ? (
          <Button 
            onClick={startScanning} 
            disabled={disabled || isLoadingModels}
            className="flex-1"
          >
            {isLoadingModels ? "Загрузка из GitHub..." : "🎥 Начать сканирование"}
          </Button>
        ) : (
          <Button 
            onClick={stopScanning} 
            variant="destructive"
            className="flex-1"
          >
            ⏹️ Остановить сканирование
          </Button>
        )}
      </div>

      {/* Видео */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg border"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      </div>
    </div>
  );
}
