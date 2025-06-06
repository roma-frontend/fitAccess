"use client";

import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import LoginCardsSection from "@/components/home/LoginCardsSection";
import TrainersSection from "@/components/home/TrainersSection";
import ProgramsSection from "@/components/home/ProgramsSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import QuickActionsSection from "@/components/home/QuickActionsSection";
import DeveloperPanel from "@/components/home/DeveloperPanel";
import CTASection from "@/components/home/CTASection";
import FitnessLoader from "@/components/ui/FitnessLoader";
import { useClientOnly } from "@/hooks/useClientOnly";
import { useAuth, useNavigation } from "@/hooks/useAuth";

export default function HomePage() {
  const { authStatus, loading, logout } = useAuth();
  const { handleDashboardRedirect } = useNavigation();
  const mounted = useClientOnly();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Статичный фон для SSR */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Статичные элементы фона */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-green-500/10 rounded-full" />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-purple-500/10 rounded-full" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-500/10 rounded-full" />
          
          {/* Статичные градиенты */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-green-400/20 to-transparent rounded-full" />
          
          {/* Динамические элементы только на клиенте */}
          {mounted && (
            <>
              {/* Анимированные плавающие элементы */}
              <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full animate-float animation-delay-1000" />
              <div className="absolute top-40 right-20 w-12 h-12 bg-green-500/10 rounded-full animate-float animation-delay-500" />
              <div className="absolute bottom-40 left-20 w-20 h-20 bg-purple-500/10 rounded-full animate-float animation-delay-1500" />
              <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-500/10 rounded-full animate-float animation-delay-200" />
              
              {/* Анимированные градиенты */}
              <div className="absolute -top-40 -left-40 w-80 h-80 fitness-gradient rounded-full opacity-20" />
              <div className="absolute -bottom-40 -right-40 w-80 h-80 fitness-gradient rounded-full opacity-20 animation-delay-1000" />
              
              {/* Сетка точек */}
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      left: `${10 + (i * 4) % 80}%`,
                      top: `${10 + (i * 7) % 80}%`,
                      animationDelay: `${(i * 0.1)}s`,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Основной лоадер */}
        <div className="relative z-10">
          <FitnessLoader 
            size="xl" 
            variant="dumbbell"
            text="FitFlow Pro"
            showProgress={true}
            motivationalTexts={[
              "Подготавливаем вашу фитнес-экосистему...",
              "Загружаем персональные программы...",
              "Синхронизируем данные тренировок...",
              "Настраиваем аналитику прогресса...",
              "Подключаем умные уведомления...",
              "Почти готово! Финальная настройка..."
            ]}
            className="drop-shadow-2xl"
          />
          
          {/* Дополнительная информация */}
          <div className="mt-12 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span>Система управления</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-500" />
                <span>Аналитика прогресса</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse animation-delay-1000" />
                <span>Умные интеграции</span>
              </div>
            </div>
            
            {/* Версия и статус */}
            <div className="text-xs text-gray-400 space-y-1">
              <p>FitFlow Pro v2.0 • Умная система управления фитнесом</p>
              <p className="animate-pulse">🔒 Безопасное соединение • 🚀 Высокая производительность</p>
            </div>
          </div>
        </div>

        {/* Декоративные элементы - только на клиенте */}
        {mounted && (
          <>
            <div className="absolute top-10 left-10 text-blue-500/20 animate-spin animation-duration-5000">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            <div className="absolute bottom-10 right-10 text-green-500/20 animate-bounce animation-delay-1000">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <MainHeader
        authStatus={authStatus}
        isLoading={loading}
        onLogout={logout}
      />

      {/* Основной контент */}
      <div className="relative">
        {/* Контейнер для основного контента с padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <HeroSection 
            authStatus={authStatus} 
            onDashboardRedirect={handleDashboardRedirect} 
          />

          {/* Features Section */}
          <FeaturesSection />

          {/* Stats Section */}
          <StatsSection />

          {/* Login Cards - показываем только неавторизованным пользователям */}
          {!authStatus?.authenticated && <LoginCardsSection />}

          {/* Trainers Section */}
          <TrainersSection />

          {/* Programs Section */}
          <ProgramsSection />

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* FAQ Section */}
          <FAQSection />

          {/* Quick Actions Section */}
          <QuickActionsSection 
            authStatus={authStatus} 
            onDashboardRedirect={handleDashboardRedirect} 
          />

                    {/* Developer Panel - показываем только админам и супер-админам */}
          <DeveloperPanel authStatus={authStatus} />

          {/* CTA Section */}
          <CTASection 
            authStatus={authStatus} 
            onDashboardRedirect={handleDashboardRedirect} 
          />
        </div>

        {/* Футер без контейнера - полная ширина */}
        <div className="relative">
          {/* Плавный переход от основного контента к футеру */}
          <div className="h-16 bg-gradient-to-b from-transparent to-gray-900/5"></div>
          
          {/* Футер на полную ширину */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

