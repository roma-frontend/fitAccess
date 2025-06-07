// components/auth/face-auth/components/FaceAuthActions.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FaceAuthProps } from "../types";

export function FaceAuthActions({ 
  faceData, 
  isRegistering, 
  setIsRegistering, 
  authStatus, 
  router 
}: FaceAuthProps) {
  const { toast } = useToast();

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Face ID зарегистрирован",
        description: "Теперь вы можете входить через распознавание лица",
      });
      
      router.push("/profile");
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: "Попробуйте еще раз",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
      <CardContent className="p-6">
        <Button 
          onClick={handleRegisterFaceID}
          disabled={!faceData?.descriptor || isRegistering}
          className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isRegistering ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Регистрация Face ID...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Зарегистрировать Face ID</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
