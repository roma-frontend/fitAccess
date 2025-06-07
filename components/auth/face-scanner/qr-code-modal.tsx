// components/auth/face-scanner/qr-code-modal.tsx
"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QRCodeModalProps } from "./types";

export const QRCodeModal = memo(function QRCodeModal({
  qrCodeUrl,
  sessionId,
  onCopyLink,
  onClose
}: QRCodeModalProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-blue-900">
          📱 QR-код для мобильного сканера
        </CardTitle>
        <CardDescription className="text-blue-700">
          Отсканируйте этот код камерой телефона для доступа к мобильному сканеру
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-200">
              <img
                src={qrCodeUrl}
                alt="QR Code для мобильного сканера"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>ID сессии:</strong>
          </p>
          <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">
            {sessionId}
          </code>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={onCopyLink}
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            📋 Копировать ссылку
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300"
          >
            ❌ Закрыть
          </Button>
        </div>

        <QRInstructions />
      </CardContent>
    </Card>
  );
});

const QRInstructions = memo(function QRInstructions() {
  return (
    <div className="bg-blue-100 rounded-lg p-4 text-left">
      <h4 className="font-semibold text-blue-900 mb-2">📋 Инструкция:</h4>
      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
        <li>Откройте камеру на мобильном телефоне</li>
        <li>Наведите камеру на QR-код</li>
        <li>Нажмите на появившуюся ссылку</li>
        <li>Или скопируйте ссылку и отправьте на телефон</li>
        <li>Разрешите доступ к камере на телефоне</li>
        <li>Начните сканирование лица</li>
      </ol>
    </div>
  );
});
