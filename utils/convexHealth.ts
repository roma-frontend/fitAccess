// utils/convexHealth.ts (исправленная версия с типами)
import { ConvexHttpClient } from "convex/browser";

// ✅ ТИПЫ ДЛЯ РЕЗУЛЬТАТОВ ПРОВЕРКИ
interface FunctionTestResult {
  success: boolean;
  data?: string;
  error?: string;
}

interface FunctionTestResults {
  [functionName: string]: FunctionTestResult;
}

export const checkConvexHealth = async () => {
  console.log('🔍 Проверка состояния Convex...');
  
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('❌ NEXT_PUBLIC_CONVEX_URL не настроен');
    return false;
  }
  
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // ✅ ИСПОЛЬЗУЕМ ПРАВИЛЬНОЕ НАЗВАНИЕ ФУНКЦИИ
    const result = await convex.query("trainers:getAllTrainers");
    
    console.log('✅ Convex доступен, тренеров найдено:', result?.length || 0);
    return true;
  } catch (error: any) {
    console.error('❌ Convex недоступен:', error.message);
    
    if (error.message?.includes('Could not find public function')) {
      console.error('💡 Функции не найдены. Выполните:');
      console.error('   1. npx convex dev');
      console.error('   2. Убедитесь что convex/trainers.ts существует');
      console.error('   3. Проверьте что функция getAllTrainers экспортирована');
    }
    
    return false;
  }
};

// ✅ РАСШИРЕННАЯ ПРОВЕРКА ВСЕХ ФУНКЦИЙ С ТИПАМИ
export const checkConvexFunctions = async (): Promise<FunctionTestResults> => {
  console.log('🔍 Проверка всех функций Convex...');
  
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('❌ NEXT_PUBLIC_CONVEX_URL не настроен');
    return {};
  }
  
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  
  const functionsToTest = [
    'trainers:getAllTrainers',
    'trainers:getActiveTrainers', 
    'trainers:getAll',
    'trainers:getStats'
  ];
  
  const results: FunctionTestResults = {};
  
  for (const functionName of functionsToTest) {
    try {
      console.log(`🔍 Тестируем функцию: ${functionName}`);
      const result = await convex.query(functionName);
      results[functionName] = {
        success: true,
        data: Array.isArray(result) ? `${result.length} записей` : 'данные получены'
      };
      console.log(`✅ ${functionName}: успешно`);
    } catch (error: any) {
      results[functionName] = {
        success: false,
        error: error.message
      };
      console.error(`❌ ${functionName}: ${error.message}`);
    }
  }
  
  console.log('📊 Результаты проверки функций:', results);
  return results;
};

// ✅ АВТОМАТИЧЕСКАЯ ПРОВЕРКА В DEVELOPMENT
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    checkConvexHealth();
  }, 2000);
  
  // Расширенная проверка через 5 секунд
  setTimeout(() => {
    checkConvexFunctions();
  }, 5000);
}
