// components/auth/face-auth/components/FaceAuthMobileActions.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FaceAuthProps } from "../types";

export function FaceAuthMobileActions({ sessionId, onSwitchMode }: FaceAuthProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleShareMobileLink}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Поделиться
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleCopyMobileLink}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Copy className="h-4 w-4 mr-2" />
          Копировать
        </Button>
      </div>

      <Button 
        variant="ghost" 
        onClick={() => onSwitchMode('desktop')}
        className="w-full text-gray-700 hover:bg-gray-100"
      >
        <Monitor className="h-4 w-4 mr-2" />
        Переключить на десктоп
      </Button>
    </motion.div>
  );
}
