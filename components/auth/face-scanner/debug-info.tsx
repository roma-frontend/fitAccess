// components/auth/face-scanner/debug-info.tsx
"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebugInfoProps {
  isClient: boolean;
  faceapi: any;
  modelsLoaded: boolean;
  isScanning: boolean;
  isFaceScannerDisabled: boolean;
  showQR: boolean;
  isLoading: boolean;
  faceDescriptorsCount: number;
  mobileSessionId: string;
  currentUrl: string;
}

export const DebugInfo = memo(function DebugInfo({
  isClient,
  faceapi,
  modelsLoaded,
  isScanning,
  isFaceScannerDisabled,
  showQR,
  isLoading,
  faceDescriptorsCount,
  mobileSessionId,
  currentUrl
}: DebugInfoProps) {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
          <span>🔧</span>
          <span>Информация для разработчика</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <SystemStatus 
            isClient={isClient}
            faceapi={faceapi}
            modelsLoaded={modelsLoaded}
            isScanning={isScanning}
          />
          <Settings 
            isFaceScannerDisabled={isFaceScannerDisabled}
            showQR={showQR}
            isLoading={isLoading}
          />
          <DataInfo 
            faceDescriptorsCount={faceDescriptorsCount}
            mobileSessionId={mobileSessionId}
            currentUrl={currentUrl}
          />
        </div>
        <TechnicalInfo />
      </CardContent>
    </Card>
  );
});

const SystemStatus = memo(function SystemStatus({ isClient, faceapi, modelsLoaded, isScanning }: any) {
  return (
    <div className="space-y-2">
      <h6 className="font-medium text-gray-700">Состояние системы:</h6>
      <div className="space-y-1 text-xs">
        <StatusItem label="Клиент" status={isClient} />
        <StatusItem label="Face-API" status={!!faceapi} />
        <StatusItem label="Модели" status={modelsLoaded} />
        <StatusItem label="Сканирование" status={isScanning} />
      </div>
    </div>
  );
});

const Settings = memo(function Settings({ isFaceScannerDisabled, showQR, isLoading }: any) {
  return (
    <div className="space-y-2">
      <h6 className="font-medium text-gray-700">Настройки:</h6>
      <div className="space-y-1 text-xs">
        <StatusItem label="Отключен" status={isFaceScannerDisabled} />
        <StatusItem label="QR показан" status={showQR} />
        <StatusItem label="Загрузка" status={isLoading} />
      </div>
    </div>
  );
});

const DataInfo = memo(function DataInfo({ faceDescriptorsCount, mobileSessionId, currentUrl }: any) {
  return (
    <div className="space-y-2">
      <h6 className="font-medium text-gray-700">Данные:</h6>
      <div className="space-y-1 text-xs">
        <div>
          <span>Лица: </span>
          <span className="font-mono">{faceDescriptorsCount}</span>
        </div>
        <div>
          <span>Сессия: </span>
          <span className="font-mono text-xs">
            {mobileSessionId || "не создана"}
          </span>
        </div>
        <div>
          <span>URL: </span>
          <span className="font-mono text-xs truncate">
            {currentUrl}
          </span>
        </div>
      </div>
    </div>
  );
});

const StatusItem = memo(function StatusItem({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span className={status ? "text-green-600" : "text-red-600"}>
        {status ? "✅" : "❌"}
      </span>
    </div>
  );
});

const TechnicalInfo = memo(function TechnicalInfo() {
  const isClient = typeof window !== 'undefined';
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h6 className="font-medium text-gray-700 mb-2">Техническая информация:</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <p><strong>User Agent:</strong></p>
          <p className="font-mono text-xs text-gray-600 break-all">
                        {isClient ? navigator.userAgent.substring(0, 100) + "..." : "Недоступно"}
          </p>
        </div>
        <div>
          <p><strong>Поддержка камеры:</strong></p>
          <p className="text-gray-600">
            {isClient && navigator.mediaDevices ? "Поддерживается" : "Не поддерживается"}
          </p>
          <p><strong>WebRTC:</strong></p>
          <p className="text-gray-600">
            {typeof RTCPeerConnection !== 'undefined' ? "Поддерживается" : "Не поддерживается"}
          </p>
        </div>
      </div>
    </div>
  );
});

