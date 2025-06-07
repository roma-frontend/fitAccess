// components/auth/face-scanner/alternative-options.tsx
"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { AlternativeOptionsProps } from "./types";

export const AlternativeOptions = memo(function AlternativeOptions({
  onTestLogin,
  onGenerateQR,
  onMobileScanner,
  isLoading
}: AlternativeOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Альтернативные способы
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={onGenerateQR}
          variant="outline"
          disabled={isLoading}
          className="w-full"
        >
          📱 QR-код
        </Button>

        <Button
          onClick={onMobileScanner}
          variant="outline"
          disabled={isLoading}
          className="w-full"
        >
          🔗 Прямая ссылка
        </Button>

        <Button
          onClick={onTestLogin}
          variant="outline"
          disabled={isLoading}
          className="w-full"
        >
          🧪 Тест
        </Button>
      </div>
    </div>
  );
});
