// components/profile/FaceIDSetup.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoScanner } from "@/components/auth/face-scanner/video-scanner";
import { Scan, CheckCircle, AlertCircle, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useApiRequest } from "@/hooks/useAuth";
import type { FaceDetectionData } from "@/components/auth/face-scanner/video-scanner";

interface FaceIdStatus {
  isEnabled: boolean;
  lastUsed?: string;
  dateRegistered?: string;
  deviceCount?: number;
}

export function FaceIDSetup() {
  const [faceData, setFaceData] = useState<FaceDetectionData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [faceIdStatus, setFaceIdStatus] = useState<FaceIdStatus>({
    isEnabled: false,
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { get, post } = useApiRequest();

  // Проверяем статус Face ID при загрузке
  useEffect(() => {
    if (user) {
      checkFaceIdStatus();
    }
  }, [user]);

  const checkFaceIdStatus = async () => {
    try {
      setIsLoading(true);
      const data = await get("/api/face-id/status");
      
      if (data.success) {
        setFaceIdStatus({
          isEnabled: data.isEnabled || false,
          lastUsed: data.lastUsed,
          dateRegistered: data.dateRegistered,
          deviceCount: data.deviceCount || 0,
        });
      }
    } catch (error) {
      console.error("❌ Ошибка проверки Face ID:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceDetected = (faceDetectionData: FaceDetectionData) => {
    setFaceData(faceDetectionData);
    toast({
      title: "✅ Лицо отсканировано",
      description: "Готово к регистрации Face ID",
    });
  };

  const handleRegisterFaceID = async () => {
    if (!faceData?.descriptor) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Сначала отсканируйте лицо",
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      const data = await post("/api/face-id/register", {
        faceDescriptor: faceData.descriptor,
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }
      });
      
      if (data.success) {
        setFaceIdStatus({
          isEnabled: true,
          dateRegistered: data.dateRegistered,
          deviceCount: data.deviceCount || 1,
        });
        
        toast({
          title: "✅ Face ID зарегистрирован",
          description: "Теперь вы можете входить через распознавание лица",
        });
        
        setFaceData(null); // Очищаем данные
      } else {
        throw new Error(data.error || "Ошибка регистрации");
      }
      
    } catch (error) {
      console.error("❌ Ошибка регистрации Face ID:", error);
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: "Попробуйте еще раз",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemoveFaceID = async () => {
    try {
      const data = await post("/api/face-id/disable", {});
      
      if (data.success) {
        setFaceIdStatus({
          isEnabled: false,
          lastUsed: undefined,
          dateRegistered: undefined,
          deviceCount: 0,
        });
        
        setFaceData(null);
        
        toast({
          title: "🗑️ Face ID удален",
          description: "Биометрические данные удалены из системы",
        });
      } else {
        throw new Error(data.error || "Ошибка удаления");
      }
    } catch (error) {
      console.error("❌ Ошибка удаления Face ID:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить Face ID",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка настроек Face ID...</p>
        </CardContent>
      </Card>
    );
  }

  if (faceIdStatus.isEnabled) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>Face ID настроен</span>
          </CardTitle>
          <CardDescription className="text-green-600">
            Вы можете входить в систему через распознавание лица
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-green-100 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Face ID активен</p>
              <p className="text-sm text-green-600">Биометрические данные сохранены</p>
            </div>
          </div>
          
          {/* Информация */}
          <div className="space-y-2 text-sm text-green-700">
            {faceIdStatus.dateRegistered && (
              <div className="flex justify-between">
                <span>Настроен:</span>
                <span className="font-medium">
                  {new Date(faceIdStatus.dateRegistered).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
            {faceIdStatus.lastUsed && (
              <div className="flex justify-between">
                <span>Последний вход:</span>
                <span className="font-medium">
                  {new Date(faceIdStatus.lastUsed).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
            {faceIdStatus.deviceCount !== undefined && faceIdStatus.deviceCount > 0 && (
              <div className="flex justify-between">
                <span>Устройств:</span>
                <span className="font-medium">{faceIdStatus.deviceCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => window.open('/auth/face-auth?mode=test', '_blank')}
              className="bg-green-600 hover:bg-green-700"
            >
              Протестировать вход
            </Button>
            <Button
              onClick={handleRemoveFaceID}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить Face ID
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scan className="h-5 w-5" />
          <span>Настройка Face ID</span>
        </CardTitle>
        <CardDescription>
          Настройте вход по лицу для быстрого и безопасного доступа
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Status */}
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${
          faceData 
            ? 'bg-green-50 text-green-800' 
            : 'bg-blue-50 text-blue-800'
        }`}>
          {faceData ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-blue-600" />
          )}
          <div>
            <p className="font-medium">
              {faceData ? 'Лицо успешно отсканировано' : 'Отсканируйте лицо для настройки'}
            </p>
            {faceData && (
              <p className="text-sm opacity-75">
                Дескриптор готов к сохранению
              </p>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div>
          <VideoScanner 
            onFaceDetected={handleFaceDetected}
            className="w-full max-w-md mx-auto"
          />
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleRegisterFaceID}
          disabled={!faceData?.descriptor || isRegistering}
          className="w-full"
          size="lg"
        >
          {isRegistering ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Настройка Face ID...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>Настроить Face ID</span>
            </div>
          )}
        </Button>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Инструкции:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Поместите лицо в центр кадра</li>
            <li>• Убедитесь в хорошем освещении</li>
            <li>• Дождитесь зеленой рамки</li>
            <li>• Нажмите "Настроить Face ID"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
