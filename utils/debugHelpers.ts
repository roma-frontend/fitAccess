// utils/debugHelpers.ts (обновленная версия)
import { GlobalDebugCommands } from '@/types/debug';

export const diagnoseContexts = () => {
    console.log('🔍 Диагностика контекстов:');

    if (typeof window === 'undefined') {
        console.log('❌ Window объект недоступен');
        return;
    }

    const fitAccessDebug: GlobalDebugCommands | undefined = window.fitAccessDebug;

    if (!fitAccessDebug) {
        console.log('❌ fitAccessDebug не инициализирован');
        console.log('💡 Попробуйте подождать несколько секунд и повторить');
        return;
    }

    console.log('✅ fitAccessDebug доступен');
    console.log('📋 Доступные свойства:', Object.keys(fitAccessDebug));

    // Проверяем каждый контекст
    const contextNames = ['schedule', 'dashboard', 'superAdmin'] as const;

    contextNames.forEach(contextName => {
        const context = (fitAccessDebug as any)[contextName];
        if (context && typeof context === 'object') {
            console.log(`✅ ${contextName} контекст найден:`, {
                events: context.events?.length || 0,
                trainers: context.trainers?.length || 0,
                clients: context.clients?.length || 0,
                loading: context.loading,
                error: context.error,
                methods: Object.keys(context).filter(key => typeof context[key] === 'function')
            });
        } else {
            console.log(`❌ ${contextName} контекст не найден`);
        }
    });
    // ✅ ДОПОЛНИТЕЛЬНАЯ ДИАГНОСТИКА
    console.log('🔧 Рекомендации:');
    if (!(fitAccessDebug as any).schedule) {
        console.log('  - Schedule контекст не найден. Проверьте ScheduleProvider в layout.tsx');
    }
    if (!(fitAccessDebug as any).dashboard) {
        console.log('  - Dashboard контекст не найден. Проверьте DashboardProvider в layout.tsx');
    }
    if (!(fitAccessDebug as any).superAdmin) {
        console.log('  - SuperAdmin контекст не найден. Проверьте SuperAdminProvider в layout.tsx');
    }

    console.log('  - Если контексты не найдены, подождите 5-10 секунд и повторите diagnoseContexts()');
    console.log('  - Проверьте консоль на ошибки загрузки контекстов');
    console.log('💡 Доступные команды: fitAccessDebug.help()');
};




// ✅ ФУНКЦИЯ ПРИНУДИТЕЛЬНОЙ РЕГИСТРАЦИИ
export const forceRegisterContexts = () => {
    console.log('🔧 Принудительная регистрация контекстов...');

    if (typeof window === 'undefined') {
        console.log('❌ Window объект недоступен');
        return;
    }

    if (!window.fitAccessDebug) {
        window.fitAccessDebug = {
            help: () => console.log('Debug система еще не инициализирована'),
            checkSync: () => console.log('Debug система еще не инициализирована'),
            sync: async () => console.log('Debug система еще не инициализирована'),
            clear: async () => console.log('Debug система еще не инициализирована'),
            test: async () => console.log('Debug система еще не инициализирована'),
            stats: () => ({ error: 'Debug система еще не инициализирована' }),
            check: () => console.log('Debug система еще не инициализирована'),
            addEvents: async () => console.log('Debug система еще не инициализирована'),
            updateLastEvent: async () => console.log('Debug система еще не инициализирована'),
            deleteLastEvent: async () => console.log('Debug система еще не инициализирована'),
            clearEvents: async () => console.log('Debug система еще не инициализирована'),
            refreshAll: async () => console.log('Debug система еще не инициализирована'),
            stressTest: async () => console.log('Debug система еще не инициализирована'),
            simulateDesync: () => console.log('Debug система еще не инициализирована'),
            getStats: () => ({ error: 'Debug система еще не инициализирована' }),
            forceSyncContexts: async () => console.log('Debug система еще не инициализирована'),
            diagnoseSync: () => ({ error: 'Debug система еще не инициализирована' }),
            clearAllEvents: async () => console.log('Debug система еще не инициализирована')
        };
        console.log('✅ fitAccessDebug инициализирован с заглушками');
    }

    console.log('💡 Используйте ContextRegistrar компонент для автоматической регистрации');
};

// Добавляем в window для быстрого доступа
if (typeof window !== 'undefined') {
    window.diagnoseContexts = diagnoseContexts;
    window.forceRegisterContexts = forceRegisterContexts;
}
