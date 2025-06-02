// app/admin/users/components/UsersPageSkeleton.tsx
"use client";

import React from 'react';
import { Sparkles } from "lucide-react";

export const UsersPageSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Загрузка пользователей</h3>
          <p className="text-gray-500">Подготавливаем данные для вас...</p>
        </div>
      </div>
    </div>
  );
});

UsersPageSkeleton.displayName = 'UsersPageSkeleton';
