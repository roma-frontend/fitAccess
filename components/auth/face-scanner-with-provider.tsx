// components/auth/face-scanner-with-provider.tsx
"use client";

import { FaceScannerProvider } from "./face-scanner/context/face-scanner-context";
import { FaceScanner } from "./face-scanner";

export function FaceScannerWithProvider() {
  return (
    <FaceScannerProvider>
      <FaceScanner />
    </FaceScannerProvider>
  );
}
