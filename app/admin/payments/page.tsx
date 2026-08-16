// app/admin/payments/page.tsx
import { Suspense } from 'react';
import { getPaymentAnalytics, getPaymentTransactions } from '@/actions/payment';
import { PaymentsOverviewClient } from '@/components/admin/payments-overview-client';

export const metadata = {
  title: 'Payments & Balances | Admin Dashboard',
  description: 'Manage treasury balances, transaction cash flows, and exchange rates.',
};

export default async function PaymentsOverviewPage() {
  const [analyticsRes, transactionsRes] = await Promise.all([
    getPaymentAnalytics(30),
    getPaymentTransactions({ limit: 10, page: 1 }),
  ]);

  const summary = analyticsRes.success && analyticsRes.summary
    ? analyticsRes.summary
    : {
        grossVolume: 0,
        netRevenue: 0,
        totalFees: 0,
        refundedAmount: 0,
        successfulTransactionsCount: 0,
        failedTransactionsCount: 0,
        refundRatePercentage: 0,
        averageOrderValue: 0,
      };

  const initialTransactions = transactionsRes.success ? transactionsRes.transactions : [];

  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center font-satoshi text-xs text-black/40 dark:text-zinc-500">
          Loading financial ledger and balance metrics...
        </div>
      }
    >
      <PaymentsOverviewClient
        summary={summary}
        initialTransactions={initialTransactions}
      />
    </Suspense>
  );
}