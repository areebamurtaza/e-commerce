// app/admin/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { getAdminDashboardAnalytics } from '@/actions/analytics';
import { verifyAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Operations Control | SHOP.CO',
  description: 'Live performance metrics, fulfillment queues, and financial analytics.',
};

export default async function AdminDashboardOverviewPage() {
  await verifyAdmin();
  const analyticsRes = await getAdminDashboardAnalytics();

  const data = analyticsRes.data || {
    kpi: {
      totalRevenue: 0,
      netRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      lowStockItemsCount: 0,
      pendingFulfillmentCount: 0,
    },
    monthlyRevenue: [],
    categoryDistribution: [],
    recentOrders: [],
  };

  const { kpi, recentOrders, monthlyRevenue, categoryDistribution } = data;

  return (
    <div className="space-y-8 font-satoshi text-black dark:text-white pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-integral font-bold text-2xl sm:text-3xl uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-black/60 dark:text-zinc-400 mt-1">
            Real-time financial performance, stock alerts, and fulfillment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="rounded-[62px] text-xs h-9">
            <Link href="/admin/orders">Manage Orders</Link>
          </Button>
          <Button asChild size="sm" className="rounded-[62px] text-xs h-9 bg-black text-white dark:bg-white dark:text-black">
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-black/60 dark:text-zinc-400 uppercase tracking-wider">
              Gross Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign size={16} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono">
              ${kpi.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-black/50 dark:text-zinc-400 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-600" />
              <span>Net profit: ${kpi.netRevenue.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-black/60 dark:text-zinc-400 uppercase tracking-wider">
              Total Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingBag size={16} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono">{kpi.totalOrders}</div>
            <p className="text-[11px] text-black/50 dark:text-zinc-400">
              Avg. Order: ${kpi.averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-black/60 dark:text-zinc-400 uppercase tracking-wider">
              Pending Fulfillment
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {kpi.pendingFulfillmentCount}
            </div>
            <p className="text-[11px] text-black/50 dark:text-zinc-400">
              Awaiting dispatch/collection
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-black/60 dark:text-zinc-400 uppercase tracking-wider">
              Low Stock Variants
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle size={16} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {kpi.lowStockItemsCount}
            </div>
            <p className="text-[11px] text-black/50 dark:text-zinc-400">
              Items with $\le 5$ units remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-zinc-800">
            <h2 className="font-bold text-lg text-black dark:text-white">
              Recent Transactions
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <Link href="/admin/orders" className="flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </Button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-black/5 dark:divide-zinc-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-black/60 dark:text-zinc-400 truncate">
                      {order.customerName} ({order.customerEmail}) • {order.itemsCount} items
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm">${order.total.toFixed(2)}</div>
                    <span className="text-[10px] text-black/40 dark:text-zinc-500 uppercase">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black/50 dark:text-zinc-500 text-center py-8">
              No orders recorded yet.
            </p>
          )}
        </div>

        {/* Category Sales Distribution Breakdown */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-lg text-black dark:text-white pb-3 border-b border-black/10 dark:border-zinc-800">
            Top Categories
          </h2>

          {categoryDistribution.length > 0 ? (
            <div className="space-y-3.5">
              {categoryDistribution.map((cat) => (
                <div key={cat.categoryName} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{cat.categoryName}</span>
                    <span className="font-mono">${cat.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-black/50 dark:text-zinc-400">
                    <span>{cat.totalUnitsSold} units sold</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black/50 dark:text-zinc-500 text-center py-8">
              No category sales data yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}