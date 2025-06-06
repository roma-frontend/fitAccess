"use client";

import { memo } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { ValidatedInput } from "@/components/ValidatedInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { validatePasswordStrength } from "@/utils/validation";

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

interface FormFieldProps {
  fieldName: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  validationState?: ValidationState;
  isValidating?: boolean;
  isLogin?: boolean;
}

export const FormField = memo(function FormField({
  fieldName,
  label,
  placeholder,
  type = "text",
  required = true,
  value,
  onChange,
  validationState,
  isValidating = false,
  isLogin = true
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
        {fieldName === "password" && !isLogin && (
          <span className="text-xs text-gray-500 ml-1">
            (минимум 6 символов)
          </span>
        )}
      </label>
      
      <ValidatedInput
        type={type as any}
        name={fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        showPasswordToggle={type === "password"}
        className="h-11 w-full"
      />

      {/* Email валидация */}
      {fieldName === "email" && value && (
        <EmailValidationDisplay 
          isValidating={isValidating}
          validationState={validationState}
        />
      )}

      {/* Индикатор силы пароля для регистрации */}
      {fieldName === "password" && !isLogin && value && (
        <PasswordStrengthIndicator
          strength={validatePasswordStrength(value)}
          password={value}
        />
      )}

      {/* Отображение ошибок других полей - ИСПРАВЛЕНО */}
      {fieldName !== "email" && validationState && !validationState.isValid && validationState.errors.length > 0 && (
        <div className="mt-1 space-y-1">
          {validationState.errors.map((error: string, index: number) => (
            <p
              key={index}
              className="text-sm text-red-600 flex items-center"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

function EmailValidationDisplay({ 
  isValidating, 
  validationState 
}: { 
  isValidating: boolean; 
  validationState?: ValidationState; 
}) {
  return (
    <div className="mt-2">
      {isValidating ? (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Проверка email...</span>
        </div>
      ) : validationState ? (
        <div className="space-y-1">
          {validationState.isValid ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Email корректный</span>
            </div>
          ) : (
            <div className="space-y-1">
              {validationState.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Предупреждения */}
          {validationState.warnings?.map((warning, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-orange-600"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
