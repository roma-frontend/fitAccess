// app/trainer-dashboard/page.tsx (исправленная версия)
"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import TrainerHeader from '@/components/trainer/TrainerHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calendar, MessageSquare } from "lucide-react";
import { TrainerProvider } from '@/contexts/TrainerContext';
import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';

// Ленивая загрузка компонентов
const TrainerOverview = lazy(() => import('@/components/trainer/TrainerOverview'));
const ClientsManagement = lazy(() => import('@/components/trainer/ClientsManagement'));
const ScheduleManagement = lazy(() => import('@/components/trainer/ScheduleManagement'));
const MessagesComponent = lazy(() => import('@/components/trainer/MessagesComponent'));

// Компонент скелетона для табов
function TabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg border animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Компонент с проверкой загрузки данных
function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const searchParams = useSearchParams();
  const { isLoading, error, refetch } = useTrainerDataQuery();

  // Получаем параметр tab из URL
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['overview', 'clients', 'schedule', 'messages'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Обновляем URL при смене таба
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    if (newTab === 'overview') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', newTab);
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Показываем ошибку если есть
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Ошибка загрузки данных</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
          >
            Повторить загрузку
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Перезагрузить страницу
          </button>
        </div>
      </main>
    );
  }

  // Показываем загрузку если данные еще не загружены
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка панели тренера...</p>
        </div>
      </main>
    );
  }

  // Основной контент дашборда
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        {/* Навигационные табы */}
        <div className="hidden sm:block">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Клиенты</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Расписание</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Сообщения</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Мобильная навигация */}
        <div className="sm:hidden">
          <select 
            value={activeTab} 
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="overview">📊 Обзор</option>
            <option value="clients">👥 Клиенты</option>
            <option value="schedule">📅 Расписание</option>
            <option value="messages">💬 Сообщения</option>
          </select>
        </div>

        {/* Контент табов */}
        <div className="animate-in fade-in-50 duration-200">
          <TabsContent value="overview" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <TrainerOverview />
            </Suspense>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <ClientsManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <ScheduleManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <MessagesComponent />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}

export default function TrainerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['trainer']} redirectTo="/staff-login">
      <TrainerProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header отдельно, без логики загрузки */}
          <TrainerHeader />
          
          {/* Основной контент с проверкой загрузки */}
          <DashboardContent />
        </div>
      </TrainerProvider>
    </ProtectedRoute>
  );
}
