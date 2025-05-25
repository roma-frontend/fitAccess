// components/admin-check.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const users = useQuery(api.users.getAll) || [];
  const [hasAdmins, setHasAdmins] = useState(true); 
  const [isChecking, setIsChecking] = useState(true);
  
  const excludedPaths = ['/setup', '/admin-login', '/login'];
  
  useEffect(() => {
    if (users.length > 0) {
      const adminExists = users.some((user: { role?: string }) => user.role === "admin");
      setHasAdmins(adminExists);
      setIsChecking(false);
      
      if (!adminExists && !excludedPaths.includes(pathname)) {
        router.push('/setup');
      }
      
      if (adminExists && pathname === '/setup') {
        router.push('/admin-login');
      }
    } else if (users.length === 0 && users !== undefined) {
      setHasAdmins(false);
      setIsChecking(false);
      
      if (!excludedPaths.includes(pathname)) {
        router.push('/setup');
      }
    }
  }, [users, pathname, router, excludedPaths]);
  
  if (excludedPaths.includes(pathname)) {
    return null;
  }
  
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Проверка системы</h2>
          <p className="mb-4">
            Пожалуйста, подождите, идет проверка настроек системы...
          </p>
        </div>
      </div>
    );
  }
  
  if (!hasAdmins) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Система не настроена</h2>
          <p className="mb-4">
            Для начала работы необходимо создать первого администратора.
          </p>
          <Button onClick={() => router.push('/setup')} className="w-full">
            Настроить систему
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}
