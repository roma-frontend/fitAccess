// components/auth/face-scanner/security-info.tsx
"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SecurityInfo = memo(function SecurityInfo() {
  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-purple-900 flex items-center space-x-2">
          <span>🔒</span>
          <span>Безопасность и конфиденциальность</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SecurityFeatures />
        <SecurityNote />
      </CardContent>
    </Card>
  );
});

const SecurityFeatures = memo(function SecurityFeatures() {
  return (
    <div className="text-sm text-purple-800 space-y-2">
      <p>• Ваши биометрические данные обрабатываются локально в браузере</p>
      <p>• Видеопоток не передается на сервер во время сканирования</p>
      <p>• QR-коды содержат только ссылки на сессии, не личные данные</p>
      <p>• Все сессии имеют ограниченное время жизни</p>
    </div>
  );
});

const SecurityNote = memo(function SecurityNote() {
  return (
    <div className="bg-purple-100 rounded p-3">
      <p className="text-xs text-purple-700">
        <strong>Примечание:</strong> Если у вас есть вопросы о безопасности или 
        конфиденциальности, обратитесь к администратору системы.
      </p>
    </div>
  );
});
