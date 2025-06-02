"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Загрузка...", 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn(
        "animate-spin text-blue-600 mb-4",
        sizeClasses[size]
      )} />
      <p className={cn(
        "text-gray-600",
        textSizeClasses[size]
      )}>
        {text}
      </p>
    </div>
  );
}
