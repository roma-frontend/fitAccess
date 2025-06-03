// Утилиты для работы с изображениями

export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  if (!url) return '';

  try {
    // Если это Cloudinary URL, добавляем параметры оптимизации
    if (url.includes('cloudinary.com')) {
      const { width = 400, height = 400, quality = 80, format = 'auto' } = options;
      
      // Находим позицию для вставки параметров
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const beforeUpload = url.substring(0, uploadIndex + 8);
        const afterUpload = url.substring(uploadIndex + 8);
        
        const transformations = [
          `w_${width}`,
          `h_${height}`,
          `c_fill`,
          `q_${quality}`,
          `f_${format}`
        ].join(',');
        
        return `${beforeUpload}${transformations}/${afterUpload}`;
      }
    }
    
    return url;
  } catch (error) {
    console.warn('Ошибка оптимизации изображения:', error);
    return url;
  }
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const allowedHosts = [
      'res.cloudinary.com',
      'via.placeholder.com',
      'images.unsplash.com',
      'picsum.photos',
      'localhost'
    ];
    
    return allowedHosts.some(host => urlObj.hostname.includes(host));
  } catch {
    return false;
  }
};

export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
};
