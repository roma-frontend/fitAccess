// app/test-qr-codes/page.tsx (новый файл)
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeData {
  name: string;
  email: string;
  role: string;
  qrData: string;
  qrUrl: string;
}

export default function TestQRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      const response = await fetch('/api/generate-test-qr');
      const data = await response.json();
      
      if (data.success) {
        setQrCodes(data.qrCodes);
      }
    } catch (error) {
      console.error('Ошибка загрузки QR-кодов:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyQRData = (qrData: string, name: string) => {
    navigator.clipboard.writeText(qrData);
    toast({
      title: "Скопировано!",
      description: `QR-данные для ${name} скопированы`,
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-blue-100 text-blue-800',
      'trainer': 'bg-green-100 text-green-800',
      'staff': 'bg-gray-100 text-gray-800',
      'member': 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Загрузка QR-кодов...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📱 Тестовые QR-коды для входа
          </h1>
          <p className="text-gray-600">
            QR-коды всех пользователей системы для тестирования
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{qr.name}</h3>
                  {getRoleBadge(qr.role)}
                </div>
                <p className="text-sm text-gray-600">{qr.email}</p>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                
                {/* QR-код */}
                <div className="mx-auto w-fit p-2 bg-white border rounded">
                  <img 
                    src={qr.qrUrl} 
                    alt={`QR код для ${qr.name}`}
                    className="w-32 h-32"
                  />
                </div>

                {/* Данные QR-кода */}
                <div className="p-2 bg-gray-50 border rounded text-xs">
                  <code>{qr.qrData}</code>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyQRData(qr.qrData, qr.name)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Копировать
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qr.qrUrl;
                      link.download = `qr-${qr.name.replace(/\s+/g, '-')}.png`;
                      link.click();
                    }}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Скачать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Инструкции */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Как использовать тестовые QR-коды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Способ 1: Копирование данных</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Нажмите "Копировать" под нужным QR-кодом</li>
                  <li>2. Перейдите на страницу <a href="/face-login" className="text-blue-600 underline">/face-login</a></li>
                  <li>3. Выберите вкладку "QR-код"</li>
                  <li>4. Вставьте скопированные данные</li>
                  <li>5. Нажмите "Войти по QR-коду"</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Способ 2: Сканирование</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Скачайте нужный QR-код</li>
                  <li>2. Откройте на телефоне или втором экране</li>
                  <li>3. Перейдите на <a href="/face-login" className="text-blue-600 underline">/face-login</a></li>
                  <li>4. Выберите "QR-код" → "Включить сканер"</li>
                  <li>5. Наведите камеру на QR-код</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Навигация */}
        <div className="text-center mt-8 space-x-4">
          <a 
            href="/face-login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            🤖 Тест умного входа
          </a>
          <a 
            href="/"
            className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            ← На главную
          </a>
        </div>
      </div>
    </div>
  );
}
