// app/api/checkout/intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { z } from 'zod';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || '';

const stripe = new Stripe(stripeSecretKey, {
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
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Stripe Configuration
    if (
      !stripeSecretKey ||
      (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_'))
    ) {
      console.error('[STRIPE_CONFIG_ERROR]: Invalid or missing STRIPE_SECRET_KEY in environment variables.');
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe API key is misconfigured. Ensure STRIPE_SECRET_KEY in .env starts with sk_test_',
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const validatedData = checkoutIntentSchema.parse(body);

    // 2. Resolve every cart item to a live database ProductVariant record
    const resolvedItems: Array<{
      variant: {
        id: string;
        sku: string;
        size: string;
        colorName: string;
        priceOffset: number;
        stockQuantity: number;
        product: {
          id: string;
          title: string;
          basePrice: number;
          discountPercentage: number;
        };
      };
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const item of validatedData.items) {
      let matchedVariant = null;

      if (item.variantId) {
        matchedVariant = await prisma.productVariant.findFirst({
          where: {
            OR: [{ id: item.variantId }, { sku: item.variantId }],
          },
          include: { product: true },
        });
      }

      if (!matchedVariant && item.productId) {
        matchedVariant = await prisma.productVariant.findFirst({
          where: {
            OR: [
              { productId: item.productId },
              { product: { slug: item.productId } },
            ],
            ...(item.size ? { size: { equals: item.size, mode: 'insensitive' } } : {}),
            ...(item.color ? { colorName: { equals: item.color, mode: 'insensitive' } } : {}),
          },
          include: { product: true },
        });
      }

      if (!matchedVariant && item.productId) {
        matchedVariant = await prisma.productVariant.findFirst({
          where: {
            OR: [
              { productId: item.productId },
              { product: { slug: item.productId } },
            ],
          },
          include: { product: true },
        });
      }

      if (!matchedVariant) {
        return NextResponse.json(
          {
            success: false,
            error: 'One or more selected items are unavailable in the catalog. Please refresh your cart.',
          },
          { status: 400 }
        );
      }

      if (matchedVariant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${matchedVariant.product.title}". Only ${matchedVariant.stockQuantity} remaining.`,
          },
          { status: 400 }
        );
      }

      const basePlusOffset = matchedVariant.product.basePrice + matchedVariant.priceOffset;
      const discount = matchedVariant.product.discountPercentage || 0;
      const verifiedUnitPrice =
        discount > 0 ? basePlusOffset * (1 - discount / 100) : basePlusOffset;

      resolvedItems.push({
        variant: matchedVariant,
        quantity: item.quantity,
        unitPrice: Math.round(verifiedUnitPrice * 100) / 100,
      });
    }

    // 3. Compute verified financial totals
    const subtotal = resolvedItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );
    const shippingFee = subtotal > 200 ? 0 : 15;
    const total = Math.round((subtotal + shippingFee) * 100) / 100;
    const totalAmountInCents = Math.round(total * 100);

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Pre-fetch user verification OUTSIDE the transaction to avoid holding locks
    let userConnectInput: Prisma.UserCreateNestedOneWithoutOrdersInput | undefined = undefined;

    if (validatedData.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: { id: true },
      });
      if (userExists) {
        userConnectInput = {
          connect: { id: userExists.id },
        };
      }
    }

    const orderCreateData: Prisma.OrderCreateInput = {
      orderNumber,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      shippingAddress: validatedData.shippingAddress,
      subtotal,
      shippingFee,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      ...(userConnectInput ? { user: userConnectInput } : {}),
      items: {
        create: resolvedItems.map((item) => ({
          title: item.variant.product.title,
          size: item.variant.size,
          color: item.variant.colorName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: Math.round(item.unitPrice * item.quantity * 100) / 100,
          variant: {
            connect: {
              id: item.variant.id,
            },
          },
        })),
      },
    };

    // 5. Execute transactional write with explicit timeout options (20 seconds)
    const order = await prisma.$transaction(
      async (tx) => {
        return await tx.order.create({
          data: orderCreateData,
        });
      },
      {
        maxWait: 10000, // Maximum time to wait to acquire connection: 10s
        timeout: 20000, // Maximum time for transaction execution: 20s
      }
    );

    // 6. Initialize Stripe PaymentIntent with signed Order metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: validatedData.customerEmail,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Validation failed.' },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error('[STRIPE_ERROR]:', error.message);
      return NextResponse.json(
        { success: false, error: `Stripe Payment Gateway Error: ${error.message}` },
        { status: 400 }
      );
    }

    console.error('[API_CHECKOUT_INTENT_ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected server error occurred during checkout.',
      },
      { status: 500 }
    );
  }
}