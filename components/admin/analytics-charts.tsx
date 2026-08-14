'use client';

import { useState } from 'react';
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

const CATEGORY_COLORS = ['#0f172a', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export function AnalyticsCharts({ revenueData, categoryData }: AnalyticsChartsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '12m'>('30d');

  return (
    <div className="grid gap-6 md:grid-cols-7">
      {/* Revenue Over Time Area Chart */}
      <Card className="md:col-span-4 lg:col-span-5 shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <CardDescription className="text-xs">
              Gross sales revenue and order volume performance trends
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            <Button
              variant={timeframe === '7d' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium"
              onClick={() => setTimeframe('7d')}
            >
              7D
            </Button>
            <Button
              variant={timeframe === '30d' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium"
              onClick={() => setTimeframe('30d')}
            >
              30D
            </Button>
            <Button
              variant={timeframe === '12m' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium"
              onClick={() => setTimeframe('12m')}
            >
              12M
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  style={{ fontSize: '11px', fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  style={{ fontSize: '11px', fill: '#64748b' }}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: unknown) => {
                    const amount = typeof val === 'number' ? val : Number(val) || 0;
                    return [`$${amount.toLocaleString()}`, 'Revenue'] as [React.ReactNode, React.ReactNode];
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
          </div>
        </CardContent>
      </Card>

      {/* Sales by Category Bar Chart */}
      <Card className="md:col-span-3 lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Sales by Style</CardTitle>
          <CardDescription className="text-xs">
            Revenue share across apparel dress styles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '11px', fill: '#475569', fontWeight: 500 }}
                  width={65}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => {
                    const amount = typeof val === 'number' ? val : Number(val) || 0;
                    return [`$${amount.toLocaleString()}`, 'Sales'] as [React.ReactNode, React.ReactNode];
                  }}
                />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={18}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {categoryData.slice(0, 3).map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-400">{item.category}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
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