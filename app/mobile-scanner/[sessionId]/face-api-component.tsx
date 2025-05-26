// app/mobile-scanner/[sessionId]/face-api-component.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FaceDescriptor {
  id: string;
  name: string;
  faceDescriptor: number[];
}

interface FaceAPIComponentProps {
  sessionId: string;
  faceDescriptors: FaceDescriptor[];
  isMobile: boolean;
}

export default function FaceAPIComponent({ 
  sessionId, 
  faceDescriptors, 
  isMobile 
}: FaceAPIComponentProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [faceapi, setFaceapi] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dynamically import face-api only on client side
  useEffect(() => {
    const loadFaceAPI = async () => {
      try {
        const faceapiModule = await import("@vladmandic/face-api");
        setFaceapi(faceapiModule);
        console.log("✅ Face-API модуль загружен");
      } catch (error) {
        console.error("❌ Ошибка загрузки face-api:", error);
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: "Не удалось загрузить библиотеку распознавания лиц",
        });
      }
    };

    loadFaceAPI();
  }, [toast]);

  // Load models when face-api is ready
  useEffect(() => {
    if (!faceapi) return;

    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        toast({
          title: "Модели загружены",
          description: "Мобильный сканер готов к работе",
        });
      } catch (error) {
        console.error("Ошибка загрузки моделей:", error);
        toast({
          variant: "destructive",
          title: "Ошибка загрузки моделей",
          description: "Не удалось загрузить модели распознавания лиц",
        });
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [faceapi, toast]);

  const startScanning = async () => {
    if (!modelsLoaded || !faceapi) {
      toast({
        variant: "destructive",
        title: "Модели не загружены",
        description: "Дождитесь загрузки моделей распознавания лиц",
      });
      return;
    }

    setIsScanning(true);

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: isMobile ? { ideal: "environment" } : "user",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      detectFace();
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
      setIsScanning(false);
      toast({
        variant: "destructive",
        title: "Ошибка доступа к камере",
        description: "Не удалось получить доступ к камере. Проверьте разрешения.",
      });
    }
  };

  const stopScanning = () => {
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || !faceapi) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(detectFace);
      return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        const labeledDescriptors = faceDescriptors
          .filter(
            (descriptor: FaceDescriptor) =>
              descriptor.faceDescriptor && descriptor.faceDescriptor.length > 0
          )
          .map(
            (descriptor: FaceDescriptor) =>
              new faceapi.LabeledFaceDescriptors(descriptor.name, [
                new Float32Array(descriptor.faceDescriptor),
              ])
          );

        if (labeledDescriptors.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
          const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
          console.log("Результат распознавания:", bestMatch.toString());

          if (bestMatch.label !== "unknown") {
                        const matchedUser = faceDescriptors.find(
              (descriptor: FaceDescriptor) =>
                descriptor.name === bestMatch.label
            );

            if (matchedUser) {
              stopScanning();
              setIsLoading(true);

              try {
                await fetch("/api/access-log", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: matchedUser.id,
                    success: true,
                    deviceInfo: `Mobile Scanner - ${navigator.userAgent}`,
                  }),
                });

                const response = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: matchedUser.id,
                    name: matchedUser.name,
                    role: "user",
                  }),
                });

                if (response.ok) {
                  toast({
                    title: "Вход выполнен успешно",
                    description: `Добро пожаловать, ${matchedUser.name}!`,
                  });

                  setTimeout(() => {
                    window.location.href = "/dashboard";
                  }, 1500);
                } else {
                  toast({
                    variant: "destructive",
                    title: "Ошибка входа",
                    description: "Не удалось выполнить вход в систему",
                  });
                }
              } catch (error) {
                console.error("Ошибка входа:", error);
                toast({
                  variant: "destructive",
                  title: "Ошибка входа",
                  description: "Произошла ошибка при попытке входа",
                });
              } finally {
                setIsLoading(false);
              }
              return;
            }
          }
        }
      }

      if (isScanning) {
        requestAnimationFrame(detectFace);
      }
    } catch (error) {
      console.error("Ошибка распознавания лица:", error);
      if (isScanning) {
        requestAnimationFrame(detectFace);
      }
    }
  };

  const switchCamera = async () => {
    if (!isScanning) return;
    stopScanning();
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  return (
    <>
      {isLoadingModels && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="font-medium text-blue-900">
                Загрузка моделей распознавания...
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Пожалуйста, подождите. Это может занять несколько секунд.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              onPlay={detectFace}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />

            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white p-4">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="mb-4">
                    Нажмите кнопку ниже, чтобы начать сканирование
                  </p>
                  <p className="text-sm opacity-75">
                    Убедитесь, что ваше лицо хорошо освещено
                  </p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                🔴 Сканирование активно
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Выполнение входа...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {isScanning ? (
            <Button
              onClick={stopScanning}
              variant="destructive"
              disabled={isLoading}
              className="w-full py-3 text-lg"
            >
              Остановить сканирование
            </Button>
          ) : (
            <Button
              onClick={startScanning}
              disabled={isLoadingModels || !modelsLoaded || isLoading || !faceapi}
              className="w-full py-3 text-lg"
            >
              {isLoadingModels
                ? "Загрузка моделей..."
                : !faceapi
                ? "Загрузка библиотеки..."
                : isLoading
                ? "Выполнение входа..."
                : "Начать сканирование лица"}
            </Button>
          )}

          {isScanning && isMobile && (
            <Button
              onClick={switchCamera}
              variant="outline"
              className="w-full"
            >
              🔄 Переключить камеру
            </Button>
          )}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">🔧 Отладочная информация</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <p>Session ID: {sessionId}</p>
                <p>Face-API загружен: {faceapi ? "да" : "нет"}</p>
                <p>Модели загружены: {modelsLoaded ? "да" : "нет"}</p>
                <p>Сканирование активно: {isScanning ? "да" : "нет"}</p>
                <p>Мобильное устройство: {isMobile ? "да" : "нет"}</p>
                <p>Зарегистрированных лиц: {faceDescriptors.length}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

