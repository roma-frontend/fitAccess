// app/face-login/page.tsx
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  QrCode,
  Mail,
  User,
  Scan,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import QRScanner from "@/components/QRScanner"; // Правильный импорт

export default function FaceLoginPage() {
  const [activeMethod, setActiveMethod] = useState<"email" | "face" | "qr">(
    "email"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Face recognition
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // QR Code
  const [qrData, setQrData] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (activeMethod === "face") {
      loadFaceApi();
    }
  }, [activeMethod]);

  const loadFaceApi = async () => {
    try {
      // Загружаем face-api.js (добавьте в public или установите через npm)
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
      script.onload = async () => {
        // @ts-ignore
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        // @ts-ignore
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        // @ts-ignore
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        setFaceApiLoaded(true);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Ошибка загрузки face-api:", error);
      setError("Ошибка загрузки системы распознавания лиц");
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
      setError("Не удалось получить доступ к камере");
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

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current || !faceApiLoaded) return;

    setLoading(true);
    setError("");

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

        // Отправляем на сервер для распознавания
        const response = await fetch("/api/auth/face-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess(`Добро пожаловать, ${data.user.name}!`);
          toast({
            title: "Успешный вход!",
            description: `Добро пожаловать, ${data.user.name}`,
          });

          // Перенаправляем в зависимости от роли
          setTimeout(() => {
            const redirectUrl =
              data.user.role === "member" ? "/member-dashboard" : "/admin";
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          throw new Error(data.error || "Лицо не распознано");
        }
      }
    } catch (error) {
      console.error("Ошибка распознавания:", error);
      setError(
        error instanceof Error ? error.message : "Ошибка распознавания лица"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Определяем API endpoint на основе email
      const isStaff =
        formData.email.includes("@fitclub.com") ||
        formData.email === "romangulanyan@gmail.com";

      const endpoint = isStaff
        ? "/api/auth/staff-login"
        : "/api/auth/member-login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Добро пожаловать, ${data.user.name}!`);
        toast({
          title: "Успешный вход!",
          description: `Добро пожаловать, ${data.user.name}`,
        });

        setTimeout(() => {
          const redirectUrl =
            data.user.role === "member" ? "/member-dashboard" : "/admin";
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        throw new Error(data.error || "Ошибка входа");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleQrLogin = async () => {
    if (!qrData.trim()) {
      setError("Введите данные QR-кода");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/qr-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Добро пожаловать, ${data.user.name}!`);
        toast({
          title: "Успешный вход!",
          description: `Добро пожаловать, ${data.user.name}`,
        });

        setTimeout(() => {
          const redirectUrl =
            data.user.role === "member" ? "/member-dashboard" : "/admin";
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        throw new Error(data.error || "QR-код не распознан");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ошибка входа по QR-коду"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scan className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Умный вход в FitAccess
          </CardTitle>
          <CardDescription className="text-base">
            Выберите удобный способ входа в систему
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Методы входа */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <Button
              variant={activeMethod === "email" ? "default" : "outline"}
              onClick={() => {
                setActiveMethod("email");
                stopCamera();
                setError("");
                setSuccess("");
              }}
              className="flex flex-col h-16"
            >
              <Mail className="h-5 w-5 mb-1" />
              <span className="text-xs">Email</span>
            </Button>

            <Button
              variant={activeMethod === "face" ? "default" : "outline"}
              onClick={() => {
                setActiveMethod("face");
                setError("");
                setSuccess("");
              }}
              className="flex flex-col h-16"
            >
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-xs">Лицо</span>
            </Button>

            <Button
              variant={activeMethod === "qr" ? "default" : "outline"}
              onClick={() => {
                setActiveMethod("qr");
                stopCamera();
                setError("");
                setSuccess("");
              }}
              className="flex flex-col h-16"
            >
                            <QrCode className="h-5 w-5 mb-1" />
              <span className="text-xs">QR-код</span>
            </Button>
          </div>

          {/* Сообщения */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* Email вход */}
          {activeMethod === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  required
                  className="h-11"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Введите пароль"
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Входим...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          )}

          {/* Face recognition */}
          {activeMethod === "face" && (
            <div className="space-y-4">
              <div className="text-center">
                {!faceApiLoaded && (
                  <p className="text-sm text-gray-600 mb-4">
                    Загружаем систему распознавания лиц...
                  </p>
                )}

                {faceApiLoaded && !cameraActive && (
                  <Button onClick={startCamera} className="mb-4">
                    <Camera className="h-4 w-4 mr-2" />
                    Включить камеру
                  </Button>
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

                    <div className="flex gap-2 justify-center">
                      <Button onClick={captureAndRecognize} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Распознаем...
                          </>
                        ) : (
                          <>
                            <Scan className="h-4 w-4 mr-2" />
                            Распознать лицо
                          </>
                        )}
                      </Button>

                      <Button onClick={stopCamera} variant="outline">
                        Остановить
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Code */}
          {activeMethod === "qr" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR-код данные
                </label>
                <Input
                  type="text"
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="Отсканируйте QR-код или введите данные"
                  className="h-11"
                />
              </div>

              {/* QR Scanner */}
              <div className="border-t border-gray-200 pt-4">
                <QRScanner
                  onScan={(data) => {
                    setQrData(data);
                    toast({
                      title: "QR-код отсканирован!",
                      description: "Данные автоматически заполнены",
                    });
                  }}
                  onError={(error) => {
                    setError(error);
                  }}
                />
              </div>

              <Button
                onClick={handleQrLogin}
                className="w-full h-11"
                disabled={loading || !qrData.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Проверяем...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Войти по QR-коду
                  </>
                )}
              </Button>

              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Как получить QR-код:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Войдите в личный кабинет через email</li>
                  <li>• Перейдите в раздел "QR-код"</li>
                  <li>
                    • Используйте сгенерированный QR-код для быстрого входа
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Альтернативные варианты */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-xs text-gray-500">Другие варианты входа</p>
              <div className="flex gap-2 justify-center">
                <a
                  href="/member-login"
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Обычный вход участника
                </a>
                <a
                  href="/staff-login"
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Обычный вход персонала
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

