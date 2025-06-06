"use client";

import { useClientOnly } from "@/hooks/useClientOnly";

interface ClientWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export default function ClientWrapper({ 
  children, 
  fallback = null, 
  className 
}: ClientWrapperProps) {
  const mounted = useClientOnly();

  if (!mounted) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children}</div>;
}

// Экспорт дополнительных утилит
export const ClientOnly = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const mounted = useClientOnly();
  return mounted ? <>{children}</> : <>{fallback}</>;
};
