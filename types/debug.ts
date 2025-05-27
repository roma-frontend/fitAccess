// types/debug.ts (обновленная версия с более гибкими типами)
export interface GlobalDebugCommands {
  schedule?: {
    events: any[];
    trainers: any[];
    loading: boolean;
    error: string | null;
    createEvent: (data: any) => Promise<void>;
    updateEvent: (id: string, data: any) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
    getStats: () => object;
    clearAllEvents: () => void;
    [key: string]: any;
  };
  
  dashboard?: {
    events: any[];
    trainers: any[];
    clients: any[];
    stats: any;
    analytics: any;
    loading: boolean;
    error: string | null;
    syncAllData: () => Promise<void>;
    refreshStats: () => Promise<void>;
    getStats: () => object;
    [key: string]: any;
  };
  
  superAdmin?: {
    trainers: any[];
    clients: any[];
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
    getStats: () => object;
    [key: string]: any;
  };
  
  // ✅ ОБЯЗАТЕЛЬНЫЕ КОМАНДЫ
  help: () => void;
  checkSync: () => void;
  sync: () => Promise<void>;
  clear: () => Promise<void>;
  test: (count?: number) => Promise<void>;
  stats: () => object;
  check: () => void;
  addEvents: (count?: number) => Promise<void>;
  updateLastEvent: () => Promise<void>;
  deleteLastEvent: () => Promise<void>;
  clearEvents: () => Promise<void>;
  refreshAll: () => Promise<void>;
  stressTest: (count?: number) => Promise<void>;
  simulateDesync: () => void;
  getStats: () => object;
  forceSyncContexts: () => Promise<void>;
  diagnoseSync: () => object;
  clearAllEvents: () => Promise<void>;
  
  // ✅ ИНДЕКСНАЯ СИГНАТУРА ДЛЯ ДОПОЛНИТЕЛЬНЫХ СВОЙСТВ
  [key: string]: any;
}

// ✅ ЕДИНСТВЕННОЕ ОБЪЯВЛЕНИЕ ГЛОБАЛЬНЫХ ТИПОВ
declare global {
  interface Window {
    fitAccessDebug: GlobalDebugCommands;
    diagnoseContexts: () => void;
    forceRegisterContexts: () => void;
  }
}
