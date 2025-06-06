"use client";

import { cn } from "@/lib/utils";
import FitnessLoader from "./FitnessLoader";
import LoadingSpinner from "./LoadingSpinner";
import { useClientOnly } from "@/hooks/useClientOnly";

type LoadingSize = "sm" | "md" | "lg" | "xl";
type LoadingVariant = "minimal" | "fitness" | "page" | "component" | "fullscreen" | "inline";

interface LoadingStatesProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function LoadingStates({
  variant = "minimal",
  size = "md",
  text,
  className,
  isLoading = true,
  children
}: LoadingStatesProps) {
  const mounted = useClientOnly();

  if (!isLoading && children) {
    return <>{children}</>;
  }

  if (!isLoading) {
    return null;
  }

  switch (variant) {
    case "fitness":
      return (
        <div className={cn("flex items-center justify-center", className)}>
          <FitnessLoader
            size={size}
            text={text}
            variant="dumbbell"
          />
        </div>
      );

    case "page":
      return (
        <div className={cn(
          "min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-green-50/50 rounded-lg border border-gray-200/50",
          className
        )}>
          <FitnessLoader
            size={size}
            text={text || "Загружаем страницу..."}
            variant="heartbeat"
            showProgress={mounted}
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
            showProgress={mounted}
            motivationalTexts={mounted ? [
              "Обрабатываем запрос...",
              "Синхронизируем данные...",
              "Почти готово..."
            ] : ["Загружаем..."]}
          />
        </div>
      );

    case "inline":
      return (
        <div className={cn("inline-flex items-center gap-2", className)}>
          <LoadingSpinner size="sm" variant="minimal" />
          {text && <span className="text-sm text-gray-600">{text}</span>}
        </div>
      );

    default:
      return (
        <div className={cn("flex items-center justify-center", className)}>
          <LoadingSpinner
            size={size}
            text={text}
            variant="minimal"
          />
        </div>
      );
  }
}

// Готовые компоненты для быстрого использования
export const PageLoader = ({ text, className }: { text?: string; className?: string }) => (
  <LoadingStates variant="page" size="lg" text={text} className={className} />
);

export const ComponentLoader = ({ text, className }: { text?: string; className?: string }) => (
  <LoadingStates variant="component" size="md" text={text} className={className} />
);

export const FullscreenLoader = ({ text, className }: { text?: string; className?: string }) => (
  <LoadingStates variant="fullscreen" text={text} className={className} />
);

export const InlineLoader = ({ text, className }: { text?: string; className?: string }) => (
  <LoadingStates variant="inline" text={text} className={className} />
);

export const FitnessPageLoader = ({ text, className }: { text?: string; className?: string }) => (
  <LoadingStates variant="fitness" size="xl" text={text} className={className} />
);

// Компонент с условным рендерингом
interface ConditionalLoaderProps {
  isLoading: boolean;
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

export const ConditionalLoader = ({
  isLoading,
  variant = "component",
  size = "md",
  text,
  className,
  children
}: ConditionalLoaderProps) => {
  if (isLoading) {
    return (
      <LoadingStates
        variant={variant}
        size={size}
        text={text}
        className={className}
        isLoading={true}
      />
    );
  }

  return <>{children}</>;
};
