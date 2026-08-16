// app/api/cron/cleanup-expired-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    // Authorize with CRON_SECRET header to prevent unauthorized hits
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const now = new Date();

    const expiredOrders = await withDbRetry(async () => {
      // Find orders pending payment where 30-minute timer passed
      const orders = await prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          expiresAt: { lte: now },
        },
        select: { id: true, orderNumber: true },
      });

      if (orders.length === 0) return [];

      const orderIds = orders.map((o) => o.id);

      await prisma.$transaction([
        prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.FAILED,
          },
        }),
        prisma.payment.updateMany({
          where: { orderId: { in: orderIds } },
          data: {
            status: PaymentStatus.FAILED,
          },
        }),
      ]);

      return orders;
    });

    if (expiredOrders.length > 0) {
      revalidatePath('/admin/orders');
      revalidatePath('/admin/payments');
      revalidatePath('/shop');
    }

    return NextResponse.json({
      success: true,
      cleanedOrdersCount: expiredOrders.length,
      orders: expiredOrders.map((o) => o.orderNumber),
    });
  } catch (error) {
    console.error('[CRON_CLEANUP_EXPIRED_ORDERS_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup expired orders' },
      { status: 500 }
    );
  }
}