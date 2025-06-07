// components/auth/face-auth/components/FaceAuthSidebar.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Share2, 
  Copy, 
  Mail, 
  UserPlus, 
  Sparkles, 
  Zap, 
  Shield, 
  Eye, 
  Globe,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FaceAuthProps } from "../types";

export function FaceAuthSidebar({ 
  mode, 
  authStatus, 
  router, 
  sessionId, 
  onSwitchMode 
}: FaceAuthProps) {
  const { toast } = useToast();

  const handleCopyMobileLink = async () => {
    const mobileUrl = `${window.location.origin}/auth/face-auth?mobile=true&session=${sessionId}`;
    await navigator.clipboard.writeText(mobileUrl);
    toast({
      title: "Ссылка скопирована",
      description: "Откройте ссылку на мобильном устройстве",
    });
  };

  const handleShareMobileLink = async () => {
    const mobileUrl = `${window.location.origin}/auth/face-auth?mobile=true&session=${sessionId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Face Auth - Mobile Scanner',
          text: 'Откройте ссылку для сканирования лица',
          url: mobileUrl,
        });
      } catch (error) {
        handleCopyMobileLink();
      }
    } else {
      handleCopyMobileLink();
    }
  };

  return (
    <>
      {/* Mobile Scanner Options */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Smartphone className="h-5 w-5" />
              <span>Мобильное сканирование</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Используйте телефон для сканирования
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onSwitchMode('mobile')}
              variant="outline" 
              className="w-full justify-start bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Переключить на мобильный
            </Button>
            
            <Button 
              onClick={handleShareMobileLink}
              variant="outline" 
              className="w-full justify-start bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться ссылкой
            </Button>
            
            <Button 
              onClick={handleCopyMobileLink}
              variant="outline" 
              className="w-full justify-start bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Скопировать ссылку
            </Button>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Session ID:</strong> <code className="bg-blue-100 px-1 rounded">{sessionId}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alternative Login Methods */}
      {mode === 'login' && !authStatus?.authenticated && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Mail className="h-5 w-5" />
                <span>Альтернативные способы</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Другие методы входа в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/member-login')}
                variant="outline" 
                className="w-full justify-start bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email / Пароль
              </Button>
              
              <Button 
                onClick={() => router.push('/register')}
                variant="outline" 
                className="w-full justify-start bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Создать аккаунт
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features Card */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Sparkles className="h-5 w-5" />
              <span>Преимущества</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Мгновенный доступ</h4>
                <p className="text-sm text-gray-600">Вход за 2 секунды</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Максимальная безопасность</h4>
                <p className="text-sm text-gray-600">Биометрическая защита</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Полная приватность</h4>
                <p className="text-sm text-gray-600">Данные не покидают устройство</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Универсальность</h4>
                <p className="text-sm text-gray-600">Работает на всех устройствах</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions Card */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Target className="h-5 w-5" />
              <span>Инструкции</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm text-gray-700">Поместите лицо в центр кадра</p>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm text-gray-700">Убедитесь в хорошем освещении</p>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm text-gray-700">Держите голову прямо</p>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm text-gray-700">Дождитесь зеленой рамки</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Shield className="h-5 w-5" />
              <span>Безопасность</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-green-700">
              <p className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Данные шифруются локально
              </p>
              <p className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Изображения не сохраняются
              </p>
              <p className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Соответствует GDPR
              </p>
              <p className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Обработка в реальном времени
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
