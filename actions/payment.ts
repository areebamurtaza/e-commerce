// actions/payment.ts
'use server';

import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';

export interface PaymentAnalyticsSummary {
  grossVolume: number;
  netRevenue: number;
  totalFees: number;
  refundedAmount: number;
  successfulTransactionsCount: number;
  failedTransactionsCount: number;
  refundRatePercentage: number;
  averageOrderValue: number;
}

export interface RevenueChartDataPoint {
  date: string;
  gross: number;
  net: number;
  fees: number;
}

export interface PaymentAnalyticsResponse {
  success: boolean;
  summary?: PaymentAnalyticsSummary;
  chartData?: RevenueChartDataPoint[];
  error?: string;
}

export interface TransactionFilterParams {
  search?: string;
  status?: PaymentStatus | 'ALL';
  paymentMethod?: PaymentMethod | 'ALL';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface TransactionItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod | string;
  stripePaymentIntentId: string | null;
  createdAt: Date;
}

export interface TransactionListResponse {
  success: boolean;
  transactions: TransactionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * Retrieves aggregate financial analytics for the admin revenue dashboard
 */
export async function getPaymentAnalytics(days: number = 30): Promise<PaymentAnalyticsResponse> {
  try {
    await verifyAdmin();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [allPayments, periodPayments] = await Promise.all([
      prisma.payment.findMany({
        select: {
          amount: true,
          fee: true,
          netAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          amount: true,
          fee: true,
          netAmount: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Aggregate lifetime / period totals
    let grossVolume = 0;
    let totalFees = 0;
    let netRevenue = 0;
    let refundedAmount = 0;
    let successfulTransactionsCount = 0;
    let failedTransactionsCount = 0;

    for (const p of allPayments) {
      if (p.status === PaymentStatus.SUCCEEDED) {
        grossVolume += p.amount;
        const calculatedFee = p.fee > 0 ? p.fee : p.amount * 0.029 + 0.3;
        totalFees += calculatedFee;
        netRevenue += p.netAmount > 0 ? p.netAmount : p.amount - calculatedFee;
        successfulTransactionsCount += 1;
      } else if (p.status === PaymentStatus.REFUNDED) {
        refundedAmount += p.amount;
      } else if (p.status === PaymentStatus.FAILED) {
        failedTransactionsCount += 1;
      }
    }

    const refundRatePercentage =
      successfulTransactionsCount > 0 ? (refundedAmount / grossVolume) * 100 : 0;
    const averageOrderValue =
      successfulTransactionsCount > 0 ? grossVolume / successfulTransactionsCount : 0;

    // Time-series breakdown for chart visualization
    const dailyMap = new Map<string, { gross: number; net: number; fees: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap.set(dateKey, { gross: 0, net: 0, fees: 0 });
    }

    for (const p of periodPayments) {
      if (p.status === PaymentStatus.SUCCEEDED) {
        const dateKey = new Date(p.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const current = dailyMap.get(dateKey) || { gross: 0, net: 0, fees: 0 };
        const fee = p.fee > 0 ? p.fee : p.amount * 0.029 + 0.3;
        const net = p.netAmount > 0 ? p.netAmount : p.amount - fee;

        dailyMap.set(dateKey, {
          gross: current.gross + p.amount,
          net: current.net + net,
          fees: current.fees + fee,
        });
      }
    }

    const chartData: RevenueChartDataPoint[] = Array.from(dailyMap.entries()).map(
      ([date, vals]) => ({
        date,
        gross: Number(vals.gross.toFixed(2)),
        net: Number(vals.net.toFixed(2)),
        fees: Number(vals.fees.toFixed(2)),
      })
    );

    return {
      success: true,
      summary: {
        grossVolume: Number(grossVolume.toFixed(2)),
        netRevenue: Number(netRevenue.toFixed(2)),
        totalFees: Number(totalFees.toFixed(2)),
        refundedAmount: Number(refundedAmount.toFixed(2)),
        successfulTransactionsCount,
        failedTransactionsCount,
        refundRatePercentage: Number(refundRatePercentage.toFixed(2)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
      },
      chartData,
    };
  } catch (error) {
    console.error('[ACTIONS_GET_PAYMENT_ANALYTICS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate payment analytics.',
    };
  }
}

/**
 * Retrieves paginated, filterable payment transactions
 */
export async function getPaymentTransactions(
  params: TransactionFilterParams = {}
): Promise<TransactionListResponse> {
  try {
    await verifyAdmin();

    const {
      search = '',
      status = 'ALL',
      paymentMethod = 'ALL',
      page = 1,
      limit = 15,
    } = params;

    const skip = Math.max(0, (page - 1) * limit);

    const where: Prisma.PaymentWhereInput = {
      AND: [
        status !== 'ALL' ? { status: status as PaymentStatus } : {},
        paymentMethod !== 'ALL' ? { paymentMethod: paymentMethod as PaymentMethod } : {},
        search.trim()
          ? {
              OR: [
                { stripePaymentIntentId: { contains: search.trim(), mode: 'insensitive' } },
                {
                  order: {
                    OR: [
                      { orderNumber: { contains: search.trim(), mode: 'insensitive' } },
                      { customerName: { contains: search.trim(), mode: 'insensitive' } },
                      { customerEmail: { contains: search.trim(), mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [total, rawPayments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              orderNumber: true,
              customerName: true,
              customerEmail: true,
            },
          },
        },
      }),
    ]);

    const transactions: TransactionItem[] = rawPayments.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order?.orderNumber || 'N/A',
      customerName: p.order?.customerName || 'Guest Customer',
      customerEmail: p.order?.customerEmail || 'No Email',
      amount: p.amount,
      fee: p.fee > 0 ? p.fee : Number((p.amount * 0.029 + 0.3).toFixed(2)),
      netAmount:
        p.netAmount > 0 ? p.netAmount : Number((p.amount - (p.amount * 0.029 + 0.3)).toFixed(2)),
      status: p.status,
      paymentMethod: p.paymentMethod,
      stripePaymentIntentId: p.stripePaymentIntentId,
      createdAt: p.createdAt,
    }));

    return {
      success: true,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error('[ACTIONS_GET_PAYMENT_TRANSACTIONS_ERROR]:', error);
    return {
      success: false,
      transactions: [],
      pagination: { total: 0, page: 1, limit: 15, totalPages: 1 },
      error: error instanceof Error ? error.message : 'Failed to retrieve transaction ledger.',
    };
  }
}