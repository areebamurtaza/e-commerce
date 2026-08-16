// app/api/cron/cleanup-expired-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    // 1. Validate Cron Secret Authorization Header
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (
      process.env.NODE_ENV === 'production' &&
      (!cronSecret || authHeader !== `Bearer ${cronSecret}`)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Identify expired PENDING orders
    const now = new Date();

    return await withDbRetry(async () => {
      const expiredOrders = await prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          expiresAt: {
            not: null,
            lte: now,
          },
        },
        select: { id: true, orderNumber: true },
      });

      if (expiredOrders.length === 0) {
        return NextResponse.json({
          success: true,
          cleanedOrdersCount: 0,
          orders: [],
          message: 'No expired orders found.',
        });
      }

      const expiredOrderIds = expiredOrders.map((o) => o.id);

      // 3. Batch cancel expired orders
      await prisma.$transaction(
        async (tx) => {
          await tx.order.updateMany({
            where: { id: { in: expiredOrderIds } },
            data: {
              status: OrderStatus.CANCELLED,
              paymentStatus: PaymentStatus.FAILED,
            },
          });

          await tx.payment.updateMany({
            where: { orderId: { in: expiredOrderIds } },
            data: {
              status: PaymentStatus.FAILED,
            },
          });
        },
        { timeout: 15000 }
      );

      revalidatePath('/admin/orders');
      revalidatePath('/shop');

      return NextResponse.json({
        success: true,
        cleanedOrdersCount: expiredOrders.length,
        orders: expiredOrders.map((o) => o.orderNumber),
        message: `Successfully cancelled ${expiredOrders.length} expired orders.`,
      });
    });
  } catch (error) {
    console.error('[CRON_CLEANUP_EXPIRED_ORDERS_ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}