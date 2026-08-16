// actions/analytics.ts
'use server';

import { prisma, withDbRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface DashboardKPIData {
  totalRevenue: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  lowStockItemsCount: number;
  pendingFulfillmentCount: number;
}

export interface MonthlyRevenueDataPoint {
  month: string;
  grossSales: number;
  netProfit: number;
  orders: number;
}

export interface CategorySalesDistribution {
  categoryName: string;
  totalUnitsSold: number;
  revenue: number;
}

export interface AdminDashboardData {
  kpi: DashboardKPIData;
  monthlyRevenue: MonthlyRevenueDataPoint[];
  categoryDistribution: CategorySalesDistribution[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    itemsCount: number;
    createdAt: Date;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: AdminDashboardData;
  error?: string;
}

export async function getAdminDashboardAnalytics(): Promise<AnalyticsResponse> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      // 1. KPI Aggregations
      const [
        totalOrdersCount,
        pendingOrdersCount,
        totalCustomersCount,
        allSuccessfulPayments,
        lowStockVariantsCount,
        recentOrdersRaw,
        orderItemsRaw,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({
          where: {
            status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
          },
        }),
        prisma.user.count(),
        prisma.payment.findMany({
          where: { status: PaymentStatus.SUCCEEDED },
          select: { amount: true, fee: true, netAmount: true, createdAt: true },
        }),
        prisma.productVariant.count({
          where: { stockQuantity: { lte: 5 } },
        }),
        prisma.order.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            payment: { select: { paymentMethod: true } },
            items: { select: { quantity: true } },
          },
        }),
        prisma.orderItem.findMany({
          where: {
            order: { paymentStatus: PaymentStatus.SUCCEEDED },
          },
          include: {
            variant: {
              include: {
                product: {
                  include: { category: true },
                },
              },
            },
          },
        }),
      ]);

      // Calculate Revenue Totals
      const totalRevenue = allSuccessfulPayments.reduce((acc, curr) => acc + curr.amount, 0);
      const totalFees = allSuccessfulPayments.reduce((acc, curr) => acc + curr.fee, 0);
      const netRevenue = totalRevenue - totalFees;
      const successfulOrderCount = allSuccessfulPayments.length;
      const averageOrderValue =
        successfulOrderCount > 0 ? Math.round((totalRevenue / successfulOrderCount) * 100) / 100 : 0;

      // 2. Build 6-Month Rolling Revenue Timeline
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyMap = new Map<string, { gross: number; net: number; count: number }>();

      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[d.getMonth()]}${d.getFullYear()}`;
        monthlyMap.set(key, { gross: 0, net: 0, count: 0 });
      }

      allSuccessfulPayments.forEach((p) => {
        const d = new Date(p.createdAt);
        const key = `${monthNames[d.getMonth()]}${d.getFullYear()}`;
        if (monthlyMap.has(key)) {
          const current = monthlyMap.get(key)!;
          current.gross += p.amount;
          current.net += p.netAmount;
          current.count += 1;
        }
      });

      const monthlyRevenue: MonthlyRevenueDataPoint[] = Array.from(monthlyMap.entries()).map(
        ([month, data]) => ({
          month,
          grossSales: Number(data.gross.toFixed(2)),
          netProfit: Number(data.net.toFixed(2)),
          orders: data.count,
        })
      );

      // 3. Category Sales Distribution
      const categoryMap = new Map<string, { units: number; revenue: number }>();

      orderItemsRaw.forEach((item) => {
        const catName = item.variant.product.category.name || 'Uncategorized';
        const current = categoryMap.get(catName) || { units: 0, revenue: 0 };
        current.units += item.quantity;
        current.revenue += item.total;
        categoryMap.set(catName, current);
      });

      const categoryDistribution: CategorySalesDistribution[] = Array.from(categoryMap.entries()).map(
        ([categoryName, data]) => ({
          categoryName,
          totalUnitsSold: data.units,
          revenue: Number(data.revenue.toFixed(2)),
        })
      );

      // 4. Formatted Recent Orders
      const recentOrders = recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.payment?.paymentMethod || 'STRIPE',
        itemsCount: o.items.reduce((acc, curr) => acc + curr.quantity, 0),
        createdAt: o.createdAt,
      }));

      return {
        success: true,
        data: {
          kpi: {
            totalRevenue: Number(totalRevenue.toFixed(2)),
            netRevenue: Number(netRevenue.toFixed(2)),
            totalOrders: totalOrdersCount,
            averageOrderValue,
            totalCustomers: totalCustomersCount,
            lowStockItemsCount: lowStockVariantsCount,
            pendingFulfillmentCount: pendingOrdersCount,
          },
          monthlyRevenue,
          categoryDistribution,
          recentOrders,
        },
      };
    });
  } catch (error) {
    console.error('[ACTIONS_GET_ADMIN_ANALYTICS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate analytics.',
    };
  }
}