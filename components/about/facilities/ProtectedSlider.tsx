// components/about/facilities/ProtectedSlider.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { FacilitySmoothSlider } from "./FacilitySmoothSlider";

interface ProtectedSliderProps {
  facilities: any[];
  activeSlide: number;
  isTransitioning: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSlideChange: (index: number) => void;
  isInView: boolean;
}

export function ProtectedSlider(props: ProtectedSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Дополнительная защита через JavaScript
    const container = containerRef.current;
    if (container) {
      container.style.background = '#1f2937';
      
      // Применяем стили ко всем дочерним элементам
      const applyDarkBackground = (element: Element) => {
        if (element instanceof HTMLElement) {
          element.style.backgroundColor = 'transparent';
        }
        Array.from(element.children).forEach(applyDarkBackground);
      };
      
      applyDarkBackground(container);
      
      // Наблюдатель за изменениями DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              applyDarkBackground(node);
            }
          });
        });
      });
      
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="facility-component no-white-background slider-protection"
      style={{ background: '#1f2937' }}
    >
      <div className="prevent-layout-shift dark-transition">
        <FacilitySmoothSlider {...props} />
      </div>
    </div>
  );
}
