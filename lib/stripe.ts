// lib/stripe.ts
import 'server-only';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey && process.env.NODE_ENV === 'production') {
  throw new Error('[STRIPE_CONFIG_ERROR]: STRIPE_SECRET_KEY is missing in environment variables.');
}

export const stripe = new Stripe(apiKey || '', {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: {
    name: 'SHOP.CO Storefront',
    version: '1.0.0',
  },
});