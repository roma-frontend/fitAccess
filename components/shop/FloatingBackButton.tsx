"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface FloatingBackButtonProps {
  href?: string;
  label?: string;
  showAfterScroll?: number;
}

export default function FloatingBackButton({
  href = "/",
  label = "На главную",
  showAfterScroll = 200
}: FloatingBackButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfterScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showAfterScroll]);

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
    }`}>
      <Link href={href}>
        <Button 
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 group"
          variant="outline"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <Home className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </Link>
    </div>
  );
}
