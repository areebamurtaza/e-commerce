'use client';

import { useState } from 'react';
import { Calendar, Download, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Transaction {
  id: string;
  date: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
  amount: string;
  isPositive: boolean;
  type: 'Withdrawal' | 'Deposit';
}

export default function PaymentsTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending' | 'Failed'>('All');
  const [search, setSearch] = useState('');

  const transactionsData: Transaction[] = [
    { id: 'tx-101', date: '16 Aug 2026', description: 'Withdrawal to JP Morgan Chase (0440)', status: 'Completed', amount: '-1,275.79 USD', isPositive: false, type: 'Withdrawal' },
    { id: 'tx-102', date: '15 Aug 2026', description: 'Payment from Stripe Gateway', status: 'Completed', amount: '+5,651.56 USD', isPositive: true, type: 'Deposit' },
    { id: 'tx-103', date: '14 Aug 2026', description: 'Withdrawal to Citibank (2290)', status: 'Pending', amount: '-202.99 USD', isPositive: false, type: 'Withdrawal' },
    { id: 'tx-104', date: '12 Aug 2026', description: 'Payment from PayPal Express', status: 'Failed', amount: '+1,200.00 USD', isPositive: true, type: 'Deposit' },
  ];

  const filteredTransactions = transactionsData.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Description,Status,Type,Amount']
        .concat(filteredTransactions.map((t) => `${t.date},"${t.description}",${t.status},${t.type},${t.amount}`))
        .join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'transactions_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-satoshi text-black dark:text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold font-integral uppercase tracking-tight text-black dark:text-white">
          TRANSACTIONS LEDGER
        </h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-[62px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-1.5 text-xs text-black/70 dark:text-zinc-300 font-medium">
            <Calendar className="h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
            <span>17 Jul 2026 - 13 Aug 2026</span>
          </div>
          <Button onClick={handleExportCSV} size="sm" className="h-8.5 gap-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-[62px] text-xs font-semibold px-5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-[20px] border border-black/10 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-black/40 dark:text-zinc-500">Status:</span>
          {(['All', 'Completed', 'Pending', 'Failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-[62px] text-xs font-bold transition-all ${
                statusFilter === st ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-black/60 dark:text-zinc-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Input
            placeholder="Search ledger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm overflow-hidden p-2">
        <div className="divide-y divide-black/10 dark:border-zinc-800">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-3 sm:px-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-zinc-800/50 rounded-[12px] text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.isPositive ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'}`}>
                    {tx.isPositive ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="text-black/40 dark:text-zinc-500 text-[11px] font-mono">{tx.date}</span>
                    <p className="font-bold text-black dark:text-white">{tx.description}</p>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">{tx.status}</span>
                  </div>
                </div>
                <span className={`font-mono font-bold ${tx.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {tx.amount}
                </span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-black/40 dark:text-zinc-500">
              No matching transactions found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}