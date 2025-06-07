// components/auth/face-auth/types.ts
import type { FaceDetectionData } from "@/components/auth/face-scanner/video-scanner";

export interface FaceAuthProps {
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
  faceData: FaceDetectionData | null;
  sessionId: string;
  scanCount: number;
  lastScanTime: Date | null;
  isRegistering: boolean;
  setIsRegistering: (value: boolean) => void;
  authStatus: any;
  router: any;
  onFaceDetected: (data: FaceDetectionData) => void;
  onSwitchMode: (mode: 'desktop' | 'mobile') => void;
}
