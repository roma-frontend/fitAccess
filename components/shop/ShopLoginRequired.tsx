import React, { memo } from 'react';

const ShopLoginRequired = memo(() => (
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
));

ShopLoginRequired.displayName = 'ShopLoginRequired';

export default ShopLoginRequired;
