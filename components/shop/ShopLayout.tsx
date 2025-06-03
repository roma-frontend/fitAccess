import React, { memo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useShopStore } from '@/stores/shopStore';
import ReceiptModal from '@/components/ReceiptModal';
import ShopContent from './ShopContent';
import ShopErrorBoundary from './ShopErrorBoundary';
import ConvexProductsProvider from '../providers/ConvexProductsProvider';
import ShopHeader from './ShopHeader';
import ShopLoadingOverlay from './ShopLoadingOverlay';

const ShopLayout = memo(() => {
  // ✅ ВСЕ ХУКИ ВЫЗЫВАЮТСЯ ВСЕГДА
  const { user, loading } = useAuth();
  const { receipt, showReceipt, setShowReceipt } = useShopStore();

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleReceiptClose = useCallback(() => {
    setShowReceipt(false);
  }, [setShowReceipt]);

  // ✅ УСЛОВНЫЙ РЕНДЕРИНГ ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Необходима авторизация</h2>
          <button 
            onClick={() => window.location.href = '/member-login'}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Войти как участник
          </button>
          <button 
            onClick={() => window.location.href = '/staff-login'}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Войти как персонал
          </button>
        </div>
      </div>
    );
  }

  // Основной интерфейс магазина
  return (
    <ShopErrorBoundary>
      <ConvexProductsProvider>
        <div className="min-h-screen bg-gray-50">
          <ShopHeader 
            user={user} 
            onBack={handleBack}
          />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ShopContent />
          </main>

          <ReceiptModal
            receipt={receipt}
            isOpen={showReceipt}
            onClose={handleReceiptClose}
          />

          <ShopLoadingOverlay />
        </div>
      </ConvexProductsProvider>
    </ShopErrorBoundary>
  );
});

ShopLayout.displayName = 'ShopLayout';

export default ShopLayout;
