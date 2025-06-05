"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffSecurityInfo = memo(function StaffSecurityInfo() {
  const securityFeatures = [
    "🔐 Повышенные требования к паролям",
    "📧 Обязательная проверка email адресов",
    "🔍 Логирование всех действий",
    "⚠️ Автоматическая блокировка при подозрительной активности",
    "🔄 Безопасное восстановление пароля"
  ];

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-sm text-red-900">
          🛡️ Безопасность персонала
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-red-800 space-y-2">
        {securityFeatures.map((feature, index) => (
          <p key={index}>{feature}</p>
        ))}
      </CardContent>
    </Card>
  );
});
