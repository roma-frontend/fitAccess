"use client";

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus } from "lucide-react";

interface AuthCardProps {
  isLogin: boolean;
  children: ReactNode;
}

export function AuthCard({ isLogin, children }: AuthCardProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          {isLogin ? (
            <User className="h-8 w-8 text-white" />
          ) : (
            <UserPlus className="h-8 w-8 text-white" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {isLogin ? "Вход в FitAccess" : "Регистрация в FitAccess"}
        </CardTitle>
        <CardDescription className="text-base">
          {isLogin
            ? "Войдите в свой аккаунт участника"
            : "Создайте новый аккаунт участника"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}
