"use client";

import { memo } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StaffAuthNavigationProps {
    isLoading: boolean;
    onShowForgotPassword: () => void;
}

export const StaffAuthNavigation = memo(function StaffAuthNavigation({
    isLoading,
    onShowForgotPassword
}: StaffAuthNavigationProps) {
    return (
        <div className="space-y-6">
            {/* Ссылка на восстановление пароля */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={onShowForgotPassword}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors disabled:opacity-50"
                >
                    Забыли пароль?
                </button>
            </div>

            <div className="text-center">
                <Link
                    href="/forgot-password"
                    className="text-blue-600 hover:text-blue-500 text-sm transition-colors"
                >
                    Восстановить пароль через отдельную страницу
                </Link>
            </div>

            <div className="text-center space-y-3">
                <p className="text-xs text-gray-500">Другие варианты входа</p>
                <div className="space-y-2">
                    <Link href="/member-login" className="block">
                        <Button
                            variant="outline"
                            className="w-full h-10"
                            disabled={isLoading}
                        >
                            👤 Вход для участников
                        </Button>
                    </Link>
                    <Link href="/" className="block">
                        <Button
                            variant="ghost"
                            className="w-full h-8 text-xs"
                            disabled={isLoading}
                        >
                            ← На главную страницу
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
});
