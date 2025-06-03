import React, { memo } from 'react';

const ShopLoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Проверка авторизации...</p>
    </div>
  </div>
));

ShopLoadingState.displayName = 'ShopLoadingState';

export default ShopLoadingState;
