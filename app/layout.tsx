import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import "./globals.css";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: "Система контроля доступа с распознаванием лиц",
  description:
    "Система контроля доступа с использованием технологии распознавания лиц",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ConvexClientProvider>
          <AuthProvider>
          <ScheduleProvider>{children}</ScheduleProvider>
          <Toaster />
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
