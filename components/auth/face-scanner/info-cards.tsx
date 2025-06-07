// components/auth/face-scanner/info-cards.tsx
"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { InfoCardsProps } from "./types";

export const InfoCards = memo(function InfoCards({ faceDescriptors }: InfoCardsProps) {
  return (
    <div className="space-y-3">
      {faceDescriptors.length === 0 ? (
        <NoFacesCard />
      ) : (
        <SystemReadyCard count={faceDescriptors.length} />
      )}
      <GeneralInfoCard />
    </div>
  );
});

const NoFacesCard = memo(function NoFacesCard() {
  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="font-medium text-orange-900">Нет зарегистрированных лиц</p>
            <p className="text-sm text-orange-800">
              Обратитесь к администратору для регистрации вашего лица в системе.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const SystemReadyCard = memo(function SystemReadyCard({ count }: { count: number }) {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">✅</div>
          <div>
            <p className="font-medium text-green-900">Система готова к работе</p>
            <p className="text-sm text-green-800">
              Найдено {count} зарегистрированных лиц в базе данных.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const GeneralInfoCard = memo(function GeneralInfoCard() {
  return (
    <div className="text-center text-sm text-muted-foreground bg-gray-50 rounded-lg p-3">
      <p>
        Для входа в систему необходимо, чтобы ваше лицо было
        зарегистрировано администратором.
      </p>
      <p className="mt-1">
        Если у вас нет камеры на компьютере, используйте QR-код для доступа
        к мобильному сканеру.
      </p>
    </div>
  );
});
