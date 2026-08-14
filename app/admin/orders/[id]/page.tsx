// app/admin/orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminOrderById } from '@/actions/order';
import { AdminOrderDetailClient } from '@/components/admin/admin-order-detail-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const result = await getAdminOrderById(id);

  if (!result.success || !result.order) {
    return (
      <div className="space-y-4 p-8 text-center font-satoshi">
        <h2 className="text-xl font-bold font-integral uppercase">Order Not Found</h2>
        <p className="text-xs text-black/60 dark:text-zinc-400">
          The requested order ID does not exist in the database.
        </p>
        <Button asChild variant="outline" className="rounded-[62px] text-xs">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const order = result.order;

  return <AdminOrderDetailClient order={order} />;
}