import React, { memo, useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useShopStore } from '@/stores/shopStore';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';

const CheckoutView = memo(() => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { setOrderStep } = useShopStore();
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (items.length === 0) return;

      try {
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items,
            totalAmount: getTotalPrice(),
          }),
        });

        const data = await response.json();
        
        if (data.success && data.paymentIntentId) {
          setPaymentIntentId(data.paymentIntentId);
        } else {
          throw new Error(data.error || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        // Handle error - maybe show a toast or redirect back to cart
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, getTotalPrice]);

  // Handle successful payment
  const handlePaymentSuccess = (receipt: any) => {
    // Clear the cart
    clearCart();
    
    // Move to success step or redirect
    setOrderStep('success');
    
    // You could also store the receipt data somewhere for display
    console.log('Payment successful:', receipt);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Error is already handled in CheckoutForm with toast
    // You could add additional error handling here if needed
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    setOrderStep('shop');
    return null;
  }

  // Show loading state while creating payment intent
  if (isLoading || !paymentIntentId) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Подготовка к оплате...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CheckoutForm
        paymentIntentId={paymentIntentId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
      <OrderSummary items={items} totalPrice={getTotalPrice()} />
    </div>
  );
});

CheckoutView.displayName = 'CheckoutView';

export default CheckoutView;