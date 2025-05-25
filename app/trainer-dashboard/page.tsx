// app/trainer-dashboard/page.tsx (финальная версия)
"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import TrainerHeader from '@/components/trainer/TrainerHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calendar, MessageSquare } from "lucide-react";

// Импорт компонентов
import TrainerOverview from '@/components/trainer/TrainerOverview';
import ClientsManagement from '@/components/trainer/ClientsManagement';
import ScheduleManagement from '@/components/trainer/ScheduleManagement';
import MessagesComponent from '@/components/trainer/MessagesComponent';
import { TrainerProvider } from '@/contexts/TrainerContext';

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Получаем параметр tab из URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['overview', 'clients', 'schedule', 'messages'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

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

  return (
    <ProtectedRoute allowedRoles={['trainer']} redirectTo="/staff-login">
      <TrainerProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Новый красивый header */}
          <TrainerHeader />

          {/* Основной контент */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
              {/* Навигационные табы - скрываем на мобильных */}
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

              {/* Контент табов */}
              <div className="animate-in fade-in-50 duration-200">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <TrainerOverview />
                </TabsContent>

                <TabsContent value="clients" className="space-y-6 mt-0">
                  <ClientsManagement />
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6 mt-0">
                  <ScheduleManagement />
                </TabsContent>

                <TabsContent value="messages" className="space-y-6 mt-0">
                  <MessagesComponent />
                </TabsContent>
              </div>
            </Tabs>
          </main>
        </div>
      </TrainerProvider>
    </ProtectedRoute>
  );
}
