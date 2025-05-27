// app/debug-routes/page.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugRoutes() {
  const pathname = usePathname();
  const [testPaths, setTestPaths] = useState<string[]>([]);

  useEffect(() => {
    const paths = [
      '/admin',
      '/admin/products',
      '/admin/users',
      '/admin/analytics',
      '/staff-dashboard',
      '/trainer-dashboard',
      '/manager-dashboard'
    ];
    setTestPaths(paths);
  }, []);

  const testPath = async (path: string) => {
    try {
      const response = await fetch(path, { 
        method: 'HEAD',
        credentials: 'include'
      });
      console.log(`Тест ${path}: ${response.status}`);
      return response.status;
    } catch (error) {
      console.error(`Ошибка тестирования ${path}:`, error);
      return 'ERROR';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🛣️ Отладка маршрутов</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Текущий путь:</h2>
        <code className="bg-gray-100 p-2 rounded">{pathname}</code>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Тест маршрутов:</h2>
        <div className="space-y-2">
          {testPaths.map((path) => (
            <div key={path} className="flex items-center space-x-4">
              <code className="bg-gray-100 p-2 rounded flex-1">{path}</code>
              <button
                onClick={() => testPath(path)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Тест
              </button>
              <button
                onClick={() => window.location.href = path}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Перейти
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h3 className="font-bold text-yellow-800 mb-2">Инструкции:</h3>
        <ul className="text-yellow-700 space-y-1">
          <li>1. Нажмите "Тест" для проверки доступности маршрута</li>
          <li>2. Нажмите "Перейти" для навигации на маршрут</li>
          <li>3. Проверьте консоль браузера для логов middleware</li>
          <li>4. Проверьте Network tab для HTTP статусов</li>
        </ul>
      </div>
    </div>
  );
}
