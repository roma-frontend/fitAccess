// components/auth/mobile-face-scanner.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MobileFaceScanner() {
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const mobileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile-scanner/${sessionId}`;

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(mobileUrl);
      alert("Ссылка скопирована в буфер обмена!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Сканирование с телефона</h3>
        <div className="bg-gray-100 p-8 rounded-lg inline-block border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📱</div>
          <p className="text-sm text-gray-600">QR-код будет здесь</p>
          <p className="text-xs text-gray-500 mt-2">
            (Временно используйте ссылку ниже)
          </p>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Используйте ссылку ниже для доступа с телефона
        </p>
      </div>

      <div className="text-center space-y-2">
        <div className="bg-gray-50 p-2 rounded text-xs break-all max-w-md mx-auto">
          {mobileUrl}
        </div>
        
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => window.open(mobileUrl, '_blank')}
            variant="outline"
          >
            Открыть ссылку
          </Button>
          
          <Button
            onClick={copyToClipboard}
            variant="outline"
          >
            Копировать ссылку
          </Button>
        </div>
      </div>
    </div>
  );
}
