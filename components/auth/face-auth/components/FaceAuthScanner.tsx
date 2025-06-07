// components/auth/face-auth/components/FaceAuthScanner.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoScanner } from "@/components/auth/face-scanner/video-scanner";
import { Camera } from "lucide-react";
import { FaceAuthProps } from "../types";

interface FaceAuthScannerProps extends FaceAuthProps {
  isMobile?: boolean;
}

export function FaceAuthScanner({ onFaceDetected, isMobile }: FaceAuthScannerProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <Camera className="h-5 w-5" />
          <span>Сканер лица</span>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Поместите лицо в центр кадра для сканирования
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VideoScanner 
          onFaceDetected={onFaceDetected}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
