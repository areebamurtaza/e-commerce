'use client';

import { Calendar, Download, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Metric,Value,Growth', 'Monthly Recurring,$34.1K,+6.1%', 'Active Users,500.1K,+19.2%', 'Customer Growth,11.3%,-1.2%'].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ecommerce_overview_metrics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-satoshi text-black dark:text-white">
      {/* Top Banner & Header Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-integral uppercase tracking-tight text-black dark:text-white">
            E-COMMERCE DASHBOARD
          </h1>
          <p className="text-xs text-black/60 dark:text-zinc-400 mt-1">
            Real-time storefront performance, revenue metrics, and customer analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-[62px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-1.5 text-xs text-black/70 dark:text-zinc-300 font-medium">
            <Calendar className="h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
            <span>17 Jul 2026 - 13 Aug 2026</span>
          </div>
          <Button
            onClick={handleExportData}
            size="sm"
            className="h-8.5 gap-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-[62px] text-xs font-semibold px-5"
          >
            <Download className="h-3.5 w-3.5" /> Export Data
          </Button>
        </div>
      </div>

      {/* Row 1: Top 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-5 space-y-2">
          <p className="text-xs font-bold text-black/60 dark:text-zinc-400">Congratulations Admin! 🎉</p>
          <p className="text-2xl font-extrabold text-black dark:text-white">$15,231.89</p>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+65% from last month</p>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-5 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-black/60 dark:text-zinc-400">
            <span>Monthly Recurring</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+6.1%</span>
          </div>
          <p className="text-2xl font-extrabold text-black dark:text-white">$34.1K</p>
          <span className="text-[11px] text-black/40 dark:text-zinc-500 font-medium">Active Subscriptions</span>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-5 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-black/60 dark:text-zinc-400">
            <span>Active Users</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+19.2%</span>
          </div>
          <p className="text-2xl font-extrabold text-black dark:text-white">500.1K</p>
          <span className="text-[11px] text-black/40 dark:text-zinc-500 font-medium">Verified Accounts</span>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-5 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-black/60 dark:text-zinc-400">
            <span>Customer Growth</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">-1.2%</span>
          </div>
          <p className="text-2xl font-extrabold text-black dark:text-white">11.3%</p>
          <span className="text-[11px] text-black/40 dark:text-zinc-500 font-medium">Net Retention Rate</span>
        </Card>
      </div>

      {/* Row 2: Revenue Bar Chart & Returning Rate Line Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-black dark:text-white">Total Revenue</h3>
              <p className="text-xs text-black/40 dark:text-zinc-500">Income in the last 28 days</p>
            </div>
            <div className="flex items-center gap-3 rounded-[62px] border border-black/10 dark:border-zinc-800 p-2 text-xs font-semibold bg-[#F0F0F0] dark:bg-black">
              <div>
                <span className="text-[10px] text-black/40 dark:text-zinc-500 block">DESKTOP</span>
                <span className="text-black dark:text-white font-bold">$24,828</span>
              </div>
              <div className="border-l border-black/10 dark:border-zinc-800 pl-3">
                <span className="text-[10px] text-black/40 dark:text-zinc-500 block">MOBILE</span>
                <span className="text-black dark:text-white font-bold">$25,010</span>
              </div>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-t border-black/10 dark:border-zinc-800">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end gap-1 h-32 justify-center">
                  <div className="w-3.5 bg-black dark:bg-white rounded-t-sm" style={{ height: `${(idx + 3) * 15}%` }} />
                  <div className="w-3.5 bg-black/20 dark:bg-zinc-700 rounded-t-sm" style={{ height: `${(idx + 2) * 12}%` }} />
                </div>
                <span className="text-[11px] text-black/60 dark:text-zinc-400 font-medium">{month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/60 dark:text-zinc-400">Returning Customer Rate</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-black dark:text-white">$42,379</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  +2.5%
                </span>
              </div>
            </div>
          </div>

          <div className="h-44 flex flex-col justify-end pt-4 border-t border-black/10 dark:border-zinc-800">
            <svg className="w-full h-28 overflow-visible" viewBox="0 0 300 100">
              <path d="M 0,80 Q 50,30 100,60 T 200,40 T 300,10" fill="none" className="stroke-black dark:stroke-white" strokeWidth="2.5" />
              <path d="M 0,90 Q 50,60 100,75 T 200,60 T 300,30" fill="none" className="stroke-black/30 dark:stroke-zinc-700" strokeWidth="1.5" />
            </svg>
            <div className="flex justify-between text-[11px] text-black/40 dark:text-zinc-500 font-medium pt-2">
              <span>March</span>
              <span>April</span>
              <span>May</span>
              <span>June</span>
              <span>July</span>
              <span>August</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Transactions Table */}
      <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-black dark:text-white">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-black/10 dark:border-zinc-800 text-black/40 dark:text-zinc-500 font-medium">
              <tr>
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Product</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
              {[
                { id: '#ORD-1023', customer: 'Theodore Bell', product: 'Gradient Graphic T-shirt', amount: '$300.00', status: 'Processing', badge: 'border-blue-300 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
                { id: '#ORD-2045', customer: 'Amelia Grant', product: 'Checkered Shirt', amount: '$450.00', status: 'Completed', badge: 'border-emerald-300 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
                { id: '#ORD-3067', customer: 'Eleanor Ward', product: 'Skinny Fit Jeans', amount: '$200.00', status: 'Completed', badge: 'border-emerald-300 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
              ].map((row) => (
                <tr key={row.id}>
                  <td className="py-3 font-mono font-bold text-black/60 dark:text-zinc-400">{row.id}</td>
                  <td className="py-3 font-bold text-black dark:text-white">{row.customer}</td>
                  <td className="py-3 text-black/70 dark:text-zinc-300">{row.product}</td>
                  <td className="py-3 font-bold text-black dark:text-white">{row.amount}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.badge}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}