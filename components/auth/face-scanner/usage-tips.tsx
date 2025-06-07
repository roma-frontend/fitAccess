// components/auth/face-scanner/usage-tips.tsx
"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UsageTips = memo(function UsageTips() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
          <span>💡</span>
          <span>Способы входа</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <DesktopInstructions />
          <MobileInstructions />
        </div>
        <RecommendationBox />
      </CardContent>
    </Card>
  );
});

const DesktopInstructions = memo(function DesktopInstructions() {
  return (
    <div className="space-y-3">
      <h5 className="font-medium text-blue-900 flex items-center space-x-2">
        <span>🖥️</span>
        <span>Компьютер с камерой:</span>
      </h5>
      <ul className="space-y-2 list-none">
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">1.</span>
          <span>Нажмите "Начать сканирование лица"</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">2.</span>
          <span>Разрешите доступ к камере</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">3.</span>
          <span>Смотрите прямо в камеру</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">4.</span>
          <span>Дождитесь распознавания</span>
        </li>
      </ul>
    </div>
  );
});

const MobileInstructions = memo(function MobileInstructions() {
  return (
    <div className="space-y-3">
      <h5 className="font-medium text-blue-900 flex items-center space-x-2">
        <span>📱</span>
        <span>Мобильный телефон:</span>
      </h5>
      <ul className="space-y-2 list-none">
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">1.</span>
          <span>Нажмите "QR-код"</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">2.</span>
          <span>Отсканируйте код телефоном</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">3.</span>
          <span>Используйте мобильный сканер</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-blue-600">4.</span>
          <span>Разрешите доступ к камере</span>
        </li>
      </ul>
    </div>
  );
});

const RecommendationBox = memo(function RecommendationBox() {
  return (
    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
      <p className="text-xs text-blue-700">
        <strong>Рекомендация:</strong> Для лучшего качества распознавания используйте хорошее освещение 
        и держите лицо на расстоянии 30-60 см от камеры.
      </p>
    </div>
  );
});
