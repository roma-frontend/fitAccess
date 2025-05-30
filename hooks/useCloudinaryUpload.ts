// hooks/useCloudinaryUpload.ts (версия с детальным логированием)
'use client';

import { useState } from 'react';

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, p0: { folder: string; uploadPreset: string; }) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log('🔄 useCloudinaryUpload: начинаем загрузку файла', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');
      formData.append('uploadTo', 'cloudinary');

      console.log('📤 Отправляем запрос на /api/upload...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Получен ответ от сервера:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      console.log('📄 Данные ответа:', result);

      if (result.success) {
        console.log('✅ useCloudinaryUpload: файл успешно загружен', result.url);
        return result.url;
      } else {
        console.error('❌ Ошибка от сервера:', result);
        throw new Error(result.error || 'Ошибка загрузки');
      }
    } catch (err: any) {
      console.error('❌ useCloudinaryUpload: исключение при загрузке', err);
      setError(err.message || 'Неизвестная ошибка загрузки');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    error,
  };
}
