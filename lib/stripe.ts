import { loadStripe } from '@stripe/stripe-js';

// Публичный ключ Stripe
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
