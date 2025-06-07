"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { VideoScanner, type FaceDetectionData } from "./face-scanner/video-scanner"; // ✅ Импортируем тип
import { AlternativeOptions } from "./face-scanner/alternative-options";
import { QRCodeModal } from "./face-scanner/qr-code-modal";
import { InfoCards } from "./face-scanner/info-cards";
import { UsageTips } from "./face-scanner/usage-tips";
import { DebugInfo } from "./face-scanner/debug-info";
import { SecurityInfo } from "./face-scanner/security-info";
import { LoadingIndicators } from "./face-scanner/loading-indicators";
import { useQRCode } from "./face-scanner/hooks/use-qr-code";
import type { FaceDescriptor } from "./face-scanner/types";

export function FaceScanner() {
  const { toast } = useToast();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // ✅ Современный синтаксис Convex - используем ?? вместо ||
  const faceDescriptors = useQuery(api.users.getAllFaceDescriptors) ?? [];

  const isFaceScannerDisabled = process.env.NEXT_PUBLIC_DISABLE_FACE_SCANNER === "true";
  const { qrCodeUrl, mobileSessionId, generateQRCode, copyMobileLink } = useQRCode();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  const handleTestLogin = async () => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });

      if (response.ok) {
        try {
          await fetch("/api/access-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: errorData.error || "Не удалось выполнить вход",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!isClient) return;
    const result = await generateQRCode(currentUrl);
    if (result) setShowQR(true);
  };

  const handleMobileScanner = () => {
    if (!isClient) return;
    const sessionId = Math.random().toString(36).substr(2, 9);
    const mobileUrl = `${currentUrl}/mobile-scanner/${sessionId}`;
    const newWindow = window.open(mobileUrl, "_blank");
    if (!newWindow) router.push(`/mobile-scanner/${sessionId}`);
  };

  const handleCopyLink = () => {
    copyMobileLink(currentUrl);
  };

  // ✅ Исправленный обработчик - FaceDetectionData не имеет landmarks
  const handleFaceDetected = (faceData: FaceDetectionData) => {
  console.log("✅ Лицо полностью распознано:", {
    hasDetection: !!faceData.detection,
    hasLandmarks: !!faceData.landmarks,
    hasDescriptor: !!faceData.descriptor,
    descriptorLength: faceData.descriptor?.length,
    boundingBox: faceData.box
  });
  
  toast({
    title: "🎯 Лицо распознано",
    description: `Получены: детекция${faceData.landmarks ? ', landmarks' : ''}${faceData.descriptor ? ', дескриптор' : ''}`,
  });

    // TODO: Здесь можно добавить логику сравнения с существующими дескрипторами
    // Например, найти совпадение в faceDescriptors и выполнить вход
    
    // Пример логики распознавания (можно расширить)
    // const matchedUser = findMatchingUser(faceData, faceDescriptors);
    // if (matchedUser) {
    //   handleUserLogin(matchedUser);
    // }
  };

  // ✅ Функция-заглушка для отключенного сканера
  const handleDisabledFaceDetected = (faceData: FaceDetectionData) => {
    console.log("⚠️ Face Scanner отключен, но данные получены:", {
      hasDetection: !!faceData.detection
    });
    
    toast({
      variant: "destructive",
      title: "Сканер отключен",
      description: "Face Scanner недоступен в данный момент",
    });
  };

  if (!isClient) {
    return <LoadingIndicators type="initialization" />;
  }

  if (isFaceScannerDisabled) {
    return (
      <div className="space-y-6">
        {/* ✅ Передаем правильный обработчик для отключенного состояния */}
        <VideoScanner 
          disabled={true}
          onFaceDetected={handleDisabledFaceDetected}
        />
        <AlternativeOptions
          onTestLogin={handleTestLogin}
          onGenerateQR={handleGenerateQR}
          onMobileScanner={handleMobileScanner}
          isLoading={isLoading}
        />
        {showQR && (
          <QRCodeModal
            qrCodeUrl={qrCodeUrl}
            sessionId={mobileSessionId}
            onCopyLink={handleCopyLink}
            onClose={() => setShowQR(false)}
          />
        )}
        <InfoCards faceDescriptors={faceDescriptors} />
        <UsageTips />
        <SecurityInfo />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Передаем правильный обработчик для активного состояния */}
      <VideoScanner 
        onFaceDetected={handleFaceDetected}
      />
      <AlternativeOptions
        onTestLogin={handleTestLogin}
        onGenerateQR={handleGenerateQR}
        onMobileScanner={handleMobileScanner}
        isLoading={isLoading}
      />
      {showQR && (
        <QRCodeModal
          qrCodeUrl={qrCodeUrl}
          sessionId={mobileSessionId}
          onCopyLink={handleCopyLink}
          onClose={() => setShowQR(false)}
        />
      )}
      <InfoCards faceDescriptors={faceDescriptors} />
      <UsageTips />
      {process.env.NODE_ENV === "development" && (
        <DebugInfo
          isClient={isClient}
          faceapi={null}
          modelsLoaded={false}
          isScanning={false}
          isFaceScannerDisabled={isFaceScannerDisabled}
          showQR={showQR}
          isLoading={isLoading}
          faceDescriptorsCount={faceDescriptors.length}
          mobileSessionId={mobileSessionId}
          currentUrl={currentUrl}
        />
      )}
      <SecurityInfo />
    </div>
  );
}
