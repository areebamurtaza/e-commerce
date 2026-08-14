// app/admin/orders/page.tsx
import { Suspense } from 'react';
import { getAdminOrders } from '@/actions/order';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrdersListView } from '@/components/admin/orders-list-view';

export const dynamic = 'force-dynamic';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search ?? '';
  const status = (resolvedParams.status as OrderStatus | 'ALL') ?? 'ALL';
  const paymentStatus = (resolvedParams.paymentStatus as PaymentStatus | 'ALL') ?? 'ALL';
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const result = await getAdminOrders({
    search,
    status,
    paymentStatus,
    page,
    limit: 10,
  });

  const orders = result.success ? result.orders : [];
  const pagination = result.pagination;

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center font-satoshi text-xs text-black/40 dark:text-zinc-500">
          Loading orders fulfillment database...
        </div>
      }
    >
      <OrdersListView
        orders={orders}
        pagination={pagination}
        currentSearch={search}
        currentStatus={status}
      />
    </Suspense>
  );
}