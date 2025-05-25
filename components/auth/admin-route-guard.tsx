"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Получаем текущего пользователя из localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        redirect('/login');
      }
      
      try {
        const userData = JSON.parse(storedUser);
        
        const response = await fetch(`/api/users/${userData.id}/role`);
        const { role } = await response.json();
        
        if (role === 'admin') {
          setIsAdmin(true);
        } else {
          redirect('/dashboard');
        }
      } catch (error) {
        console.error("Ошибка проверки роли:", error);
        redirect('/login');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Проверка прав доступа...</p>
      </div>
    );
  }
  
  return isAdmin ? <>{children}</> : null;
}
