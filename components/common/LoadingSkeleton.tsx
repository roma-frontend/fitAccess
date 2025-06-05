// components/common/LoadingSkeleton.tsx (универсальный компонент скелетона)
"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  variant?: "card" | "list" | "table";
}

export default function LoadingSkeleton({ 
  className, 
  rows = 3, 
  variant = "card" 
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("grid gap-6 lg:grid-cols-2 xl:grid-cols-3", className)}>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-1">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="h-9 flex-1 bg-gray-200 rounded"></div>
                  <div className="h-9 flex-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="animate-pulse bg-white rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="animate-pulse h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
  );
}
