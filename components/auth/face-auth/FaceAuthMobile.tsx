// components/auth/face-auth/FaceAuthMobile.tsx
"use client";

import { useState, useEffect } from "react";
import { FaceAuthBackground } from "./components/FaceAuthBackground";
import { FaceAuthMobileHeader } from "./components/FaceAuthMobileHeader";
import { FaceAuthMobileStatus } from "./components/FaceAuthMobileStatus";
import { FaceAuthMobileStats } from "./components/FaceAuthMobileStats";
import { FaceAuthScanner } from "./components/FaceAuthScanner";
import { FaceAuthMobileActions } from "./components/FaceAuthMobileActions";
import { FaceAuthMobileInstructions } from "./components/FaceAuthMobileInstructions";
import type { FaceAuthProps } from "./types";

export function FaceAuthMobile(props: FaceAuthProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FaceAuthBackground />
      
      <div className="max-w-md mx-auto p-4 space-y-6 relative z-10">
        <FaceAuthMobileHeader onSwitchMode={props.onSwitchMode} />
        <FaceAuthMobileStatus isOnline={isOnline} sessionId={props.sessionId} />
        <FaceAuthMobileStats {...props} />
        <FaceAuthScanner {...props} isMobile />
        <FaceAuthMobileActions {...props} />
        <FaceAuthMobileInstructions />
      </div>
    </div>
  );
}
