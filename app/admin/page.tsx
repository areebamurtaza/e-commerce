// app/admin/page.tsx
import Link from 'next/link';
import { getAdminDashboardData } from '@/actions/analytics';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { RecentOrdersTable } from '@/components/admin/recent-orders-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Download,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard Overview | SHOP.CO Admin',
  description: 'Real-time storefront performance, revenue metrics, and customer analytics.',
};

export default async function AdminDashboardPage() {
  const response = await getAdminDashboardData();

  if (!response.success || !response.data) {
    return (
      <div className="p-6 font-satoshi">
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-bold">Dashboard Synchronization Error</h2>
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {response.error || 'Failed to establish database connection with analytics engine.'}
          </p>
        </div>
      </div>
    );
  }

  const { metrics, revenueChart, categoryChart, recentOrders } = response.data;

  const metricCards = [
    {
      title: metrics.totalRevenue.title,
      value: metrics.totalRevenue.value,
      change: `${metrics.totalRevenue.change >= 0 ? '+' : ''}${metrics.totalRevenue.change}%`,
      trend: metrics.totalRevenue.trend,
      description: metrics.totalRevenue.description,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: metrics.monthlyRecurring.title,
      value: metrics.monthlyRecurring.value,
      change: `${metrics.monthlyRecurring.change >= 0 ? '+' : ''}${metrics.monthlyRecurring.change}%`,
      trend: metrics.monthlyRecurring.trend,
      description: metrics.monthlyRecurring.description,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: metrics.activeUsers.title,
      value: metrics.activeUsers.value,
      change: `${metrics.activeUsers.change >= 0 ? '+' : ''}${metrics.activeUsers.change}%`,
      trend: metrics.activeUsers.trend,
      description: metrics.activeUsers.description,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: metrics.customerGrowth.title,
      value: metrics.customerGrowth.value,
      change: `${metrics.customerGrowth.change >= 0 ? '+' : ''}${metrics.customerGrowth.change}%`,
      trend: metrics.customerGrowth.trend,
      description: metrics.customerGrowth.description,
      icon: ShoppingBag,
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6 font-satoshi text-black dark:text-white pb-10">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-black px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white dark:bg-white dark:text-black">
              LIVE
            </span>
            <h1 className="font-integral text-2xl font-bold uppercase tracking-tight text-black dark:text-white">
              E-COMMERCE DASHBOARD
            </h1>
          </div>
          <p className="mt-1 text-xs text-black/60 dark:text-zinc-400">
            Real-time storefront performance, revenue metrics, and customer analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-[62px] border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-black/70 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
            <span>Audit Cycle 2026</span>
          </div>
          <Button
            asChild
            size="sm"
            className="h-8.5 gap-1.5 rounded-[62px] bg-black px-5 text-xs font-semibold text-white shadow-xs hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            <Link href="/admin/payments/transactions">
              <Download className="h-3.5 w-3.5" /> Export Ledger
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 1: Top 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.trend === 'up';

          return (
            <Card
              key={card.title}
              className="space-y-2 rounded-[20px] border-black/10 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black/60 dark:text-zinc-400">
                  {card.title}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 dark:bg-zinc-800">
                  <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
              </div>

              <p className="font-integral text-2xl font-extrabold text-black dark:text-white">
                {card.value}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span
                  className={`font-semibold ${
                    isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {card.change}
                </span>
                <span className="font-medium text-black/40 dark:text-zinc-500">
                  {card.description}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Row 2: Analytics Charts */}
      <AnalyticsCharts revenueData={revenueChart} categoryData={categoryChart} />

      {/* Row 3: Live Customer Orders Table */}
      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
}