// components/auth/face-scanner/hooks/use-qr-code.ts
"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import type { UseQRCodeReturn } from "../types";

export function useQRCode(): UseQRCodeReturn {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [mobileSessionId, setMobileSessionId] = useState("");
  const { toast } = useToast();

  const generateQRCode = useCallback(async (baseUrl: string) => {
    try {
      const sessionId = Math.random().toString(36).substr(2, 9);
      setMobileSessionId(sessionId);

      const mobileUrl = `${baseUrl}/mobile-scanner/${sessionId}`;
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

      toast({
        title: "QR-код сгенерирован",
        description: "Отсканируйте QR-код на мобильном устройстве",
      });

      return { qrDataUrl, sessionId };
    } catch (error) {
      console.error("Ошибка генерации QR-кода:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сгенерировать QR-код",
      });
      return null;
    }
  }, [toast]);

  const copyMobileLink = useCallback(async (baseUrl: string) => {
    if (!mobileSessionId) return;

    try {
      const mobileUrl = `${baseUrl}/mobile-scanner/${mobileSessionId}`;
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
  }, [mobileSessionId, toast]);

  return {
    qrCodeUrl,
    mobileSessionId,
    generateQRCode,
    copyMobileLink
  };
}
