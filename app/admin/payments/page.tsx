'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TIMEFRAME_CHART_DATA = {
  '1D': [{ time: '09:00', rate: 1.082 }, { time: '12:00', rate: 1.085 }, { time: '15:00', rate: 1.081 }],
  '7D': [{ time: 'Jun 26', rate: 1.081 }, { time: 'Jun 28', rate: 1.092 }, { time: 'Jun 30', rate: 1.078 }],
  '30D': [{ time: 'W1', rate: 1.075 }, { time: 'W2', rate: 1.084 }, { time: 'W3', rate: 1.091 }],
  '90D': [{ time: 'May', rate: 1.065 }, { time: 'Jun', rate: 1.082 }, { time: 'Jul', rate: 1.095 }],
  '1Y': [{ time: 'Q1', rate: 1.052 }, { time: 'Q2', rate: 1.075 }, { time: 'Q3', rate: 1.088 }],
};

export default function PaymentsOverviewPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [activeTab, setActiveTab] = useState<'Latest' | 'Upcoming'>('Latest');
  const [timeframe, setTimeframe] = useState<keyof typeof TIMEFRAME_CHART_DATA>('7D');
  const [amount, setAmount] = useState('1000');
  const [convertedResult, setConvertedResult] = useState<number | null>(1086.50);

  const transactions = [
    { id: '1', date: '16 Aug 2026', title: 'Withdrawal to JP Morgan Chase (0440)', status: 'Completed', amount: '-1,275.79 USD', isUpcoming: false },
    { id: '2', date: '5 Aug 2026', title: 'Withdrawal to Citibank (2290)', status: 'Completed', amount: '-202.99 USD', isUpcoming: false },
    { id: '3', date: '18 Aug 2026', title: 'Scheduled Payout to Bank of America', status: 'Scheduled', amount: '+4,500.00 USD', isUpcoming: true },
  ];

  const filteredTransactions = transactions.filter((t) => (activeTab === 'Upcoming' ? t.isUpcoming : !t.isUpcoming));

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    setConvertedResult(val * 1.0865);
  };

  return (
    <div className="space-y-6 font-satoshi text-black dark:text-white">
      <div>
        <h1 className="text-2xl font-bold font-integral uppercase tracking-tight text-black dark:text-white">
          BALANCES
        </h1>
        <p className="text-xs text-black/60 dark:text-zinc-400 mt-1">
          Total funds in all balances: 1,740.30 USD
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
              <Card
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`cursor-pointer border rounded-[20px] p-4 transition-all ${
                  selectedCurrency === curr
                    ? 'border-black dark:border-white bg-[#F0F0F0] dark:bg-zinc-800 ring-1 ring-black dark:ring-white'
                    : 'border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black/30'
                }`}
              >
                <CardContent className="p-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-black/40 dark:text-zinc-500">
                      {curr === 'USD' ? 'US' : curr === 'EUR' ? 'EU' : 'GB'}
                    </span>
                    <p className="text-2xl font-extrabold mt-1 text-black dark:text-white">
                      {curr === 'USD' ? '1,240.30' : curr === 'EUR' ? '500.00' : '0.00'}
                    </p>
                    <p className="text-xs font-bold text-black dark:text-white">{curr}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-black/40 dark:text-zinc-500" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-black dark:text-white">Transactions</h3>
              <Link
                href="/admin/payments/transactions"
                className="text-xs font-bold text-black/70 dark:text-zinc-300 flex items-center gap-1 hover:text-black dark:hover:text-white"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex gap-1 bg-[#F0F0F0] dark:bg-black p-1 rounded-[62px] w-fit">
              {(['Latest', 'Upcoming'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-1 rounded-[62px] text-xs font-bold transition-all ${
                    activeTab === t
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-black/60 dark:text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="divide-y divide-black/10 dark:divide-zinc-800">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-black/40 dark:text-zinc-500 text-[11px] font-mono">{tx.date}</span>
                    <p className="font-bold text-black dark:text-white">{tx.title}</p>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">{tx.status}</span>
                  </div>
                  <span className="font-bold font-mono text-black dark:text-white">{tx.amount}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-black dark:text-white">Exchange rates</h3>
              <RefreshCw className="h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
            </div>

            <div className="flex items-center justify-between bg-[#F0F0F0] dark:bg-black p-1 rounded-[62px] text-[11px]">
              {(['1D', '7D', '30D', '90D', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-[62px] font-bold transition-all ${
                    timeframe === tf
                      ? 'bg-black dark:bg-white text-white dark:text-black'
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
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip contentStyle={{ backgroundColor: '#000', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="rate" stroke="#000000" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <form onSubmit={handleConvert} className="space-y-3 pt-2 border-t border-black/10 dark:border-zinc-800">
              <label className="text-xs font-bold text-black dark:text-white">Quick Converter</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8 text-xs bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white rounded-[62px]"
              />
              <Button type="submit" className="w-full h-9 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-[62px]">
                Convert ({convertedResult?.toFixed(2)} USD)
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}