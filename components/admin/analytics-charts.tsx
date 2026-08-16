// components/admin/analytics-charts.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RevenueChartData, SalesByCategoryData } from '@/types/admin';

interface AnalyticsChartsProps {
  revenueData: RevenueChartData[];
  categoryData: SalesByCategoryData[];
}

const CATEGORY_COLORS = ['#000000', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export function AnalyticsCharts({ revenueData, categoryData }: AnalyticsChartsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '12m'>('30d');

  // Interactive timeframe slicing
  const displayedRevenueData = useMemo(() => {
    if (!revenueData || revenueData.length === 0) return [];
    if (timeframe === '7d') return revenueData.slice(-7);
    if (timeframe === '30d') return revenueData.slice(-30);
    return revenueData;
  }, [revenueData, timeframe]);

  return (
    <div className="grid gap-6 md:grid-cols-7 font-satoshi">
      {/* Revenue Over Time Area Chart */}
      <Card className="md:col-span-4 lg:col-span-5 rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-black dark:text-white">Revenue Overview</CardTitle>
            <CardDescription className="text-xs text-black/60 dark:text-zinc-400">
              Gross sales revenue and order volume performance trends
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-black/10 bg-[#F0F0F0] p-1 dark:border-zinc-800 dark:bg-black">
            {(['7d', '30d', '12m'] as const).map((tf) => (
              <Button
                key={tf}
                variant="ghost"
                size="sm"
                className={`h-7 px-3 text-xs font-bold rounded-full transition-all ${
                  timeframe === tf
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
                onClick={() => setTimeframe(tf)}
              >
                {tf.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            {displayedRevenueData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-black/40 dark:text-zinc-500">
                No revenue recorded for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayedRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.08} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    style={{ fontSize: '11px', fill: 'currentColor', opacity: 0.5 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    style={{ fontSize: '11px', fill: 'currentColor', opacity: 0.5 }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown) => {
                      const amount = typeof val === 'number' ? val : Number(val) || 0;
                      return [`$${amount.toFixed(2)} USD`, 'Revenue'] as [React.ReactNode, React.ReactNode];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales by Category Bar Chart */}
      <Card className="md:col-span-3 lg:col-span-2 rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-black dark:text-white">Sales by Style</CardTitle>
          <CardDescription className="text-xs text-black/60 dark:text-zinc-400">
            Revenue share across apparel dress styles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 15, left: -10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '11px', fill: 'currentColor', opacity: 0.7, fontWeight: 600 }}
                  width={60}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#000',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => {
                    const amount = typeof val === 'number' ? val : Number(val) || 0;
                    return [`$${amount.toFixed(2)} USD`, 'Sales'] as [React.ReactNode, React.ReactNode];
                  }}
                />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={16}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-2 border-t border-black/10 pt-3 dark:border-zinc-800">
            {categoryData.slice(0, 4).map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-black/70 dark:text-zinc-300 font-medium">{item.category}</span>
                </div>
                <span className="font-bold text-black dark:text-white font-mono">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}