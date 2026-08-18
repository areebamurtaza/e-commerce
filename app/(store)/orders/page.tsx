// app/(store)/orders/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import { getUserOrders } from '@/actions/order';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { CustomerCancelDialog } from '@/components/order/customer-cancel-dialog';
import { CustomerReturnDialog } from '@/components/order/customer-return-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Package,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export const metadata = {
  title: 'My Orders - SHOP.CO',
  description: 'View your order history, track shipments, cancel or request returns.',
};

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

const STATUS_BADGES: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ComponentType<{ size: number; className?: string }> }
> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-800 dark:text-blue-300',
    icon: Clock,
  },
  SHIPPED: {
    label: 'Shipped',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-300',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
    icon: XCircle,
  },
};

export default async function CustomerOrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const statusParam = resolvedParams.status;
  const filterStatus =
    statusParam && ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(statusParam)
      ? (statusParam as OrderStatus)
      : undefined;

  const result = await getUserOrders({
    page,
    limit: 5,
    status: filterStatus,
  });

  const orders = result.orders || [];
  const pagination = result.pagination || { total: 0, page: 1, limit: 5, totalPages: 1 };

  return (
    <div className="w-full bg-white dark:bg-black min-h-[70vh] py-8 sm:py-12 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-black/60 dark:text-zinc-400">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="text-black dark:text-white font-medium">My Orders</span>
        </nav>

        {/* Page Header & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 dark:border-zinc-800 pb-5">
          <div>
            <h1 className="font-integral text-2xl sm:text-3xl font-bold tracking-tight uppercase">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-black/60 dark:text-zinc-400 mt-1">
              Showing {orders.length} of {pagination.total} order{pagination.total === 1 ? '' : 's'}
            </p>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <Link
              href="/orders"
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                !statusParam
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[#F0F0F0] dark:bg-zinc-800 text-black/70 dark:text-zinc-300 hover:bg-black/10'
              }`}
            >
              All
            </Link>
            <Link
              href="/orders?status=PROCESSING"
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                statusParam === 'PROCESSING'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[#F0F0F0] dark:bg-zinc-800 text-black/70 dark:text-zinc-300 hover:bg-black/10'
              }`}
            >
              Processing
            </Link>
            <Link
              href="/orders?status=DELIVERED"
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                statusParam === 'DELIVERED'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[#F0F0F0] dark:bg-zinc-800 text-black/70 dark:text-zinc-300 hover:bg-black/10'
              }`}
            >
              Delivered
            </Link>
            <Link
              href="/orders?status=CANCELLED"
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                statusParam === 'CANCELLED'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[#F0F0F0] dark:bg-zinc-800 text-black/70 dark:text-zinc-300 hover:bg-black/10'
              }`}
            >
              Cancelled
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="py-16 text-center rounded-[24px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-black/5 dark:bg-zinc-800 flex items-center justify-center text-black/40 dark:text-zinc-500">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-base font-bold text-black dark:text-white">
              No orders found
            </h3>
            <p className="text-xs text-black/60 dark:text-zinc-400 max-w-sm mx-auto">
              You don&apos;t have any orders matching this filter yet. Explore our latest arrivals to get started!
            </p>
            <Button asChild className="rounded-[62px] text-xs h-10 px-6 mt-2">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = STATUS_BADGES[order.status] || STATUS_BADGES.PENDING;
              const StatusIcon = statusConfig.icon;
              const isEligibleForCancel =
                order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
              const isDelivered = order.status === OrderStatus.DELIVERED;
              const isRefunded = order.paymentStatus === PaymentStatus.REFUNDED;

              return (
                <Card
                  key={order.id}
                  className="rounded-[20px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs hover:border-black/20 dark:hover:border-zinc-700 transition-all space-y-4"
                >
                  {/* Card Top: Order Number, Date, Status Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-black/5 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-black dark:text-white font-mono">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <StatusIcon size={12} />
                          <span>{statusConfig.label}</span>
                        </span>
                        {order.returnRequested && !isRefunded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <RotateCcw size={10} />
                            <span>Return Requested</span>
                          </span>
                        )}
                        {isRefunded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            <RotateCcw size={10} />
                            <span>Refunded</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-black/50 dark:text-zinc-400 mt-0.5">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-xs text-black/60 dark:text-zinc-400 block sm:inline mr-1">
                        Total:
                      </span>
                      <span className="font-mono font-bold text-sm sm:text-base text-black dark:text-white">
                        ${order.total.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Purchased Items Thumbnails */}
                  <div className="space-y-2.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-xl bg-[#F0F0F0] dark:bg-zinc-800 overflow-hidden shrink-0 border border-black/5 dark:border-zinc-700">
                            <Image
                              src={item.variant?.product?.images?.[0]?.url || '/images/pd1.png'}
                              alt={item.title}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-black dark:text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-black/50 dark:text-zinc-400 font-mono">
                              {item.size} • {item.color} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-black dark:text-white shrink-0">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom: Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      {/* Cancel Order Button */}
                      {isEligibleForCancel && (
                        <CustomerCancelDialog
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          total={order.total}
                          paymentStatus={order.paymentStatus}
                          createdAt={order.createdAt}
                        />
                      )}

                      {/* Return / Refund Button or Pending Review Badge */}
                      {isDelivered && order.returnRequested && !isRefunded && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                          <RotateCcw size={11} />
                          <span>Return Requested (Pending Review)</span>
                        </span>
                      )}

                      {isDelivered && !order.returnRequested && !isRefunded && (
                        <CustomerReturnDialog
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          total={order.total}
                          paymentStatus={order.paymentStatus}
                        />
                      )}
                    </div>

                    {/* View Details Link */}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-[62px] text-xs h-8.5 px-4 font-bold border-black/10 dark:border-zinc-700"
                    >
                      <Link href={`/orders/${order.id}`}>
                        <span>Track & Details</span>
                        <ChevronRight size={13} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/10 dark:border-zinc-800 pt-6">
            <Button
              asChild={page > 1}
              disabled={page <= 1}
              variant="outline"
              size="sm"
              className="rounded-[62px] text-xs h-9 px-4 font-bold gap-1.5"
            >
              {page > 1 ? (
                <Link
                  href={`/orders?page=${page - 1}${statusParam ? `&status=${statusParam}` : ''}`}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 opacity-50">
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </span>
              )}
            </Button>

            <span className="text-xs font-mono font-bold text-black/60 dark:text-zinc-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              asChild={page < pagination.totalPages}
              disabled={page >= pagination.totalPages}
              variant="outline"
              size="sm"
              className="rounded-[62px] text-xs h-9 px-4 font-bold gap-1.5"
            >
              {page < pagination.totalPages ? (
                <Link
                  href={`/orders?page=${page + 1}${statusParam ? `&status=${statusParam}` : ''}`}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 opacity-50">
                  <span>Next</span>
                  <ChevronRight size={14} />
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
