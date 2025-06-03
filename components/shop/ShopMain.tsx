import React, { memo, useCallback } from 'react';
import { useShopStore } from '@/stores/shopStore';
import ReceiptModal from '@/components/ReceiptModal';
import ShopContent from './ShopContent';
import ShopErrorBoundary from './ShopErrorBoundary';
import ConvexProductsProvider from '../providers/ConvexProductsProvider';
import ShopHeader from './ShopHeader';
import ShopLoadingOverlay from './ShopLoadingOverlay';

interface ShopMainProps {
  user: any;
}

const ShopMain = memo(({ user }: ShopMainProps) => {
  const { receipt, showReceipt, setShowReceipt } = useShopStore();

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleReceiptClose = useCallback(() => {
    setShowReceipt(false);
  }, [setShowReceipt]);

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

ShopMain.displayName = 'ShopMain';

export default ShopMain;
