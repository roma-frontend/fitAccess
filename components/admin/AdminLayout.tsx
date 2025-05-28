// components/admin/AdminLayout.tsx - Обертка для всех админ страниц
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
  showBackground?: boolean;
}

export function AdminLayout({ 
  children, 
  className,
  showBackground = true 
}: AdminLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen",
      showBackground && "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
      className
    )}>
      {/* Animated Background Elements */}
      {showBackground && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      )}
      
      {children}
    </div>
  );
}

// components/admin/AdminMain.tsx - Основной контент
export function AdminMain({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <main className={cn(
      "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8",
      className
    )}>
      {children}
    </main>
  );
}
