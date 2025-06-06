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
import { useAuth, useNavigation } from "@/hooks/useAuth";

export default function HomePage() {
  const { authStatus, loading, logout } = useAuth();
  const { handleDashboardRedirect } = useNavigation();

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
