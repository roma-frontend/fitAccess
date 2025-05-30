// app/layout.tsx
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import "./globals.css";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { AuthProvider } from "@/hooks/useAuth";
import { UnifiedDataProvider } from "@/contexts/UnifiedDataContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ManagerProvider } from "@/contexts/ManagerContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { TrainerProvider } from "@/contexts/TrainerContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Metadata } from "next";

// ✅ Компоненты отладки
import DataDebugger from "@/components/debug/DataDebugger";
import LiveDataMonitor from "@/components/debug/LiveDataMonitor";
import TestButtons from "@/components/debug/TestButtons";
import PerformanceMonitor from "@/components/debug/PerformnaceMonitor";
import DataMonitorDisplay from "@/components/debug/DataMonitorDisplay";
import DelayedDebugInitializer from "@/components/debug/DelayedDebugInitializer";
import ContextRegistrar from "@/components/debug/ContextRegistrar";
import ContextTester from "@/components/debug/ContextTester";

// ✅ Импортируем все тесты и утилиты
import "@/utils/debugTest";
import "@/utils/finalTest";
import "@/utils/cleanTypes";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "FitAccess - Система управления фитнес-центром",
  description: "Современная система управления фитнес-центром с удобным интерфейсом для участников, тренеров и администраторов.",
  keywords: "фитнес, управление, система, тренеры, участники, администрация",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <AuthProvider>
            <DashboardProvider>
              <UnifiedDataProvider>
                <ScheduleProvider>
                  <SuperAdminProvider>
                    <AdminProvider>
                      <ManagerProvider>
                        <TrainerProvider>
                          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                            {children}
                          </div>
                          <Toaster />
                          
                          
                        </TrainerProvider>
                      </ManagerProvider>
                    </AdminProvider>
                  </SuperAdminProvider>
                </ScheduleProvider>
              </UnifiedDataProvider>
            </DashboardProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
