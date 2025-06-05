"use client";

import { useStaffAuth } from "@/hooks/useStaffAuth";
import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { StaffForgotPasswordForm } from "@/components/staff/StaffForgotPasswordForm";
import { StaffAuthNavigation } from "@/components/staff/StaffAuthNavigation";
import { StaffSecurityInfo } from "@/components/staff/StaffSecurityInfo";
import { StaffDevelopmentTools } from "@/components/staff/StaffDevelopmentTools";

export default function StaffLoginContent() {
  const {
    isLoading,
    showForgotPassword,
    resetEmail,
    resetSent,
    setShowForgotPassword,
    setResetEmail,
    setResetSent,
    handleStaffLogin,
    handlePasswordReset,
    handleSuperAdminQuickLogin,
  } = useStaffAuth();

  // Обработчики для компонента восстановления пароля
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleResendReset = () => {
    setResetSent(false);
    setResetEmail("");
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <StaffForgotPasswordForm
            resetEmail={resetEmail}
            resetSent={resetSent}
            isLoading={isLoading}
            onEmailChange={setResetEmail}
            onSubmit={handlePasswordReset}
            onBack={handleBackToLogin}
            onResend={handleResendReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <StaffLoginForm
          onSubmit={handleStaffLogin}
          isLoading={isLoading}
        />

        <StaffAuthNavigation
          isLoading={isLoading}
          onShowForgotPassword={() => setShowForgotPassword(true)}
        />

        <StaffSecurityInfo />

        <StaffDevelopmentTools
          isLoading={isLoading}
          onQuickLogin={handleSuperAdminQuickLogin}
        />
      </div>
    </div>
  );
}
