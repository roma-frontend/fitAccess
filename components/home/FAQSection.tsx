"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle, Sparkles } from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import { faqs } from "./constants/FAQ";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItem({ question, answer, isOpen, onToggle, index }: FAQItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <Card
      className={combineAnimations(
        "border-2 rounded-3xl overflow-hidden backdrop-blur-sm",
        "bg-white/80 border-gray-200/50",
        "hover:border-blue-300/50 hover:bg-white/90",
        "transform hover:scale-[1.02] hover:-translate-y-1",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-blue-500/10",
        "group will-change-transform"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      <CardContent className="p-0 relative overflow-hidden">
        {/* Декоративный градиент */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-opacity" />

        {/* Анимированные частицы */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:rotate-12 will-change-transform">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>

        <button
          onClick={onToggle}
          className={combineAnimations(
            "w-full p-8 text-left flex items-center justify-between relative z-10",
            "transition-all duration-300 ease-out will-change-auto",
            "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50"
          )}
        >
          <h3 className="font-bold text-gray-900 pr-6 text-lg leading-relaxed transition-colors duration-300 group-hover:text-blue-700 will-change-auto">
            {question}
          </h3>

          {/* Более скромная стрелка */}
          <div
            className={combineAnimations(
              "flex-shrink-0 w-8 h-8 rounded-full",
              "bg-gray-100 border border-gray-200",
              "flex items-center justify-center",
              "transition-all duration-300 ease-out will-change-transform",
              "group-hover:bg-blue-50 group-hover:border-blue-200",
              isOpen ? "rotate-180 bg-blue-50 border-blue-200" : "rotate-0"
            )}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-blue-600 transition-all duration-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 transition-all duration-300 group-hover:text-blue-600" />
            )}
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-700 ease-out will-change-auto"
          style={{ height: `${height}px` }}
        >
          <div ref={contentRef} className="px-8 pb-8">
            <div
              className={combineAnimations(
                "transform transition-all duration-500 ease-out will-change-transform",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <div
                className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 transform origin-left transition-all duration-700 will-change-transform"
                style={{
                  transform: `scaleX(${isOpen ? 1 : 0})`,
                }}
              />
              <p className="text-gray-600 leading-relaxed text-base">
                {answer}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="mb-16 relative">
      {/* Фоновые декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse will-change-transform" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse will-change-transform"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div
        className={combineAnimations(
          "text-center mb-16 relative z-10",
          "transform transition-all duration-1000 ease-out will-change-transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className={combineAnimations(
              "w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500",
              "rounded-2xl flex items-center justify-center",
              "transform transition-all duration-700 ease-out will-change-transform",
              "hover:scale-110 hover:rotate-12",
              "shadow-xl shadow-blue-500/25",
              isVisible ? "animate-none" : ""
            )}
          >
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Часто задаваемые вопросы
          </h2>
        </div>

        <div className="relative">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ответы на самые популярные вопросы наших клиентов
          </p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full will-change-transform" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={combineAnimations(
              "transform transition-all duration-700 ease-out will-change-transform",
              isVisible
                ? "translate-x-0 opacity-100"
                : index % 2 === 0
                  ? "-translate-x-8 opacity-0"
                  : "translate-x-8 opacity-0"
            )}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <FAQItem
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
