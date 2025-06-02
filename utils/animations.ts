// Утилиты для анимаций
export const ANIMATION_CLASSES = {
  hover: {
    scale: "hover:scale-105",
    translateY: "hover:-translate-y-2",
    shadow: "hover:shadow-xl",
    rotate: "hover:rotate-6",
  },
  transition: {
    all: "transition-all duration-300",
    transform: "transition-transform duration-300",
    colors: "transition-colors duration-300",
    opacity: "transition-opacity duration-300",
  },
  gradient: {
    blue: "from-blue-600 to-indigo-600",
    green: "from-green-600 to-emerald-600",
    purple: "from-purple-600 to-pink-600",
    orange: "from-orange-600 to-red-600",
  }
} as const;

export const combineAnimations = (...classes: string[]) => {
  return classes.join(" ");
};
