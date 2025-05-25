"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

// Динамически импортируем компонент только на клиенте
const AdminGuardContent = dynamic(
  () => import('./admin-guard-content'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Проверка прав доступа...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
);

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  return <AdminGuardContent>{children}</AdminGuardContent>;
}
