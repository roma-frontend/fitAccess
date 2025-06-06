import { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutMission } from "@/components/about/AboutMission";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutTeam } from "@/components/about/AboutTeam";
import { AboutStats } from "@/components/about/AboutStats";
import { AboutTimeline } from "@/components/about/AboutTimeline";
import { AboutFacilities } from "@/components/about/AboutFacilities";
import { AboutTestimonials } from "@/components/about/AboutTestimonials";
import { AboutCTA } from "@/components/about/AboutCTA";
import { AboutContact } from "@/components/about/AboutContact";
import { BackToHomeButton } from "@/components/ui/BackToHomeButton"; // Добавьте этот импорт

export const metadata: Metadata = {
  title: "О нас - FitAccess",
  description: "Узнайте больше о FitAccess - современном фитнес-центре с профессиональными тренерами и передовым оборудованием.",
  keywords: "о нас, фитнес-центр, команда, миссия, ценности, тренеры",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Кнопка возврата на главную */}
      <BackToHomeButton />
      
      {/* Hero Section */}
      <AboutHero />
      
      {/* Mission Section */}
      <AboutMission />
      
      {/* Stats Section */}
      <AboutStats />
      
      {/* Values Section */}
      <AboutValues />
      
      {/* Timeline Section */}
      <AboutTimeline />
      
      {/* Team Section */}
      <AboutTeam />
      
      {/* Facilities Section */}
      <AboutFacilities />
      
      {/* Testimonials Section */}
      <AboutTestimonials />
      
      {/* Contact Section */}
      <AboutContact />
      
      {/* CTA Section */}
      <AboutCTA />
    </div>
  );
}
