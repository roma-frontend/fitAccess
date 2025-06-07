// components/auth/face-scanner/types/index.ts

export interface FaceDescriptor {
  id: string;
  name: string;
  faceDescriptor: number[];
}

export interface VideoScannerProps {
  disabled?: boolean;
  onMatch?: (user: FaceDescriptor) => void;
}

export interface AlternativeOptionsProps {
  onTestLogin: () => void;
  onGenerateQR: () => void;
  onMobileScanner: () => void;
  isLoading: boolean;
}

export interface QRCodeModalProps {
  qrCodeUrl: string;
  sessionId: string;
  onCopyLink: () => void;
  onClose: () => void;
}

export interface InfoCardsProps {
  faceDescriptors: FaceDescriptor[];
}

export interface DebugInfoProps {
  isClient: boolean;
  faceapi: any;
  modelsLoaded: boolean;
  isScanning: boolean;
  isFaceScannerDisabled: boolean;
  showQR: boolean;
  isLoading: boolean;
  faceDescriptorsCount: number;
  mobileSessionId: string;
  currentUrl: string;
}

export interface LoadingIndicatorsProps {
  type: "initialization" | "models" | "library";
}

export interface UseFaceAPIReturn {
  faceapi: any;
  modelsLoaded: boolean;
  isLoadingModels: boolean;
}

export interface UseQRCodeReturn {
  qrCodeUrl: string;
  mobileSessionId: string;
  generateQRCode: (baseUrl: string) => Promise<{ qrDataUrl: string; sessionId: string } | null>;
  copyMobileLink: (baseUrl: string) => Promise<void>;
}

export interface UseFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  faceapi: any;
  isScanning: boolean;
  onMatch: (user: FaceDescriptor) => void;
}

export interface UseFaceDetectionReturn {
  detectFace: () => Promise<void>;
  stopDetection: () => void;
}
