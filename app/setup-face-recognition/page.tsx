// app/setup-face-recognition/page.tsx (новый файл)
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Save, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SetupFaceRecognitionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [saved, setSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (!data.authenticated) {
        window.location.href = "/member-login";
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Ошибка проверки аутентификации:", error);
    }
  };

  const startCamera = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось получить доступ к камере",
      });
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Захватываем кадр
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // Получаем данные изображения
        const imageData = canvas.toDataURL("image/jpeg", 0.8);

        // Отправляем на сервер для создания дескриптора
        const response = await fetch("/api/auth/setup-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setFaceDescriptor(data.descriptor);
          toast({
            title: "Успешно!",
            description: "Лицо успешно распознано и обработано",
          });
        } else {
          throw new Error(data.error || "Ошибка обработки лица");
        }
      }
    } catch (error) {
      console.error("Ошибка захвата лица:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Ошибка обработки лица",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFaceDescriptor = async () => {
    if (!faceDescriptor || !user) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/save-face-descriptor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          faceDescriptor,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaved(true);
        toast({
          title: "Сохранено!",
          description: "Распознавание лиц настроено успешно",
        });
      } else {
        throw new Error(data.error || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Ошибка сохранения",
      });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Настройка распознавания лиц</CardTitle>
              <CardDescription>
                Настройте вход по лицу для быстрого доступа к системе
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {saved && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Настройка завершена!
                    </p>
                    <p className="text-sm text-green-700">
                      Теперь вы можете использовать вход по лицу
                    </p>
                  </div>
                </div>
              )}

              {!cameraActive && !saved && (
                <div className="text-center">
                  <Button onClick={startCamera} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Подключаем камеру...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Включить камеру
                      </>
                    )}
                  </Button>
                </div>
              )}

              {cameraActive && (
                <div className="space-y-4">
                  <div className="relative mx-auto w-fit">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="rounded-lg border-2 border-gray-300"
                      style={{ maxWidth: "400px", width: "100%" }}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="text-center space-y-4">
                    <div className="flex gap-2 justify-center">
                      <Button onClick={captureFace} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Обрабатываем...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Захватить лицо
                          </>
                        )}
                      </Button>

                      <Button onClick={stopCamera} variant="outline">
                        Остановить
                      </Button>
                    </div>

                    {faceDescriptor && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium">
                            ✅ Лицо успешно обработано!
                          </p>
                          <p className="text-sm text-green-700">
                            Дескриптор создан ({faceDescriptor.length} точек)
                          </p>
                        </div>

                        <Button onClick={saveFaceDescriptor} disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Сохраняем...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Сохранить настройки
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Инструкции */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📋 Инструкции:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>
                    1. Включите камеру и убедитесь что ваше лицо хорошо видно
                  </li>
                  <li>2. Расположите лицо по центру кадра</li>
                  <li>3. Нажмите "Захватить лицо" для создания дескриптора</li>
                  <li>4. Сохраните настройки для активации входа по лицу</li>
                </ol>
              </div>

              {/* Навигация */}
              <div className="flex gap-4 justify-center pt-4">
                <a
                  href="/member-dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  ← Вернуться в кабинет
                </a>
                {saved && (
                  <a
                    href="/face-login"
                    className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
                  >
                    Тест входа по лицу
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}