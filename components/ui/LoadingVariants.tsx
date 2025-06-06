"use client";

import { cn } from "@/lib/utils";
import FitnessLoader from "./FitnessLoader";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingVariantsProps {
  variant?: "minimal" | "fitness" | "page" | "component" | "fullscreen";
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

export default function LoadingVariants({
  variant = "minimal",
  size = "md",
  text,
  className
}: LoadingVariantsProps) {
  
  switch (variant) {
    case "fitness":
      return (
        <FitnessLoader
          size={size}
          text={text}
          variant="dumbbell"
          className={className}
        />
      );

    case "page":
      return (
        <div className={cn(
          "min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-green-50/50 rounded-lg",
          className
        )}>
          <FitnessLoader
            size={size}
            text={text || "Загружаем страницу..."}
            variant="heartbeat"
            showProgress={true}
          />
        </div>
      );

    case "component":
      return (
        <div className={cn(
          "flex items-center justify-center py-8",
          className
        )}>
          <LoadingSpinner
            size={size}
            text={text}
            variant="minimal"
          />
        </div>
      );

    case "fullscreen":
      return (
        <div className={cn(
          "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center",
          className
        )}>
          <FitnessLoader
            size="xl"
            text={text || "Загружаем..."}
            variant="strength"
            showProgress={true}
            motivationalTexts={[
              "Обрабатываем запрос...",
              "Синхронизируем данные...",
              "Почти готово..."
            ]}
          />
        </div>
      );

    default:
      return (
        <LoadingSpinner
          size={size}
          text={text}
          variant="minimal"
          className={className}
        />
      );
  }
}

// Экспорт готовых компонентов для быстрого использования
export const PageLoader = ({ text }: { text?: string }) => (
  <LoadingVariants variant="page" size="lg" text={text} />
);

export const ComponentLoader = ({ text }: { text?: string }) => (
  <LoadingVariants variant="component" size="md" text={text} />
);

export const FullscreenLoader = ({ text }: { text?: string }) => (
  <LoadingVariants variant="fullscreen" text={text} />
);

export const FitnessPageLoader = ({ text }: { text?: string }) => (
  <LoadingVariants variant="fitness" size="xl" text={text} />
);
