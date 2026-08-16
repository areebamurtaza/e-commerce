import { Brand, NavItem } from '@/types';

// lib/constants.ts

export const ORDER_CONFIG = {
  // Stock hold window (e.g. 45 or 60 minutes instead of 30)
  RESERVATION_EXPIRY_MINUTES: Number(process.env.NEXT_PUBLIC_RESERVATION_MINUTES) || 45,
  
  // Rate limiting for checkout intent
  CHECKOUT_RATE_LIMIT_MAX: 10,
  CHECKOUT_RATE_LIMIT_WINDOW_SECONDS: 60,
  
  // Delivery fee rules
  FREE_SHIPPING_THRESHOLD: 200,
  STANDARD_SHIPPING_FEE: 15.0,
  
  // Stripe standard fee estimate (2.9% + $0.30)
  STRIPE_FEE_PERCENT: 0.029,
  STRIPE_FEE_FIXED: 0.3,
} as const;

export const DB_TIMEOUT_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_BACKOFF_MS: 300,
  MAX_BACKOFF_MS: 2000,
  TRANSACTION_TIMEOUT_MS: 15000, // 15s max transaction duration
} as const;
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Shop',
    href: '/shop',
    children: [
      { label: 'Casual', href: '/shop?style=Casual' },
      { label: 'Formal', href: '/shop?style=Formal' },
      { label: 'Party', href: '/shop?style=Party' },
      { label: 'Gym', href: '/shop?style=Gym' },
    ],
  },
  { label: 'On Sale', href: '/shop?sale=true' },
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Brands', href: '/#brands' },
];

export const BRANDS: Brand[] = [
  { name: 'VERSACE', logoText: 'VERSACE' },
  { name: 'ZARA', logoText: 'ZARA' },
  { name: 'GUCCI', logoText: 'GUCCI' },
  { name: 'PRADA', logoText: 'PRADA' },
  { name: 'Calvin Klein', logoText: 'Calvin Klein' },
];