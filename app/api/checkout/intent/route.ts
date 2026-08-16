// app/api/checkout/intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import Stripe from 'stripe';
import { z } from 'zod';
import { OrderStatus, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { checkoutRateLimiter, checkIdempotency } from '@/lib/ratelimit';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

const checkoutItemSchema = z.object({
  variantId: z.string().optional(),
  productId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

const checkoutIntentSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  userId: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP / User Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success: rateLimitPassed } = await checkoutRateLimiter.limit(ip);

    if (!rateLimitPassed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many checkout attempts. Please wait 1 minute before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = checkoutIntentSchema.parse(body);

    // 2. Prevent Double Clicks / Duplicate Orders via Idempotency Key
    if (validatedData.idempotencyKey) {
      const isUniqueRequest = await checkIdempotency(validatedData.idempotencyKey);
      if (!isUniqueRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'An order request is already processing. Please check your screen.',
          },
          { status: 409 }
        );
      }
    }

    // 3. Parallel Database Product Variant Lookups
    const variantLookups = await Promise.all(
      validatedData.items.map(async (item) => {
        let matchedVariant = null;

        if (item.variantId) {
          matchedVariant = await prisma.productVariant.findFirst({
            where: {
              OR: [{ id: item.variantId }, { sku: item.variantId }],
            },
            include: {
              product: {
                select: { id: true, title: true, basePrice: true, discountPercentage: true },
              },
            },
          });
        }

        return { item, matchedVariant };
      })
    );

    // 4. Validate Inventory & Calculate Verified Price
    const resolvedItems: Array<{
      variantId: string;
      title: string;
      size: string;
      colorName: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }> = [];

    for (const { item, matchedVariant } of variantLookups) {
      if (!matchedVariant) {
        return NextResponse.json(
          { success: false, error: 'One or more items in your cart are no longer available.' },
          { status: 400 }
        );
      }

      if (matchedVariant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${matchedVariant.product.title}" (${matchedVariant.size}, ${matchedVariant.colorName}). Only ${matchedVariant.stockQuantity} left.`,
          },
          { status: 400 }
        );
      }

      const basePlusOffset = matchedVariant.product.basePrice + matchedVariant.priceOffset;
      const discount = matchedVariant.product.discountPercentage || 0;
      const verifiedUnitPrice =
        discount > 0 ? basePlusOffset * (1 - discount / 100) : basePlusOffset;
      const finalUnitPrice = Math.round(verifiedUnitPrice * 100) / 100;

      resolvedItems.push({
        variantId: matchedVariant.id,
        title: matchedVariant.product.title,
        size: matchedVariant.size,
        colorName: matchedVariant.colorName,
        unitPrice: finalUnitPrice,
        quantity: item.quantity,
        total: Math.round(finalUnitPrice * item.quantity * 100) / 100,
      });
    }

    const subtotal = resolvedItems.reduce((acc, item) => acc + item.total, 0);
    const shippingFee = subtotal > 200 ? 0 : 15;
    const total = Math.round((subtotal + shippingFee) * 100) / 100;
    const totalAmountInCents = Math.round(total * 100);

    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${timestamp}-${randomSuffix}`;

    // 30 Minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 5. Connect User if authenticated
    let userConnectInput: Prisma.UserCreateNestedOneWithoutOrdersInput | undefined = undefined;
    if (validatedData.userId) {
      const userExists = await prisma.user.findFirst({
        where: {
          OR: [{ id: validatedData.userId }, { email: validatedData.customerEmail.toLowerCase() }],
        },
        select: { id: true },
      });
      if (userExists) {
        userConnectInput = { connect: { id: userExists.id } };
      }
    }

    // 6. Create Pending Order with 30-Minute Reservation
    const order = await withDbRetry(async () => {
      return await prisma.order.create({
        data: {
          orderNumber,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          shippingAddress: validatedData.shippingAddress,
          subtotal,
          shippingFee,
          discount: 0,
          total,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          expiresAt,
          ...(userConnectInput ? { user: userConnectInput } : {}),
          items: {
            create: resolvedItems.map((item) => ({
              title: item.title,
              size: item.size,
              color: item.colorName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              total: item.total,
              variant: {
                connect: { id: item.variantId },
              },
            })),
          },
          payment: {
            create: {
              amount: total,
              fee: 0,
              netAmount: total,
              status: PaymentStatus.PENDING,
              paymentMethod: PaymentMethod.STRIPE,
            },
          },
        },
      });
    });

    // 7. Create Stripe PaymentIntent with Order Metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: validatedData.customerEmail,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: validatedData.customerEmail,
        customerName: validatedData.customerName,
      },
    });

    // Link Intent to Payment row
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        expiresAt: order.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Validation failed.' },
        { status: 400 }
      );
    }
    console.error('[API_CHECKOUT_INTENT_ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error initializing checkout.',
      },
      { status: 500 }
    );
  }
}