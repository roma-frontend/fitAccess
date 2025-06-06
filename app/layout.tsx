// app/layout.tsx
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { OptimizedProviders } from "@/components/providers/OptimizedProviders";
import { LoaderManager } from "@/components/layout/LoaderManager";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
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
          <QueryProvider>
            <AuthProvider>
              <OptimizedProviders>
                {/* Основная структура - всегда одинаковая */}
                <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
                  {/* Основной контент */}
                  <main className="flex-1">
                    {children}
                  </main>
                  
                  {/* Футер всегда внизу */}
                  <Footer />
                </div>
                
                <Toaster />
              </OptimizedProviders>
            </AuthProvider>
          </QueryProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
