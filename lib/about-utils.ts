// lib/about-utils.ts
export const aboutPageConfig = {
  // Lazy loading для изображений
  imageOptimization: {
    quality: 85,
    formats: ['webp', 'avif'],
    sizes: {
      mobile: '(max-width: 768px) 100vw',
      tablet: '(max-width: 1024px) 50vw',
      desktop: '33vw'
    }
  },
  
  // Анимации с reduced motion
  animations: {
    respectReducedMotion: true,
    defaultDuration: 0.8,
    defaultEasing: 'easeOut'
  },
  
  // Предзагрузка критических ресурсов
  preload: [
    '/fonts/inter-var.woff2',
    '/images/hero-bg.webp'
  ]
};

// Утилита для оптимизации анимаций
export const getAnimationProps = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: aboutPageConfig.animations.defaultDuration,
    delay,
    ease: aboutPageConfig.animations.defaultEasing
  }
});
