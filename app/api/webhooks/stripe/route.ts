// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma, withDbRetry } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('[STRIPE_WEBHOOK_ERROR]: Missing signature or STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('[STRIPE_WEBHOOK_VERIFY_ERROR]:', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // 1. Payment Succeeded (Reconcile Order & Deduct Stock Permanently)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await withDbRetry(async () => {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order && order.paymentStatus !== PaymentStatus.SUCCEEDED) {
            await prisma.$transaction(async (tx) => {
              // Decrement variant stock permanently
              for (const item of order.items) {
                const variant = await tx.productVariant.findUnique({
                  where: { id: item.variantId },
                });

                if (variant) {
                  await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                      stockQuantity: {
                        decrement: Math.min(variant.stockQuantity, item.quantity),
                      },
                    },
                  });
                }
              }

              // Fee calculation (2.9% + $0.30)
              const fee = Number((order.total * 0.029 + 0.3).toFixed(2));
              const netAmount = Number((order.total - fee).toFixed(2));

              await tx.order.update({
                where: { id: orderId },
                data: {
                  status: OrderStatus.PROCESSING,
                  paymentStatus: PaymentStatus.SUCCEEDED,
                  expiresAt: null, // Clear 30-minute timer
                },
              });

              await tx.payment.updateMany({
                where: { orderId },
                data: {
                  status: PaymentStatus.SUCCEEDED,
                  stripePaymentIntentId: paymentIntent.id,
                  fee,
                  netAmount,
                },
              });
            });
          }
        });

        revalidatePath('/admin/orders');
        revalidatePath('/admin/payments');
        revalidatePath('/shop');
      }
    }

    // 2. Payment Cancelled / Expired (Release Stock & Cancel Order)
    if (
      event.type === 'payment_intent.canceled' ||
      event.type === 'payment_intent.payment_failed'
    ) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await withDbRetry(async () => {
          await prisma.order.updateMany({
            where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
            data: {
              status: OrderStatus.CANCELLED,
              paymentStatus: PaymentStatus.FAILED,
            },
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_HANDLER_ERROR]:', error);
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 });
  }
}