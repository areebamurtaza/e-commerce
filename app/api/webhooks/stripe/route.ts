// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma, withDbRetry } from '@/lib/prisma';
import { ORDER_CONFIG } from '@/lib/constants';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { sendOrderConfirmationEmail, OrderItemEmailPayload } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Extends Serverless execution limit for webhook processing
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!webhookSecret || !stripeSecretKey) {
      console.error('[STRIPE_WEBHOOK_CONFIG_ERROR]: Missing Stripe credentials');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[STRIPE_WEBHOOK_ERROR]: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(
        '[STRIPE_WEBHOOK_VERIFY_ERROR]:',
        err instanceof Error ? err.message : err
      );
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // 1. Payment Succeeded -> Reconcile Order & Deduct Inventory
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const settledOrder = await withDbRetry(async () => {
          return await prisma.$transaction(
            async (tx) => {
              const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
              });

              // Idempotency check: Exit if already processed
              if (!order || order.paymentStatus === PaymentStatus.SUCCEEDED) {
                return null;
              }

              // Deduct stock
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

              const fee = Number(
                (
                  order.total * ORDER_CONFIG.STRIPE_FEE_PERCENT +
                  ORDER_CONFIG.STRIPE_FEE_FIXED
                ).toFixed(2)
              );
              const netAmount = Number((order.total - fee).toFixed(2));

              // Settle Order Status and release reservation lock
              const updated = await tx.order.update({
                where: { id: orderId },
                data: {
                  status: OrderStatus.PROCESSING,
                  paymentStatus: PaymentStatus.SUCCEEDED,
                  expiresAt: null,
                },
                include: { items: true },
              });

              // Settle Payment Record
              await tx.payment.upsert({
                where: { orderId },
                update: {
                  status: PaymentStatus.SUCCEEDED,
                  stripePaymentIntentId: paymentIntent.id,
                  fee,
                  netAmount,
                },
                create: {
                  orderId,
                  status: PaymentStatus.SUCCEEDED,
                  stripePaymentIntentId: paymentIntent.id,
                  amount: order.total,
                  fee,
                  netAmount,
                },
              });

              return updated;
            },
            { timeout: 15000 }
          );
        });

        // Asynchronously dispatch order confirmation email (non-blocking)
        if (settledOrder) {
          try {
            const emailItems: OrderItemEmailPayload[] = settledOrder.items.map((item) => ({
              title: item.title,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            }));

            sendOrderConfirmationEmail({
              toEmail: settledOrder.customerEmail,
              customerName: settledOrder.customerName,
              orderNumber: settledOrder.orderNumber,
              totalAmount: settledOrder.total,
              shippingAddress: settledOrder.shippingAddress,
              subtotal: settledOrder.subtotal,
              shippingFee: settledOrder.shippingFee,
              discount: settledOrder.discount,
              paymentMethod: 'Credit / Debit Card (Stripe Webhook)',
              items: emailItems,
            }).catch((err: unknown) => {
              console.error('[STRIPE_WEBHOOK_EMAIL_BACKGROUND_ERROR]:', err);
            });
          } catch (emailErr: unknown) {
            console.error('[STRIPE_WEBHOOK_EMAIL_DISPATCH_ERROR]:', emailErr);
          }
        }

        revalidatePath('/admin/orders');
        revalidatePath('/admin/payments');
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/shop');
      }
    }

    // 2. Payment Cancelled / Failed -> Cancel Order
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

          await prisma.payment.updateMany({
            where: { orderId, status: PaymentStatus.PENDING },
            data: {
              status: PaymentStatus.FAILED,
              stripePaymentIntentId: paymentIntent.id,
            },
          });
        });

        revalidatePath('/admin/orders');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_HANDLER_ERROR]:', error);
    return NextResponse.json(
      { error: 'Internal webhook error' },
      { status: 500 }
    );
  }
}