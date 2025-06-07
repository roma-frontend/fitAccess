// components/auth/face-auth/components/FaceAuthStatus.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { FaceAuthProps } from "../types";

export function FaceAuthStatus({ faceData }: FaceAuthProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
      <CardContent className="p-6">
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${
          faceData 
            ? 'bg-green-50 text-green-800' 
            : 'bg-blue-50 text-blue-800'
        }`}>
          {faceData ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-blue-600" />
          )}
          <div>
            <p className="font-medium">
              {faceData ? 'Лицо успешно отсканировано' : 'Ожидание сканирования лица'}
            </p>
            {faceData && (
              <p className="text-sm opacity-75">
                Получены: детекция{faceData.landmarks ? ', landmarks' : ''}{faceData.descriptor ? ', дескриптор' : ''}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
