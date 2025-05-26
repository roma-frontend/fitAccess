// app/mobile-scanner/[sessionId]/page.tsx
import { use } from "react";
import { MobileScannerClient } from "./mobile-scanner-client";

interface MobileScannerProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function MobileScannerPage({ params }: MobileScannerProps) {
  const { sessionId } = use(params);

  return <MobileScannerClient sessionId={sessionId} />;
}
