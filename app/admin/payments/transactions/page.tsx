// app/admin/payments/transactions/page.tsx
import { Suspense } from 'react';
import { getPaymentTransactions } from '@/actions/payment';
import { TransactionsLedgerClient } from '@/components/admin/transactions-ledger-client';
import { PaymentStatus } from '@prisma/client';

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'Transactions Ledger | Admin Dashboard',
  description: 'Audit trail of every payment charge, authorization, fee deduction, and payout.',
};

export default async function PaymentsTransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const status = (resolvedParams.status || 'ALL') as PaymentStatus | 'ALL';
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const { transactions, pagination, error } = await getPaymentTransactions({
    search,
    status,
    page,
    limit: 20,
  });

  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center font-satoshi text-xs text-black/40 dark:text-zinc-500">
          Loading transaction audit trail...
        </div>
      }
    >
      <TransactionsLedgerClient
        initialTransactions={transactions}
        pagination={pagination}
        currentSearch={search}
        currentStatus={status}
        error={error}
      />
    </Suspense>
  );
}