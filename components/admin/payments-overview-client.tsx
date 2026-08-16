// components/admin/payments-overview-client.tsx
'use client';

import { useState, useMemo, FormEvent } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentAnalyticsSummary, TransactionItem } from '@/actions/payment';
import { PaymentStatus } from '@prisma/client';

const RATES = {
  EUR: 0.92,
  GBP: 0.79,
  USD: 1.0,
};

const TIMEFRAME_CHART_DATA = {
  '1D': [
    { time: '09:00', rate: 1.082 },
    { time: '12:00', rate: 1.085 },
    { time: '15:00', rate: 1.081 },
    { time: '18:00', rate: 1.084 },
  ],
  '7D': [
    { time: 'Aug 10', rate: 1.081 },
    { time: 'Aug 12', rate: 1.087 },
    { time: 'Aug 14', rate: 1.092 },
    { time: 'Aug 16', rate: 1.086 },
  ],
  '30D': [
    { time: 'W1', rate: 1.075 },
    { time: 'W2', rate: 1.084 },
    { time: 'W3', rate: 1.091 },
    { time: 'W4', rate: 1.086 },
  ],
  '90D': [
    { time: 'Jun', rate: 1.065 },
    { time: 'Jul', rate: 1.082 },
    { time: 'Aug', rate: 1.095 },
  ],
  '1Y': [
    { time: 'Q3 25', rate: 1.052 },
    { time: 'Q4 25', rate: 1.068 },
    { time: 'Q1 26', rate: 1.075 },
    { time: 'Q2 26', rate: 1.088 },
  ],
};

interface PaymentsOverviewClientProps {
  summary: PaymentAnalyticsSummary;
  initialTransactions: TransactionItem[];
}

export function PaymentsOverviewClient({
  summary,
  initialTransactions,
}: PaymentsOverviewClientProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [activeTab, setActiveTab] = useState<'Latest' | 'Upcoming'>('Latest');
  const [timeframe, setTimeframe] = useState<keyof typeof TIMEFRAME_CHART_DATA>('7D');
  const [amount, setAmount] = useState<string>('1000');
  const [convertedResult, setConvertedResult] = useState<number>(1086.5);

  const balances = useMemo(() => {
    const netUSD = summary.netRevenue;
    return {
      USD: netUSD,
      EUR: netUSD * RATES.EUR,
      GBP: netUSD * RATES.GBP,
    };
  }, [summary.netRevenue]);

  const upcomingPayouts = useMemo(() => {
    // Upcoming estimated payout batch
    return [
      {
        id: 'payout-scheduled-1',
        orderId: 'scheduled',
        orderNumber: 'PAYOUT-STRIPE-AUG',
        customerName: 'Scheduled Payout to Bank Account',
        customerEmail: 'Automatic Stripe Transfer',
        amount: summary.netRevenue > 0 ? summary.netRevenue * 0.85 : 0,
        fee: 0,
        netAmount: summary.netRevenue > 0 ? summary.netRevenue * 0.85 : 0,
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE_PAYOUT',
        stripePaymentIntentId: 'po_next_scheduled_batch',
        createdAt: new Date(Date.now() + 86400000 * 2),
      },
    ];
  }, [summary.netRevenue]);

  const displayedTransactions = activeTab === 'Latest' ? initialTransactions : upcomingPayouts;

  const handleConvert = (e: FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    setConvertedResult(val * 1.0865);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return (
          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case PaymentStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case PaymentStatus.FAILED:
        return (
          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-rose-600 dark:text-rose-400">
            <XCircle className="h-3 w-3" /> Failed
          </span>
        );
      case PaymentStatus.REFUNDED:
        return (
          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-purple-600 dark:text-purple-400">
            <AlertTriangle className="h-3 w-3" /> Refunded
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-satoshi text-black dark:text-white">
      {/* Top Header */}
      <div>
        <h1 className="font-integral text-2xl font-bold uppercase tracking-tight text-black dark:text-white">
          BALANCES
        </h1>
        <p className="mt-1 text-xs text-black/60 dark:text-zinc-400">
          Total available funds across all balances:{' '}
          <strong className="font-mono text-black dark:text-white">
            ${balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            USD
          </strong>
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left 8 Columns */}
        <div className="space-y-6 lg:col-span-8">
          {/* Currency Balance Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(['USD', 'EUR', 'GBP'] as const).map((curr) => {
              const val = balances[curr];
              const isSelected = selectedCurrency === curr;
              return (
                <Card
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`cursor-pointer rounded-[20px] border p-4 transition-all ${
                    isSelected
                      ? 'border-black bg-[#F0F0F0] ring-1 ring-black dark:border-white dark:bg-zinc-800 dark:ring-white'
                      : 'border-black/10 bg-white hover:border-black/30 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <CardContent className="flex items-center justify-between p-0">
                    <div>
                      <span className="text-xs font-bold text-black/40 dark:text-zinc-500">
                        {curr === 'USD' ? 'US Dollar' : curr === 'EUR' ? 'Euro' : 'British Pound'}
                      </span>
                      <p className="mt-1 font-integral text-2xl font-bold text-black dark:text-white">
                        {val.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs font-bold text-black dark:text-white">{curr}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-black/40 dark:text-zinc-500" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Transactions List */}
          <Card className="rounded-[20px] border border-black/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black dark:text-white">Transactions</h3>
              <Link
                href="/admin/payments/transactions"
                className="flex items-center gap-1 text-xs font-bold text-black/70 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex w-fit gap-1 rounded-[62px] bg-[#F0F0F0] p-1 dark:bg-black">
              {(['Latest', 'Upcoming'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`rounded-[62px] px-4 py-1 text-xs font-bold transition-all ${
                    activeTab === t
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 dark:text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="divide-y divide-black/10 dark:divide-zinc-800">
              {displayedTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-black/40 dark:text-zinc-500">
                  No {activeTab.toLowerCase()} transactions recorded.
                </div>
              ) : (
                displayedTransactions.map((tx) => {
                  const isPositive = tx.status === PaymentStatus.SUCCEEDED;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 text-xs transition-colors hover:bg-black/[0.01] dark:hover:bg-zinc-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-mono text-[11px] text-black/40 dark:text-zinc-500">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <p className="font-bold text-black dark:text-white">
                            {tx.customerName} ({tx.orderNumber})
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-black dark:text-white'
                        }`}
                      >
                        {isPositive ? '+' : ''}${tx.amount.toFixed(2)} USD
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right 4 Columns */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="rounded-[20px] border border-black/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white">Exchange Rates (USD)</h3>
              <RefreshCw className="h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
            </div>

            <div className="flex items-center justify-between rounded-[62px] bg-[#F0F0F0] p-1 text-[11px] dark:bg-black">
              {(['1D', '7D', '30D', '90D', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-[62px] px-2.5 py-1 font-bold transition-all ${
                    timeframe === tf
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 dark:text-zinc-400'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="h-36 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TIMEFRAME_CHART_DATA[timeframe]}>
                  <XAxis
                    dataKey="time"
                    stroke="currentColor"
                    opacity={0.4}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <form
              onSubmit={handleConvert}
              className="space-y-3 border-t border-black/10 pt-2 dark:border-zinc-800"
            >
              <label className="text-xs font-bold text-black dark:text-white">Quick Converter</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8 rounded-[62px] border-none bg-[#F0F0F0] text-xs text-black dark:bg-black dark:text-white"
                placeholder="Enter amount..."
              />
              <Button
                type="submit"
                className="h-9 w-full rounded-[62px] bg-black text-xs font-bold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
              >
                Convert ({convertedResult.toFixed(2)} EUR)
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}