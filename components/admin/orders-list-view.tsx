// components/admin/orders-list-view.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';

interface OrderRowItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  returnRequested?: boolean;
  returnReason?: string | null;
  itemsCount: number;
  createdAt: Date;
}

interface OrdersListViewProps {
  orders: OrderRowItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentSearch: string;
  currentStatus: string;
}

export function OrdersListView({
  orders,
  pagination,
  currentSearch,
  currentStatus,
}: OrdersListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchTerm);
  };

  const handlePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
      setUpdatingId(null);
      router.refresh();
    });
  };

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60">
            <Truck className="h-3 w-3" /> Shipped
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60">
            <Clock className="h-3 w-3" /> Processing
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-black/10 dark:border-zinc-700 text-black/70 dark:text-zinc-300 bg-[#F0F0F0] dark:bg-zinc-800">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  const tabs: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6 font-admin text-black dark:text-white transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-admin uppercase tracking-tight text-black dark:text-white">
            ORDERS LIST
          </h1>
          <p className="text-xs text-black/60 dark:text-zinc-400 mt-1">
            Track customer orders, fulfillment pipelines, and return requests in real-time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchTerm('');
            router.push(pathname);
          }}
          className="h-8.5 gap-1.5 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset View
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-black/10 dark:border-zinc-800 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <Button
            key={t.value}
            variant={currentStatus === t.value ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => updateFilters('status', t.value)}
            className={`h-8 text-xs font-bold rounded-[62px] px-4 transition-all ${
              currentStatus === t.value
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-[20px] border border-black/10 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Input
            placeholder="Search order #, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8.5 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 pl-8 pr-4"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
        </form>

        <span className="text-xs font-semibold text-black/60 dark:text-zinc-400 hidden sm:inline">
          Showing {orders.length} of {pagination.total} orders
        </span>
      </div>

      {/* Table Container */}
      <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F0F0]/60 dark:bg-black border-b border-black/10 dark:border-zinc-800 text-black dark:text-white font-bold">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer Details</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Fulfillment Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
              {orders.length > 0 ? (
                orders.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/admin/orders/${row.id}`)}
                    className="hover:bg-black/5 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono font-bold text-black dark:text-white">
                      {row.orderNumber}
                      <span className="block text-[10px] font-normal text-black/50 dark:text-zinc-500 font-satoshi">
                        {row.itemsCount} {row.itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-black dark:text-white">{row.customerName}</div>
                      <div className="text-[10px] text-black/40 dark:text-zinc-500">{row.customerEmail}</div>
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white">
                      ${row.total.toFixed(2)}
                    </td>
                    <td className="p-3 text-black/60 dark:text-zinc-400">
                      {new Date(row.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-semibold ${
                          row.paymentStatus === 'SUCCEEDED'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : row.paymentStatus === 'PENDING'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600'
                        }`}
                      >
                        {row.paymentStatus}
                      </span>
                      <span className="block text-[10px] text-black/40 dark:text-zinc-500 uppercase font-mono">
                        {row.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1 items-start">
                        {renderStatusBadge(row.status)}
                        {row.returnRequested && row.paymentStatus !== 'REFUNDED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Return Req</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status Dispatcher Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === row.id || isPending}
                              className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-black/10 dark:border-zinc-800 gap-1 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            >
                              <PackageCheck className="h-3 w-3" /> Dispatch
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-black/40 dark:text-zinc-500">
                              Change Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(row.id, OrderStatus.PENDING)}
                              className="cursor-pointer"
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(row.id, OrderStatus.PROCESSING)}
                              className="cursor-pointer text-amber-600 font-medium"
                            >
                              Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(row.id, OrderStatus.SHIPPED)}
                              className="cursor-pointer text-blue-600 font-medium"
                            >
                              Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(row.id, OrderStatus.DELIVERED)}
                              className="cursor-pointer text-emerald-600 font-medium"
                            >
                              Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(row.id, OrderStatus.CANCELLED)}
                              className="cursor-pointer text-rose-600 font-medium"
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          title="View Order Details"
                        >
                          <Link href={`/admin/orders/${row.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-black/40 dark:text-zinc-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-black/50 dark:text-zinc-400">
            Page <span className="font-bold text-black dark:text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-black dark:text-white">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isPending}
              onClick={() => handlePage(pagination.page - 1)}
              className="h-8 w-8 p-0 rounded-lg border-black/10 dark:border-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isPending}
              onClick={() => handlePage(pagination.page + 1)}
              className="h-8 w-8 p-0 rounded-lg border-black/10 dark:border-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}