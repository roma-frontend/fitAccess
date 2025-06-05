// utils/aboutImageUtils.ts

// Типы для различных секций страницы "О нас"
export interface TeamMember {
  name: string;
  position: string;
  experience?: string;
  specialization?: string;
}

export interface Facility {
  name: string;
  description: string;
  features?: string[];
}

export interface Testimonial {
  name: string;
  role: string;
  achievement?: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
}

// Генерирует alt текст для фотографий команды
export const generateTeamImageAlt = (member: TeamMember): string => {
  const parts = [
    `Фото ${member.name}`,
    member.position
  ];
  
  if (member.experience) {
    parts.push(`опыт работы ${member.experience}`);
  }
  
  if (member.specialization) {
    parts.push(`специализация: ${member.specialization}`);
  }
  
  return parts.join(', ');
};

// Генерирует alt текст для изображений залов и оборудования
export const generateFacilityImageAlt = (facility: Facility): string => {
  const parts = [
    facility.name,
    facility.description
  ];
  
  if (facility.features && facility.features.length > 0) {
    parts.push(`особенности: ${facility.features.slice(0, 3).join(', ')}`);
  }
  
  return parts.join(', ');
};

// Генерирует alt текст для фотографий клиентов в отзывах
export const generateTestimonialImageAlt = (testimonial: Testimonial): string => {
  const parts = [
    `Фото клиента ${testimonial.name}`,
    testimonial.role
  ];
  
  if (testimonial.achievement) {
    parts.push(testimonial.achievement);
  }
  
  return parts.join(', ');
};

// Генерирует alt текст для изображений временной шкалы
export const generateTimelineImageAlt = (event: TimelineEvent): string => {
  return `${event.year} год: ${event.title} - ${event.description}`;
};

// Генерирует alt текст для hero изображений
export const generateHeroImageAlt = (section: string, description?: string): string => {
  const base = `Фитнес-центр FitAccess - ${section}`;
  return description ? `${base}, ${description}` : base;
};

// Генерирует alt текст для декоративных/фоновых изображений
export const generateDecorativeImageAlt = (context: string): string => {
  return `Декоративное изображение для секции ${context}`;
};

// Проверяет и очищает alt текст (универсальная функция)
export const sanitizeAltText = (alt: string): string => {
  if (!alt || alt.trim() === '') {
    return 'Изображение FitAccess';
  }
  
  // Удаляем лишние пробелы и ограничиваем длину
  return alt.trim().substring(0, 200);
};

// Генерирует fallback текст для любых изображений на странице
export const generateAboutFallbackText = (context: string, name?: string): string => {
  if (name) {
    return `Изображение ${name} - ${context}`;
  }
  return `Изображение секции ${context}`;
};

// Генерирует alt текст для изображений статистики/достижений
export const generateStatsImageAlt = (statName: string, value: string): string => {
  return `Иконка статистики: ${statName} - ${value}`;
};
