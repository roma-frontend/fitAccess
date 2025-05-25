// components/auth/face-scanner.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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
import QRCode from "qrcode";

interface FaceDescriptor {
  id: string;
  name: string;
  faceDescriptor: number[];
}

export function FaceScanner() {
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [mobileSessionId, setMobileSessionId] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [faceapi, setFaceapi] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const faceDescriptors = useQuery(api.users.getAllFaceDescriptors) || [];

  // Проверяем, отключен ли face-scanner
  const isFaceScannerDisabled =
    process.env.NEXT_PUBLIC_DISABLE_FACE_SCANNER === "true";

  // Устанавливаем флаг клиента после монтирования
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  // Динамическая загрузка face-api только в браузере
  useEffect(() => {
    if (!isClient || isFaceScannerDisabled) return;

    const loadFaceAPI = async () => {
      try {
        // Динамически импортируем face-api только в браузере
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
  }, [isClient, isFaceScannerDisabled, toast]);

  // Функция для тестового входа
  const handleTestLogin = async () => {
    console.log("🔄 Начинаем тестовый вход...");
    setIsLoading(true);

    try {
      const testUser = {
        userId: "test-user-" + Date.now(),
        name: "Тестовый Пользователь",
        email: "test@example.com",
        role: "user",
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUser),
      });

      if (response.ok) {
        try {
          await fetch("/api/access-log", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: testUser.userId,
              success: true,
              deviceInfo: isClient ? navigator.userAgent : "Server",
            }),
          });
        } catch (logError) {
          console.warn("⚠️ Не удалось записать лог:", logError);
        }

        toast({
          title: "Тестовый вход выполнен",
          description: `Добро пожаловать, ${testUser.name}!`,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: errorData.error || "Не удалось выполнить вход",
        });
      }
    } catch (error) {
      console.error("❌ Ошибка в handleTestLogin:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для генерации QR-кода
  const generateQRCode = async () => {
    if (!isClient) return;

    try {
      const sessionId = Math.random().toString(36).substr(2, 9);
      setMobileSessionId(sessionId);

      const mobileUrl = `${currentUrl}/mobile-scanner/${sessionId}`;
      console.log("🔗 Генерируем QR для URL:", mobileUrl);

      const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrDataUrl);
      setShowQR(true);

      toast({
        title: "QR-код сгенерирован",
        description: "Отсканируйте QR-код на мобильном устройстве",
      });
    } catch (error) {
      console.error("Ошибка генерации QR-кода:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сгенерировать QR-код",
      });
    }
  };

  // Функция для открытия мобильного сканера в новом окне
  const handleMobileScanner = () => {
    if (!isClient) return;

    console.log("📱 Открываем мобильный сканер...");
    const sessionId = Math.random().toString(36).substr(2, 9);
    const mobileUrl = `${currentUrl}/mobile-scanner/${sessionId}`;

    const newWindow = window.open(mobileUrl, "_blank");
    if (!newWindow) {
      router.push(`/mobile-scanner/${sessionId}`);
    }
  };

  // Функция для копирования ссылки
  const copyMobileLink = async () => {
    if (!isClient || !mobileSessionId) return;

    try {
      const mobileUrl = `${currentUrl}/mobile-scanner/${mobileSessionId}`;
      await navigator.clipboard.writeText(mobileUrl);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на мобильный сканер скопирована в буфер обмена",
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

  // Загрузка моделей face-api
  const loadModels = async () => {
    if (!faceapi || !isClient) return;

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
        description: "Система распознавания лиц готова к работе",
      });
    } catch (error) {
      console.error("Ошибка загрузки моделей:", error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки моделей",
        description: "Не удалось загрузить модели распознавания лиц. Используйте мобильный сканер.",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Загружаем модели когда face-api готов
  useEffect(() => {
    if (faceapi && !isFaceScannerDisabled) {
      loadModels();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [faceapi, isFaceScannerDisabled]);

  const startScanning = async () => {
    if (!modelsLoaded || !faceapi) {
      toast({
        variant: "destructive",
        title: "Система не готова",
        description: "Дождитесь загрузки моделей распознавания лиц",
      });
      return;
    }

    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
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
        description: "Не удалось получить доступ к камере. Используйте QR-код для мобильного сканера.",
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
              (descriptor: FaceDescriptor) => descriptor.name === bestMatch.label
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
                    deviceInfo: navigator.userAgent,
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
                  router.push("/dashboard");
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

  // Показываем загрузку до полной инициализации клиента
  if (!isClient) {
    return (
      <div className="space-y-6">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Инициализация системы...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если face-scanner отключен, показываем упрощенный интерфейс
  if (isFaceScannerDisabled) {
    return (
      <div className="space-y-6">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg font-semibold mb-2">
                Face Scanner отключен
              </h3>
              <p className="text-gray-600 mb-4">Камера временно недоступна</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleTestLogin}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading
              ? "Выполняется вход..."
              : "🧪 Войти без сканирования (Тест)"}
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={generateQRCode}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              📱 QR-код для телефона
            </Button>

            <Button
              onClick={handleMobileScanner}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              🔗 Прямая ссылка
            </Button>
          </div>
        </div>

        {/* QR-код модальное окно */}
        {showQR && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">
                📱 QR-код для мобильного сканера
              </CardTitle>
              <CardDescription>
                Отсканируйте этот код камерой телефона
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="border-2 border-gray-300 rounded-lg bg-white p-2"
                  />
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>
                  Сессия:{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    {mobileSessionId}
                  </code>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={copyMobileLink}
                  variant="outline"
                  className="w-full"
                >
                  📋 Копировать ссылку
                </Button>

                <Button
                  onClick={() => setShowQR(false)}
                  variant="outline"
                  className="w-full"
                >
                  ❌ Закрыть
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Откройте камеру на телефоне</p>
                <p>• Наведите на QR-код</p>
                <p>• Нажмите на появившуюся ссылку</p>
                <p>• Или скопируйте ссылку и отправьте на телефон</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Face Scanner временно отключен.</p>
          <p>Используйте мобильное устройство для сканирования лица.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoadingModels && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative mb-4">
          <p className="font-medium">Загрузка моделей распознавания...</p>
          <p className="text-sm">
            Пожалуйста, подождите. Это может занять несколько секунд.
          </p>
        </div>
      )}

      {!faceapi && !isFaceScannerDisabled && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative mb-4">
          <p className="font-medium">Загрузка библиотеки распознавания...</p>
          <p className="text-sm">
            Инициализация системы распознавания лиц.
          </p>
        </div>
      )}

      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={detectFace}
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white p-4">
              <div className="text-6xl mb-4">📷</div>
              <p className="mb-4">
                Нажмите кнопку ниже, чтобы начать сканирование лица
              </p>
              <p className="text-sm opacity-75">
                Убедитесь, что ваше лицо хорошо освещено и находится в центре
                кадра
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

      <div className="space-y-3">
        {/* Основная кнопка сканирования */}
        {isScanning ? (
          <Button
            onClick={stopScanning}
            variant="destructive"
            disabled={isLoading}
            className="w-full"
          >
            Остановить сканирование
          </Button>
        ) : (
          <Button
            onClick={startScanning}
            disabled={isLoadingModels || !modelsLoaded || isLoading || !faceapi}
            className="w-full"
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

        {/* Альтернативные варианты входа */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Альтернативные способы
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={generateQRCode}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            📱 QR-код
          </Button>

          <Button
            onClick={handleMobileScanner}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            🔗 Прямая ссылка
          </Button>

          <Button
            onClick={handleTestLogin}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            🧪 Тест
          </Button>
        </div>
      </div>

      {/* QR-код модальное окно */}
      {showQR && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-blue-900">
              📱 QR-код для мобильного сканера
            </CardTitle>
            <CardDescription className="text-blue-700">
              Отсканируйте этот код камерой телефона для доступа к мобильному
              сканеру
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-200">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code для мобильного сканера"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>ID сессии:</strong>
              </p>
              <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">
                {mobileSessionId}
              </code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={copyMobileLink}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                📋 Копировать ссылку
              </Button>

              <Button
                onClick={() => setShowQR(false)}
                variant="outline"
                className="w-full border-gray-300"
              >
                ❌ Закрыть
              </Button>
            </div>

            <div className="bg-blue-100 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">
                📋 Инструкция:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Откройте камеру на мобильном телефоне</li>
                <li>Наведите камеру на QR-код</li>
                <li>Нажмите на появившуюся ссылку</li>
                <li>Или скопируйте ссылку и отправьте на телефон</li>
                <li>Разрешите доступ к камере на телефоне</li>
                <li>Начните сканирование лица</li>
              </ol>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
              <p>
                <strong>Совет:</strong> QR-код содержит уникальную ссылку на
                сессию сканирования. Каждый раз генерируется новая ссылка для
                безопасности.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информационные сообщения */}
      <div className="space-y-3">
        {faceDescriptors.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded">
            <p className="font-medium">Нет зарегистрированных лиц</p>
            <p className="text-sm">
              Обратитесь к администратору для регистрации вашего лица в системе.
            </p>
          </div>
        )}

        {faceDescriptors.length > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            <p className="font-medium">Система готова к работе</p>
            <p className="text-sm">
              Найдено {faceDescriptors.length} зарегистрированных лиц в базе
              данных.
            </p>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Для входа в систему необходимо, чтобы ваше лицо было
            зарегистрировано администратором.
          </p>
          <p className="mt-1">
            Если у вас нет камеры на компьютере, используйте QR-код для доступа
            к мобильному сканеру.
          </p>
        </div>
      </div>

      {/* Советы по использованию */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Способы входа:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-1">🖥️ Компьютер с камерой:</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Нажмите "Начать сканирование лица"</li>
              <li>Разрешите доступ к камере</li>
                            <li>Смотрите прямо в камеру</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-1">📱 Мобильный телефон:</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Нажмите "QR-код"</li>
              <li>Отсканируйте код телефоном</li>
              <li>Используйте мобильный сканер</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Статистика для отладки */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            🔧 Информация для разработчика:
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Клиент инициализирован: {isClient ? "✅" : "❌"}</p>
            <p>Face-API загружен: {faceapi ? "✅" : "❌"}</p>
            <p>Модели загружены: {modelsLoaded ? "✅" : "❌"}</p>
            <p>Сканирование активно: {isScanning ? "✅" : "❌"}</p>
            <p>Зарегистрированных лиц: {faceDescriptors.length}</p>
            <p>Face Scanner отключен: {isFaceScannerDisabled ? "✅" : "❌"}</p>
            <p>QR-код показан: {showQR ? "✅" : "❌"}</p>
            <p>Мобильная сессия: {mobileSessionId || "не создана"}</p>
            <p>Current URL: {currentUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}


