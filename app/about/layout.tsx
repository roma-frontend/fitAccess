// app/about/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас - FitAccess | Лучший фитнес-центр города",
  description: "Узнайте больше о FitAccess - современном фитнес-центре с 8-летним опытом, 50+ профессиональными тренерами и 5000+ довольными клиентами.",
  keywords: "фитнес-центр, о нас, команда тренеров, история, миссия, ценности",
  openGraph: {
    title: "О нас - FitAccess",
    description: "Современный фитнес-центр с профессиональной командой",
    images: ["/images/about-og.jpg"],
  },
};

interface AboutLayoutProps {
  children: React.ReactNode;
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
