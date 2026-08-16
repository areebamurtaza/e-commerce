// actions/analytics.ts
'use server';

import { prisma, withDbRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import {
  DashboardMetric,
  RevenueChartData,
  SalesByCategoryData,
  RecentOrder,
  PaymentMethodType,
} from '@/types/admin';

export interface AdminDashboardData {
  metrics: {
    totalRevenue: DashboardMetric;
    monthlyRecurring: DashboardMetric;
    activeUsers: DashboardMetric;
    customerGrowth: DashboardMetric;
  };
  revenueChart: RevenueChartData[];
  categoryChart: SalesByCategoryData[];
  recentOrders: RecentOrder[];
}

export interface AdminAnalyticsResponse {
  success: boolean;
  data?: AdminDashboardData;
  error?: string;
}

export async function getAdminDashboardData(): Promise<AdminAnalyticsResponse> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // 1. Parallel Database Queries with cold-start resilience
      const [
        currentMonthCompletedOrders,
        prevMonthCompletedOrders,
        totalUsersCount,
        prevUsersCount,
        allCompletedOrders,
        recentOrdersRaw,
        categories,
      ] = await Promise.all([
        // Current 30-day gross
        prisma.order.aggregate({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            paymentStatus: PaymentStatus.SUCCEEDED,
          },
          _sum: { total: true },
          _count: { id: true },
        }),
        // Previous 30-day gross for percentage delta
        prisma.order.aggregate({
          where: {
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            paymentStatus: PaymentStatus.SUCCEEDED,
          },
          _sum: { total: true },
          _count: { id: true },
        }),
        // Total verified customer accounts
        prisma.user.count(),
        // Prior customer count
        prisma.user.count({
          where: { createdAt: { lt: thirtyDaysAgo } },
        }),
        // Successful orders for time-series chart plotting
        prisma.order.findMany({
          where: { paymentStatus: PaymentStatus.SUCCEEDED },
          select: { total: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        // Top 5 recent orders for dashboard table
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true, imageUrl: true } },
            payment: { select: { paymentMethod: true } },
            items: { select: { quantity: true } },
          },
        }),
        // Category / Style revenue distribution
        prisma.category.findMany({
          include: {
            products: {
              include: {
                variants: {
                  include: {
                    orderItems: {
                      where: { order: { paymentStatus: PaymentStatus.SUCCEEDED } },
                      select: { total: true },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

      // 2. Metric Calculations
      const currentRev = currentMonthCompletedOrders._sum.total || 0;
      const prevRev = prevMonthCompletedOrders._sum.total || 0;
      const revDelta = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : currentRev > 0 ? 100 : 0;
      const userDelta = prevUsersCount > 0 ? ((totalUsersCount - prevUsersCount) / prevUsersCount) * 100 : totalUsersCount > 0 ? 100 : 0;

      const completedOrdersCount = currentMonthCompletedOrders._count.id || 0;
      const prevOrdersCount = prevMonthCompletedOrders._count.id || 0;
      const ordersDelta = prevOrdersCount > 0 ? ((completedOrdersCount - prevOrdersCount) / prevOrdersCount) * 100 : completedOrdersCount > 0 ? 100 : 0;

      const metrics = {
        totalRevenue: {
          title: 'Total Gross Revenue',
          value: `$${currentRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: Number(revDelta.toFixed(1)),
          trend: (revDelta >= 0 ? 'up' : 'down') as 'up' | 'down',
          description: 'Compared to previous 30 days',
        },
        monthlyRecurring: {
          title: 'Monthly Volume',
          value: `$${currentRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: Number(revDelta.toFixed(1)),
          trend: (revDelta >= 0 ? 'up' : 'down') as 'up' | 'down',
          description: 'Current 30d gross sales',
        },
        activeUsers: {
          title: 'Active Users',
          value: totalUsersCount.toLocaleString(),
          change: Number(userDelta.toFixed(1)),
          trend: (userDelta >= 0 ? 'up' : 'down') as 'up' | 'down',
          description: 'Registered customer accounts',
        },
        customerGrowth: {
          title: 'Order Conversion',
          value: `${completedOrdersCount} Orders`,
          change: Number(ordersDelta.toFixed(1)),
          trend: (ordersDelta >= 0 ? 'up' : 'down') as 'up' | 'down',
          description: 'Net settled transactions',
        },
      };

      // 3. Generate Continuous 30-Day Revenue Trend Map
      const revenueMap = new Map<string, { revenue: number; orders: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        revenueMap.set(key, { revenue: 0, orders: 0 });
      }

      allCompletedOrders.forEach((o) => {
        const key = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (revenueMap.has(key)) {
          const entry = revenueMap.get(key)!;
          entry.revenue += o.total;
          entry.orders += 1;
        }
      });

      const revenueChart: RevenueChartData[] = Array.from(revenueMap.entries()).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
        refunds: 0,
      }));

      // 4. Sales Distribution by Category
      let grossCategorySales = 0;
      const rawCategories = categories.map((cat) => {
        let sales = 0;
        cat.products.forEach((p) => {
          p.variants.forEach((v) => {
            v.orderItems.forEach((item) => {
              sales += item.total;
            });
          });
        });
        grossCategorySales += sales;
        return { category: cat.name, sales };
      });

      const categoryChart: SalesByCategoryData[] = rawCategories.map((c) => ({
        category: c.category,
        sales: Math.round(c.sales * 100) / 100,
        percentage: grossCategorySales > 0 ? Math.round((c.sales / grossCategorySales) * 100) : 0,
      }));

      // Fallback distribution if no category items purchased yet
      const finalCategoryChart =
        categoryChart.length > 0
          ? categoryChart
          : [
              { category: 'Casual', sales: 0, percentage: 25 },
              { category: 'Formal', sales: 0, percentage: 25 },
              { category: 'Party', sales: 0, percentage: 25 },
              { category: 'Gym', sales: 0, percentage: 25 },
            ];

      // 5. Format Recent Orders
      const recentOrders: RecentOrder[] = recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: {
          name: o.customerName || o.user?.name || 'Guest Customer',
          email: o.customerEmail || o.user?.email || 'N/A',
          avatarUrl: o.user?.imageUrl || undefined,
        },
        totalAmount: o.total,
        status: o.status as OrderStatus,
        paymentStatus: o.paymentStatus as RecentOrder['paymentStatus'],
        paymentMethod: (o.payment?.paymentMethod ?? 'STRIPE') as PaymentMethodType,
        itemsCount: o.items.reduce((acc, item) => acc + item.quantity, 0),
        createdAt: new Date(o.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));

      return {
        success: true,
        data: {
          metrics,
          revenueChart,
          categoryChart: finalCategoryChart,
          recentOrders,
        },
      };
    });
  } catch (error) {
    console.error('[GET_ADMIN_DASHBOARD_DATA_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve analytics data.',
    };
  }
}