// lib/stripe-client.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('⚠️ Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in client environment.');
    }
    stripePromise = loadStripe(publishableKey || '');
  }
  return stripePromise;
};