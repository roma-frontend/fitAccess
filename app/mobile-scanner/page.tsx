// app/mobile-scanner/page.tsx
"use client";

import dynamic from 'next/dynamic';

// Динамический импорт с отключением SSR
const FaceScanner = dynamic(
  () => import('@/components/auth/face-scanner').then(mod => ({ default: mod.FaceScanner })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-xl font-bold mb-4 text-center">
              📱 Сканирование лица с телефона
            </h1>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Загрузка сканера лица...</p>
                <p className="text-xs text-gray-500 mt-1">Подготавливаем камеру и ИИ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
);

export default function MobileScannerPage() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold mb-4 text-center">
            📱 Сканирование лица с телефона
          </h1>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-medium">Инструкция:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Разрешите доступ к камере</li>
              <li>• Расположите лицо в центре экрана</li>
              <li>• Дождитесь распознавания</li>
            </ul>
          </div>

          <FaceScanner />

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800">
            <p className="font-medium">💡 Совет:</p>
            <p>Для лучшего результата используйте хорошее освещение и держите телефон устойчиво</p>
          </div>
        </div>
      </div>
    </div>
  );
}
