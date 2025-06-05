"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ValidatedInput";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

interface StaffForgotPasswordFormProps {
  resetEmail: string;
  resetSent: boolean;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>; // ✅ Добавляем Promise<void>
  onBack: () => void;
  onResend: () => void;
}

export const StaffForgotPasswordForm = memo(function StaffForgotPasswordForm({
  resetEmail,
  resetSent,
  isLoading,
  onEmailChange,
  onSubmit,
  onBack,
  onResend
}: StaffForgotPasswordFormProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {resetSent ? "Письмо отправлено" : "Восстановление пароля"}
        </CardTitle>
        <p className="text-gray-600">
          {resetSent
            ? "Проверьте вашу почту и следуйте инструкциям"
            : "Введите email для восстановления пароля"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {resetSent ? (
          <ResetSentContent 
            resetEmail={resetEmail}
            onResend={onResend}
            onBack={onBack}
            isLoading={isLoading}
          />
        ) : (
          <ResetFormContent
            resetEmail={resetEmail}
            onEmailChange={onEmailChange}
            onSubmit={onSubmit}
            onBack={onBack}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
});

const ResetSentContent = memo(function ResetSentContent({
  resetEmail,
  onResend,
  onBack,
  isLoading
}: {
  resetEmail: string;
  onResend: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <Mail className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <p className="text-green-800 font-medium">
          Письмо с инструкциями отправлено на {resetEmail}
        </p>
        <p className="text-green-600 text-sm mt-2">
          Проверьте папку "Спам", если письмо не пришло в течение 5 минут
        </p>
      </div>

      <div className="space-y-2">
        <Button
          onClick={onResend}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          Отправить повторно
        </Button>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к входу
        </Button>
      </div>
    </div>
  );
});

const ResetFormContent = memo(function ResetFormContent({
  resetEmail,
  onEmailChange,
  onSubmit,
  onBack,
  isLoading
}: {
  resetEmail: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>; // ✅ Добавляем Promise<void>
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email адрес персонала *
        </label>
        <ValidatedInput
          type="email"
          name="resetEmail"
          value={resetEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your.email@company.com"
          required
          className="h-11 w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Используйте корпоративный email адрес
        </p>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !resetEmail.trim()}
        className="w-full h-11"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Отправляем...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Отправить инструкции
          </>
        )}
      </Button>

      <Button
        type="button"
        onClick={onBack}
        variant="ghost"
        className="w-full"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Вернуться к входу
      </Button>
    </form>
  );
});
