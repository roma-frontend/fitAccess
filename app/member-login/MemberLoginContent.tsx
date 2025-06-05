"use client";

import { useState } from "react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AuthModeToggle } from "@/components/auth/AuthModeToggle";
import { FormStatusIndicator } from "@/components/auth/FormStatusIndicator";
import { SecurityInfo } from "@/components/auth/SecurityInfo";
import { DevelopmentTools } from "@/components/auth/DevelopmentTools";
import { OtherAuthOptions } from "@/components/auth/OtherAuthOptions";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function MemberLoginContent() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const {
    isLogin,
    loading,
    error,
    emailValid,
    formData,
    validationStates,
    isValidating,
    isFormReady,
    handleFieldChange,
    handleSubmit,
    toggleMode,
    fillFormData,
    clearForm,
  } = useAuthForm();

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ForgotPasswordForm 
            onBack={() => setShowForgotPassword(false)}
            initialEmail={formData.email}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <AuthCard isLogin={isLogin}>
          <ErrorAlert error={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <FormField
                fieldName="name"
                label="Полное имя"
                placeholder="Ваше полное имя"
                type="text"
                required
                value={formData.name}
                onChange={(value) => handleFieldChange("name", value)}
                validationState={validationStates.name}
                isLogin={isLogin}
              />
            )}

            <FormField
              fieldName="email"
              label="Email адрес"
              placeholder="your@email.com"
              type="email"
              required
              value={formData.email}
              onChange={(value) => handleFieldChange("email", value)}
              validationState={validationStates.email}
              isValidating={isValidating}
              isLogin={isLogin}
            />

            <FormField
              fieldName="password"
              label="Пароль"
              placeholder="Введите пароль"
              type="password"
              required
              value={formData.password}
              onChange={(value) => handleFieldChange("password", value)}
              validationState={validationStates.password}
              isLogin={isLogin}
            />

                        {!isLogin && (
              <FormField
                fieldName="phone"
                label="Номер телефона"
                placeholder="+7 (999) 123-45-67"
                type="tel"
                required={false}
                value={formData.phone}
                onChange={(value) => handleFieldChange("phone", value)}
                validationState={validationStates.phone}
                isLogin={isLogin}
              />
            )}

            <SubmitButton
              isLogin={isLogin}
              loading={loading}
              isFormReady={isFormReady}
              isValidating={isValidating}
            />
          </form>

          <AuthModeToggle
            isLogin={isLogin}
            onToggle={toggleMode}
            loading={loading}
            isValidating={isValidating}
            onShowForgotPassword={() => setShowForgotPassword(true)}
          />

          <OtherAuthOptions loading={loading} />
        </AuthCard>

        <FormStatusIndicator
          isFormReady={isFormReady}
          isValidating={isValidating}
          formData={formData}
          emailValid={emailValid}
          isLogin={isLogin}
          validationStates={validationStates}
        />

        <SecurityInfo isLogin={isLogin} />

        <DevelopmentTools
          isLogin={isLogin}
          loading={loading}
          isValidating={isValidating}
          onFillData={fillFormData}
          onClearForm={clearForm}
          onShowForgotPassword={() => setShowForgotPassword(true)}
        />
      </div>
    </div>
  );
}

