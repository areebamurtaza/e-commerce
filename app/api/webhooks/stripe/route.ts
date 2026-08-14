// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing stripe signature or webhook secret.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error';
    console.error(`❌ Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderNumber = paymentIntent.metadata?.orderNumber;

    if (orderNumber) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Fetch order and its purchased items
          const order = await tx.order.findUnique({
            where: { orderNumber },
            include: { items: true },
          });

          if (!order) {
            console.error(`⚠️ Order not found for webhook: ${orderNumber}`);
            return;
          }

          // 2. Mark order as Processing and Payment as Succeeded
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.PROCESSING,
              paymentStatus: PaymentStatus.SUCCEEDED,
            },
          });

          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: PaymentStatus.SUCCEEDED,
              stripePaymentIntentId: paymentIntent.id,
            },
          });

          // 3. Atomically decrement stock quantities for each variant
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: {
                  decrement: item.quantity,
                },
              },
            });
          }
        });

        console.log(`✅ Order ${orderNumber} successfully fulfilled via Stripe Webhook.`);
      } catch (dbError) {
        console.error(`❌ Database error during order fulfillment:`, dbError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }
  }

  // Handle payment failures
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderNumber = paymentIntent.metadata?.orderNumber;

    if (orderNumber) {
      await prisma.order.updateMany({
        where: { orderNumber },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
        },
      });
      console.warn(`⚠️ Payment failed for order ${orderNumber}`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}