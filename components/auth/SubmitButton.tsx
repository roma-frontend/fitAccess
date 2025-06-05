"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLogin: boolean;
  loading: boolean;
  isFormReady: boolean;
  isValidating: boolean;
}

export const SubmitButton = memo(function SubmitButton({
  isLogin,
  loading,
  isFormReady,
  isValidating
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={loading || !isFormReady || isValidating}
      className={`w-full h-11 transition-all duration-300 ${
        isFormReady && !isValidating
          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {isLogin ? "Входим..." : "Регистрируем..."}
        </>
      ) : isValidating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Проверка данных...
        </>
      ) : isLogin ? (
        "Войти в систему"
      ) : (
        "Создать аккаунт"
      )}
    </Button>
  );
});
