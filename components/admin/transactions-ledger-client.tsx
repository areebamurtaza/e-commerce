// components/admin/transactions-ledger-client.tsx
'use client';

import { useState, useTransition, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionItem } from '@/actions/payment';
import { PaymentStatus } from '@prisma/client';

interface TransactionsLedgerClientProps {
  initialTransactions: TransactionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentSearch: string;
  currentStatus: PaymentStatus | 'ALL';
  error?: string;
}

export function TransactionsLedgerClient({
  initialTransactions,
  pagination,
  currentSearch,
  currentStatus,
  error,
}: TransactionsLedgerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState<string>(currentSearch);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearch(term);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (term.trim()) {
        params.set('search', term.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`/admin/payments/transactions?${params.toString()}`);
    });
  };

  const handleStatusFilter = (status: PaymentStatus | 'ALL') => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (status !== 'ALL') {
        params.set('status', status);
      } else {
        params.delete('status');
      }
      params.set('page', '1');
      router.push(`/admin/payments/transactions?${params.toString()}`);
    });
  };

  const handleExportCSV = () => {
    if (initialTransactions.length === 0) return;

    const headers = [
      'Transaction ID',
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Gross Amount',
      'Stripe Fee',
      'Net Amount',
      'Status',
      'Payment Method',
      'Stripe Payment Intent',
      'Date',
    ];

    const rows = initialTransactions.map((tx) => [
      tx.id,
      tx.orderNumber,
      `"${tx.customerName.replace(/"/g, '""')}"`,
      tx.customerEmail,
      tx.amount.toFixed(2),
      tx.fee.toFixed(2),
      tx.netAmount.toFixed(2),
      tx.status,
      tx.paymentMethod,
      tx.stripePaymentIntentId || 'N/A',
      new Date(tx.createdAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `shopco_ledger_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return (
          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Succeeded
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
    <div className="space-y-6 font-admin text-black dark:text-white">
      {/* Navigation Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-black/10 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Link href="/admin/payments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold font-admin uppercase tracking-tight text-black dark:text-white">
              TRANSACTIONS LEDGER
            </h1>
            <p className="text-xs text-black/60 dark:text-zinc-400">
              Audit trail of every credit card charge, authorization, and payout record.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-[62px] border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-black/70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
            <span>Audit Year 2026</span>
          </div>
          <Button
            onClick={handleExportCSV}
            size="sm"
            disabled={initialTransactions.length === 0}
            className="h-8.5 gap-1.5 rounded-[62px] bg-black px-5 text-xs font-semibold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-black/10 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-black/40 dark:text-zinc-500">Status:</span>
          {(['ALL', 'SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleStatusFilter(st)}
              className={`rounded-[62px] px-3 py-1 text-xs font-bold transition-all ${
                currentStatus === st
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-black/60 dark:text-zinc-400'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'SUCCEEDED'
                ? 'Completed'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search by order # or intent..."
            value={search}
            onChange={handleSearchChange}
            className="h-8 rounded-[62px] border-none bg-[#F0F0F0] pl-8 text-xs text-black dark:bg-black dark:text-white"
          />
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40 dark:text-zinc-500" />
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="overflow-hidden rounded-[20px] border border-black/10 bg-white p-2 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="divide-y divide-black/10 dark:divide-zinc-800">
          {initialTransactions.length > 0 ? (
            initialTransactions.map((tx) => {
              const isPositive = tx.status === PaymentStatus.SUCCEEDED;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-[12px] p-3 text-xs transition-colors hover:bg-black/5 sm:px-4 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
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
                        <Link
                          href={`/admin/orders/${tx.orderId}`}
                          className="hover:underline"
                        >
                          {tx.orderNumber}
                        </Link>{' '}
                        • {tx.customerName}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(tx.status)}
                        {tx.stripePaymentIntentId && (
                          <span className="font-mono text-[10px] text-black/40 dark:text-zinc-500">
                            {tx.stripePaymentIntentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-500 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}${tx.amount.toFixed(2)} USD
                    </span>
                    <p className="font-mono text-[10px] text-black/40 dark:text-zinc-500">
                      Fee: -${tx.fee.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-black/40 dark:text-zinc-500">
              No transactions match your search criteria.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 text-xs dark:border-zinc-800">
            <span className="text-black/60 dark:text-zinc-400">
              Page <strong>{pagination.page}</strong> of{' '}
              <strong>{pagination.totalPages}</strong> ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs"
                >
                  <Link
                    href={`/admin/payments/transactions?page=${
                      pagination.page - 1
                    }&search=${encodeURIComponent(
                      currentSearch
                    )}&status=${currentStatus}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              {pagination.page < pagination.totalPages && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs"
                >
                  <Link
                    href={`/admin/payments/transactions?page=${
                      pagination.page + 1
                    }&search=${encodeURIComponent(
                      currentSearch
                    )}&status=${currentStatus}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}