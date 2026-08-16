// lib/stripe-client.ts
import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';

let stripePromise: Promise<StripeClient | null> | null = null;

export const getStripe = (): Promise<StripeClient | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error(
        '[STRIPE_CLIENT_ERROR]: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables.'
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};