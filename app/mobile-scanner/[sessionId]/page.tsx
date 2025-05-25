"use client";

import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as faceapi from "@vladmandic/face-api";

interface FaceDescriptor {
  id: string;
  name: string;
  faceDescriptor: number[];
}

interface MobileScannerProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function MobileScannerPage({ params }: MobileScannerProps) {
  // Unwrap params using React.use()
  const { sessionId } = use(params);

  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const faceDescriptors = useQuery(api.users.getAllFaceDescriptors) || [];

  // Определяем, мобильное ли это устройство
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ["mobile", "android", "iphone", "ipad", "tablet"];
      return mobileKeywords.some((keyword) => userAgent.includes(keyword));
    };

    setIsMobile(checkMobile());
    setCurrentUrl(window.location.href);
  }, []);

  // Загрузка моделей при монтировании компонента
  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const MODEL_URL =
          "https://justadudewhohacks.github.io/face-api.js/models";

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

    // Очистка при размонтировании
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  const startScanning = async () => {
    if (!modelsLoaded) {
      toast({
        variant: "destructive",
        title: "Модели не загружены",
        description: "Дождитесь загрузки моделей распознавания лиц",
      });
      return;
    }

    setIsScanning(true);

    try {
      // Запрашиваем доступ к задней камере на мобильных устройствах
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: isMobile ? { ideal: "environment" } : "user", // Задняя камера на мобильных
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Начинаем процесс распознавания
      detectFace();
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
      setIsScanning(false);
      toast({
        variant: "destructive",
        title: "Ошибка доступа к камере",
        description:
          "Не удалось получить доступ к камере. Проверьте разрешения.",
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

  const switchCamera = async () => {
    if (!isScanning) return;

    stopScanning();

    // Переключаем между передней и задней камерой
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Проверяем, что видео готово
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(detectFace);
      return;
    }

    // Устанавливаем размеры canvas равными размерам видео
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      // Обнаруживаем лицо на видео
      const detections = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        // Рисуем обнаруженное лицо на canvas
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        // Создаем LabeledFaceDescriptors для сравнения
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
          // Создаем FaceMatcher для сравнения лиц
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

          // Находим лучшее совпадение
          const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
          console.log("Результат распознавания:", bestMatch.toString());

          if (bestMatch.label !== "unknown") {
            // Нашли совпадение
            const matchedUser = faceDescriptors.find(
              (descriptor: FaceDescriptor) =>
                descriptor.name === bestMatch.label
            );

            if (matchedUser) {
              // Останавливаем сканирование
              stopScanning();

              // Выполняем вход
              setIsLoading(true);

              try {
                // Записываем лог доступа
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

                // Выполняем вход через API
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

                  // Перенаправляем на дашборд
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

      // Продолжаем распознавание, если не нашли совпадение
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на сессию скопирована в буфер обмена",
      });
    } catch (error) {
      console.error("Ошибка копирования:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              📱 Мобильный сканер лица
            </CardTitle>
            <CardDescription>Сессия: {sessionId}</CardDescription>
          </CardHeader>
        </Card>

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
          {/* Основные кнопки управления */}
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
                disabled={isLoadingModels || !modelsLoaded || isLoading}
                className="w-full py-3 text-lg"
              >
                {isLoadingModels
                  ? "Загрузка моделей..."
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

          {/* Альтернативные варианты */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Альтернативы</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => (window.location.href = "/login")}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              🔐 Войти по паролю
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              🏠 Вернуться на главную
            </Button>
          </div>
        </div>

        {/* Информационные сообщения */}
        <div className="mt-6 space-y-4">
          {faceDescriptors.length === 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <p className="font-medium text-orange-900">
                  Нет зарегистрированных лиц
                </p>
                <p className="text-sm text-orange-800 mt-1">
                  Обратитесь к администратору для регистрации вашего лица в
                  системе.
                </p>
              </CardContent>
            </Card>
          )}

          {faceDescriptors.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="font-medium text-green-900">
                  Система готова к работе
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Найдено {faceDescriptors.length} зарегистрированных лиц в базе
                  данных.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Советы для мобильного сканирования */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">
                📱 Советы для мобильного сканирования:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Держите телефон вертикально</li>
                <li>• Убедитесь, что лицо хорошо освещено</li>
                <li>• Держите устройство на расстоянии 30-50 см от лица</li>
                <li>• Смотрите прямо в камеру</li>
                <li>• Избегайте резких движений</li>
                {isMobile && (
                  <li>
                    • Используйте кнопку переключения камеры при необходимости
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Информация о сессии */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                ℹ️ Информация о сессии:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  ID сессии:{" "}
                  <code className="bg-gray-200 px-1 rounded">{sessionId}</code>
                </p>
                <p>Устройство: {isMobile ? "📱 Мобильное" : "💻 Десктоп"}</p>
                <p>
                  Статус моделей:{" "}
                  {modelsLoaded ? "✅ Загружены" : "⏳ Загружаются"}
                </p>
                <p>Активное сканирование: {isScanning ? "✅ Да" : "❌ Нет"}</p>
              </div>
            </CardContent>
          </Card>

          {/* QR код для быстрого доступа */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">
                📲 Поделиться ссылкой:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-purple-800">
                  Скопируйте ссылку для быстрого доступа к этой сессии:
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={currentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-l bg-white"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="rounded-l-none border-l-0 border-purple-200"
                  >
                    📋
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Отладочная информация в режиме разработки */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mt-6 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">
                🔧 Отладочная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <p>Session ID: {sessionId}</p>
              <p>Модели загружены: {modelsLoaded ? "да" : "нет"}</p>
              <p>Сканирование активно: {isScanning ? "да" : "нет"}</p>
              <p>Мобильное устройство: {isMobile ? "да" : "нет"}</p>
              <p>Зарегистрированных лиц: {faceDescriptors.length}</p>
              <p>Current URL: {currentUrl}</p>
              <p>
                User Agent:{" "}
                {typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
