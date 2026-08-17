import { Brand, NavItem } from '@/types';

// lib/constants.ts

export const ORDER_CONFIG = {
  // Stock hold window (15 minutes optimal standard for active checkout)
  RESERVATION_EXPIRY_MINUTES: Number(process.env.NEXT_PUBLIC_RESERVATION_MINUTES) || 15,
  
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

export interface PromoCodeDefinition {
  code: string;
  discountPercent: number;
  description: string;
}

export const VALID_PROMO_CODES: Record<string, PromoCodeDefinition> = {
  SHOP20: { code: 'SHOP20', discountPercent: 20, description: '20% Storewide Discount' },
  SAVE20: { code: 'SAVE20', discountPercent: 20, description: '20% Off Entire Order' },
  SAVE30: { code: 'SAVE30', discountPercent: 30, description: '30% VIP Customer Discount' },
  PROMO: { code: 'PROMO', discountPercent: 15, description: '15% Seasonal Promo' },
  PROMO15: { code: 'PROMO15', discountPercent: 15, description: '15% Discount' },
  WELCOME10: { code: 'WELCOME10', discountPercent: 10, description: '10% Welcome Discount' },
  DISCOUNT10: { code: 'DISCOUNT10', discountPercent: 10, description: '10% Off' },
  FREESHIP: { code: 'FREESHIP', discountPercent: 0, description: 'Free Shipping Voucher' },
};

export function validatePromoCode(code: string): {
  valid: boolean;
  discountPercent: number;
  description?: string;
  code?: string;
} {
  const clean = (code || '').trim().toUpperCase();
  if (VALID_PROMO_CODES[clean]) {
    return {
      valid: true,
      code: clean,
      discountPercent: VALID_PROMO_CODES[clean].discountPercent,
      description: VALID_PROMO_CODES[clean].description,
    };
  }
  return { valid: false, discountPercent: 0 };
}

export const DB_TIMEOUT_CONFIG = {
  MAX_RETRIES: 4,
  INITIAL_BACKOFF_MS: 400,
  MAX_BACKOFF_MS: 3000,
  TRANSACTION_TIMEOUT_MS: 35000, // 35s max transaction duration
} as const;

export const PRISMA_TX_OPTIONS = {
  maxWait: 15000, // 15s to acquire a connection from the pool
  timeout: 35000, // 35s to complete all queries in the transaction
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