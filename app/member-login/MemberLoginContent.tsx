// app/member-login/page.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Users, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* ✅ Контейнер в стиле "открытой книги" */}
      <div className="max-w-6xl mx-auto">
        
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Добро пожаловать в FitFlow Pro" : "Присоединяйтесь к FitFlow Pro"}
          </h1>
          <p className="text-lg text-gray-600">
            {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт за несколько шагов"}
          </p>
        </div>

        {/* ✅ Основной контент в виде "книги" */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Левая "страница" - Форма входа/регистрации */}
          <div className="order-2 lg:order-1">
            <AuthCard isLogin={isLogin}>
              <ErrorAlert error={error} />

              <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder={isLogin ? "Введите пароль" : "Создайте надежный пароль"}
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

            {/* Статус формы под основной карточкой */}
            <div className="mt-6">
              <FormStatusIndicator
                isFormReady={isFormReady}
                isValidating={isValidating}
                formData={formData}
                emailValid={emailValid}
                isLogin={isLogin}
                validationStates={validationStates}
              />
            </div>
          </div>

          {/* Правая "страница" - Информация и преимущества */}
          <div className="order-1 lg:order-2 space-y-6">
            
            {/* Информация о безопасности */}
            <SecurityInfo isLogin={isLogin} />

            {/* Преимущества для пользователей */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-purple-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isLogin ? "Ваши возможности" : "Что вас ждет"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-purple-800 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Персональные программы</span>
                      <p className="text-xs text-purple-700 mt-1">Тренировки, адаптированные под ваши цели</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Эксклюзивный магазин</span>
                      <p className="text-xs text-purple-700 mt-1">Спортивное питание и аксессуары</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Отслеживание прогресса</span>
                      <p className="text-xs text-purple-700 mt-1">Детальная аналитика ваших достижений</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Профессиональные тренеры</span>
                      <p className="text-xs text-purple-700 mt-1">Консультации и индивидуальный подход</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Face ID авторизация</span>
                      <p className="text-xs text-purple-700 mt-1">Быстрый и безопасный вход</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-200">
                  <p className="text-center font-medium text-purple-900">
                    🎉 {isLogin ? "Добро пожаловать обратно!" : "Начните свой путь к здоровью!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Статистика и достижения */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-green-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Наше сообщество
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">5,000+</div>
                    <div className="text-xs text-green-700">Активных пользователей</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50+</div>
                    <div className="text-xs text-green-700">Профессиональных тренеров</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1,000+</div>
                    <div className="text-xs text-green-700">Программ тренировок</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-xs text-green-700">Довольных клиентов</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-center font-medium text-green-900">
                    ⭐ Присоединяйтесь к успешному сообществу!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => window.location.href = "/auth/face-auth"}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-300/30 rounded-lg hover:from-purple-500/20 hover:to-blue-500/20 transition-all text-left"
                >
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium text-blue-900">Face ID вход</div>
                      <div className="text-xs text-blue-700">Войти за 2 секунды</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>

                <button
                  onClick={() => window.location.href = "/staff-login"}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all text-left"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Вход для персонала</div>
                      <div className="text-xs text-gray-700">Панель управления</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                </button>
              </CardContent>
            </Card>

            {/* Development Tools (только в dev режиме) */}
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

        {/* ✅ Дополнительная информация внизу */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-sm">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                    <span>Бесплатная регистрация</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <span>Защищенные данные</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                  <span>24/7 поддержка</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                  <span>Отмена в любое время</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

