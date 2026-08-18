// actions/coupon.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma, withDbRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { PRISMA_TX_OPTIONS, VALID_PROMO_CODES } from '@/lib/constants';

export interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  discountPercentage: number;
  isActive: boolean;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageCount: number;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountPercentage: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountPercentage?: number;
  discountAmount?: number;
  message?: string;
  error?: string;
}

/**
 * Validates a coupon or promo code against the database or built-in campaigns
 */
export async function validateCouponCode(
  rawCode: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return { valid: false, error: 'Please enter a promo code.' };
  }

  try {
    // 1. Check database for dynamic coupon
    const dbCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (dbCoupon) {
      if (!dbCoupon.isActive) {
        return { valid: false, error: 'This coupon code is currently disabled.' };
      }

      if (dbCoupon.expiresAt && new Date(dbCoupon.expiresAt) < new Date()) {
        return { valid: false, error: 'This promo code has expired.' };
      }

      if (dbCoupon.minOrderAmount > 0 && subtotal < dbCoupon.minOrderAmount) {
        return {
          valid: false,
          error: `Minimum order of $${dbCoupon.minOrderAmount.toFixed(2)} required for this coupon.`,
        };
      }

      let discountAmount = Number(((subtotal * dbCoupon.discountPercentage) / 100).toFixed(2));
      if (dbCoupon.maxDiscount && discountAmount > dbCoupon.maxDiscount) {
        discountAmount = dbCoupon.maxDiscount;
      }

      return {
        valid: true,
        code: dbCoupon.code,
        discountPercentage: dbCoupon.discountPercentage,
        discountAmount,
        message: `${dbCoupon.discountPercentage}% Discount Applied!`,
      };
    }

    // 2. Check built-in fallback static codes
    const staticPromo = VALID_PROMO_CODES[code];
    if (staticPromo !== undefined) {
      const discountAmount = Number(((subtotal * staticPromo.discountPercent) / 100).toFixed(2));
      return {
        valid: true,
        code,
        discountPercentage: staticPromo.discountPercent,
        discountAmount,
        message: `${staticPromo.discountPercent}% Promo Applied Successfully!`,
      };
    }

    return { valid: false, error: 'Invalid or unrecognized coupon code.' };
  } catch (error) {
    console.error('[VALIDATE_COUPON_ERROR]:', error);
    // Fallback to static code check if DB error occurs
    const staticPromo = VALID_PROMO_CODES[code];
    if (staticPromo !== undefined) {
      const discountAmount = Number(((subtotal * staticPromo.discountPercent) / 100).toFixed(2));
      return {
        valid: true,
        code,
        discountPercentage: staticPromo.discountPercent,
        discountAmount,
        message: `${staticPromo.discountPercent}% Promo Applied Successfully!`,
      };
    }
    return { valid: false, error: 'Unable to validate promo code.' };
  }
}

/**
 * Increments coupon usage count after successful order
 */
export async function incrementCouponUsage(rawCode: string): Promise<void> {
  const code = rawCode.trim().toUpperCase();
  try {
    await prisma.coupon.updateMany({
      where: { code },
      data: {
        usageCount: { increment: 1 },
      },
    });
  } catch (error) {
    console.error('[INCREMENT_COUPON_USAGE_ERROR]:', error);
  }
}

/**
 * Admin: Get all coupons
 */
export async function getAdminCoupons(): Promise<{
  success: boolean;
  coupons?: CouponItem[];
  error?: string;
}> {
  try {
    await verifyAdmin();

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, coupons };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch coupons.',
    };
  }
}

/**
 * Admin: Create a new coupon
 */
export async function createCoupon(
  input: CreateCouponInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await verifyAdmin();

    const code = input.code.trim().toUpperCase();
    if (!code) {
      return { success: false, error: 'Coupon code is required.' };
    }

    if (input.discountPercentage <= 0 || input.discountPercentage > 100) {
      return { success: false, error: 'Discount must be between 1% and 100%.' };
    }

    return await withDbRetry(async () => {
      const existing = await prisma.coupon.findUnique({
        where: { code },
      });

      if (existing) {
        return { success: false, error: `Coupon code "${code}" already exists.` };
      }

      await prisma.coupon.create({
        data: {
          code,
          description: input.description?.trim() || null,
          discountPercentage: input.discountPercentage,
          minOrderAmount: input.minOrderAmount || 0,
          maxDiscount: input.maxDiscount || null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          isActive: true,
        },
      });

      revalidatePath('/admin/coupons');
      revalidatePath('/admin/products');
      revalidatePath('/checkout');

      return {
        success: true,
        message: `Coupon "${code}" (${input.discountPercentage}% OFF) created successfully.`,
      };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create coupon.',
    };
  }
}

/**
 * Admin: Toggle coupon active/inactive status
 */
export async function toggleCouponStatus(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      const coupon = await prisma.coupon.findUnique({ where: { id } });
      if (!coupon) return { success: false, error: 'Coupon not found.' };

      const updated = await prisma.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
      });

      revalidatePath('/admin/coupons');
      return {
        success: true,
        message: `Coupon "${updated.code}" is now ${updated.isActive ? 'Active' : 'Disabled'}.`,
      };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update coupon status.',
    };
  }
}

/**
 * Admin: Delete a coupon
 */
export async function deleteCoupon(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      await prisma.coupon.delete({ where: { id } });
      revalidatePath('/admin/coupons');
      return { success: true, message: 'Coupon deleted successfully.' };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete coupon.',
    };
  }
}
