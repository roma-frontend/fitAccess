// app/qr-code/page.tsx (новый файл)
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QrCodePage() {
  const [user, setUser] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndGenerateQR();
  }, []);

  const checkAuthAndGenerateQR = async () => {
    try {
      // Проверяем аутентификацию
      const authResponse = await fetch("/api/auth/check");
      const authData = await authResponse.json();

      if (!authData.authenticated) {
        window.location.href = "/member-login";
        return;
      }

      setUser(authData.user);

      // Генерируем QR-код
      await generateQRCode(authData.user);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (userData: any) => {
    try {
      // Создаем данные для QR-кода
      const qrData = `fitaccess:${userData.userId}`;

      // Используем API для генерации QR-кода (можно использовать qrcode библиотеку)
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrApiUrl);
    } catch (error) {
      console.error("Ошибка генерации QR-кода:", error);
    }
  };

  const copyQRData = () => {
    const qrData = `fitaccess:${user.userId}`;
    navigator.clipboard.writeText(qrData);
    toast({
      title: "Скопировано!",
      description: "Данные QR-кода скопированы в буфер обмена",
    });
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `fitaccess-qr-${user.name}.png`;
    link.click();
  };

  if (process.env.NODE_ENV !== 'development') {

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Ваш QR-код для входа</CardTitle>
              <CardDescription>
                Используйте этот QR-код для быстрого входа в систему
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              {/* Информация о пользователе */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Информация об аккаунте
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Имя:</strong> {user?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>Роль:</strong> {user?.role}
                  </p>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="space-y-4">
                  <div className="mx-auto w-fit p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto"
                      style={{ width: "300px", height: "300px" }}
                    />
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={copyQRData} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Копировать данные
                    </Button>
                    <Button onClick={downloadQR}>
                      <Download className="h-4 w-4 mr-2" />
                      Скачать QR-код
                    </Button>
                  </div>
                </div>
              )}

              {/* Инструкции */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <h4 className="font-medium text-yellow-800 mb-2">
                  📱 Как использовать QR-код:
                </h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Сохраните QR-код на телефон или распечатайте</li>
                  <li>2. На странице входа выберите "QR-код"</li>
                  <li>3. Отсканируйте код или введите данные вручную</li>
                  <li>4. Мгновенный вход без ввода пароля!</li>
                </ol>
              </div>

              {/* Данные QR-кода */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  🔢 Данные QR-кода:
                </h4>
                <code className="text-sm bg-white p-2 rounded border block">
                  fitaccess:{user?.userId}
                </code>
                <p className="text-xs text-gray-600 mt-2">
                  Эти данные можно ввести вручную при входе по QR-коду
                </p>
              </div>

              {/* Навигация */}
              <div className="flex gap-4 justify-center pt-4">
                <a
                  href="/member-dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  ← Вернуться в кабинет
                </a>
                <a
                  href="/face-login"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Тест умного входа
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}