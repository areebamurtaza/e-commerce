// app/api/checkout/intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/ratelimit';
import { stripe } from '@/lib/stripe';
import { ORDER_CONFIG, validatePromoCode, PRISMA_TX_OPTIONS } from '@/lib/constants';
import { validateCouponCode } from '@/actions/coupon';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Extends Next.js Serverless execution limit to 60 seconds (prevents gateway timeouts)
export const maxDuration = 60;

const checkoutIntentSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, 'Variant ID is required'),
        productId: z.string().min(1, 'Product ID is required'),
        size: z.string().min(1, 'Size is required'),
        color: z.string().min(1, 'Color is required'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'Cart cannot be empty'),
  customerName: z.string().trim().min(2, 'Customer name is required'),
  customerEmail: z.string().trim().email('Valid email address is required'),
  shippingAddress: z.string().trim().min(5, 'Valid shipping address is required'),
  userId: z.string().optional().nullable(),
  promoCode: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding Window Rate Limiter
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : realIp || '127.0.0.1';

    const rateLimit = await checkRateLimit(
      `checkout-intent:${clientIp}`,
      ORDER_CONFIG.CHECKOUT_RATE_LIMIT_MAX,
      ORDER_CONFIG.CHECKOUT_RATE_LIMIT_WINDOW_SECONDS
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many checkout attempts. Please wait a moment before trying again.',
        },
        { status: 429 }
      );
    }

    // 2. Safe JSON Parsing
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload in request body.' },
        { status: 400 }
      );
    }

    // 3. Schema Validation
    const validation = checkoutIntentSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Invalid checkout payload.',
        },
        { status: 400 }
      );
    }

    const { items, customerName, customerEmail, shippingAddress, userId, promoCode } =
      validation.data;

    return await withDbRetry(async () => {
      // 4. Fetch live database variants to verify pricing and stock
      const variantIds = items.map((i) => i.variantId);
      const dbVariants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              basePrice: true,
              discountPercentage: true,
            },
          },
        },
      });

      if (dbVariants.length !== items.length) {
        return NextResponse.json(
          {
            success: false,
            error: 'One or more items in your cart are no longer available.',
          },
          { status: 400 }
        );
      }

      // Check stock availability
      for (const item of items) {
        const matchedVariant = dbVariants.find((v) => v.id === item.variantId);
        if (!matchedVariant) {
          return NextResponse.json(
            { success: false, error: `Item variant not found.` },
            { status: 400 }
          );
        }
        if (matchedVariant.stockQuantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for "${matchedVariant.product.title}" (${matchedVariant.size} / ${matchedVariant.colorName}). Only ${matchedVariant.stockQuantity} available.`,
            },
            { status: 400 }
          );
        }
      }

      // 5. Calculate Server-Side Subtotal, Discount & Shipping
      let calculatedSubtotal = 0;
      let calculatedProductDiscount = 0;

      const orderItemsData = items.map((item) => {
        const variant = dbVariants.find((v) => v.id === item.variantId)!;
        const originalUnitPrice = variant.product.basePrice + variant.priceOffset;
        const discountPercentage = variant.product.discountPercentage || 0;
        const unitPrice =
          discountPercentage > 0
            ? Number((originalUnitPrice * (1 - discountPercentage / 100)).toFixed(2))
            : originalUnitPrice;

        const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
        const lineOriginalTotal = Number((originalUnitPrice * item.quantity).toFixed(2));

        calculatedSubtotal += lineOriginalTotal;
        calculatedProductDiscount += lineOriginalTotal - lineTotal;

        return {
          variantId: variant.id,
          title: variant.product.title,
          size: variant.size,
          color: variant.colorName,
          unitPrice,
          quantity: item.quantity,
          total: lineTotal,
        };
      });

      calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));
      calculatedProductDiscount = Number(calculatedProductDiscount.toFixed(2));

      // Calculate Promo Code / Dynamic Coupon Discount
      let promoDiscountAmount = 0;
      let appliedPromoCode: string | null = null;
      if (promoCode) {
        const discountedSubtotal = Math.max(0, calculatedSubtotal - calculatedProductDiscount);
        const couponValidation = await validateCouponCode(promoCode, discountedSubtotal);
        if (couponValidation.valid && couponValidation.discountAmount !== undefined) {
          appliedPromoCode = couponValidation.code || promoCode.toUpperCase();
          promoDiscountAmount = couponValidation.discountAmount;
        }
      }

      const totalDiscount = Number(
        (calculatedProductDiscount + promoDiscountAmount).toFixed(2)
      );
      const deliveryFee =
        calculatedSubtotal > ORDER_CONFIG.FREE_SHIPPING_THRESHOLD
          ? 0
          : ORDER_CONFIG.STANDARD_SHIPPING_FEE;
      const grandTotal = Number(
        Math.max(0, calculatedSubtotal - totalDiscount + deliveryFee).toFixed(2)
      );

      // 6. Dynamic Expiration Calculation based on ORDER_CONFIG
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const reservationExpiresAt = new Date(
        Date.now() + ORDER_CONFIG.RESERVATION_EXPIRY_MINUTES * 60 * 1000
      );

      // 7. Atomic Database Transaction with Timeout
      const createdOrder = await prisma.$transaction(
        async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNumber,
              userId: userId || null,
              customerName,
              customerEmail,
              shippingAddress,
              subtotal: calculatedSubtotal,
              discount: totalDiscount,
              shippingFee: deliveryFee,
              total: grandTotal,
              status: OrderStatus.PENDING,
              paymentStatus: PaymentStatus.PENDING,
              expiresAt: reservationExpiresAt,
              items: {
                create: orderItemsData,
              },
            },
          });

          await tx.payment.create({
            data: {
              orderId: order.id,
              paymentMethod: PaymentMethod.STRIPE,
              status: PaymentStatus.PENDING,
              amount: grandTotal,
              fee: 0,
              netAmount: grandTotal,
            },
          });

          return order;
        },
        PRISMA_TX_OPTIONS
      );

      // 8. Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(grandTotal * 100),
        currency: 'usd',
        receipt_email: customerEmail,
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          customerEmail,
          userId: userId || '',
        },
      });

      await prisma.payment.update({
        where: { orderId: createdOrder.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      return NextResponse.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          expiresAt: reservationExpiresAt.toISOString(),
          reservationMinutes: ORDER_CONFIG.RESERVATION_EXPIRY_MINUTES,
          total: grandTotal,
        },
        message: 'Order reservation created successfully.',
      });
    });
  } catch (error) {
    console.error('[CHECKOUT_INTENT_ROUTE_ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initialize checkout gateway.',
      },
      { status: 500 }
    );
  }
}