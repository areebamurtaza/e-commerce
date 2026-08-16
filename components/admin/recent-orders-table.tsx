// components/admin/recent-orders-table.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderStatus, PaymentStatus, RecentOrder } from '@/types/admin';

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders =
    statusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 gap-1 font-semibold text-[11px] rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </Badge>
        );
      case 'SHIPPED':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 gap-1 font-semibold text-[11px] rounded-full">
            <Truck className="h-3 w-3" /> Shipped
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 gap-1 font-semibold text-[11px] rounded-full">
            <Clock className="h-3 w-3" /> Processing
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 gap-1 font-semibold text-[11px] rounded-full">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] rounded-full">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCEEDED':
        return <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Paid</span>;
      case 'PENDING':
        return <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Pending</span>;
      case 'REFUNDED':
        return <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Refunded</span>;
      default:
        return <span className="text-xs font-bold text-rose-600">Failed</span>;
    }
  };

  return (
    <Card className="rounded-[20px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs font-satoshi overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 pb-4">
        <div>
          <CardTitle className="text-base font-bold text-black dark:text-white">Recent Customer Orders</CardTitle>
          <CardDescription className="text-xs text-black/60 dark:text-zinc-400">
            Live orders awaiting fulfillment, processing, or delivery
          </CardDescription>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-black/10 bg-[#F0F0F0] p-1 dark:border-zinc-800 dark:bg-black">
            {(['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const).map((filter) => (
              <Button
                key={filter}
                variant="ghost"
                size="sm"
                className={`h-7 px-3 text-xs font-bold rounded-full transition-all capitalize ${
                  statusFilter === filter
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.toLowerCase()}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs font-bold rounded-full border-black/10 dark:border-zinc-800"
          >
            <Link href="/admin/orders">View All</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] dark:bg-zinc-950/50 text-black/60 dark:text-zinc-400 border-y border-black/10 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-5 font-bold">Order Number</th>
                <th className="py-3 px-5 font-bold">Customer</th>
                <th className="py-3 px-5 font-bold">Order Status</th>
                <th className="py-3 px-5 font-bold">Payment</th>
                <th className="py-3 px-5 font-bold">Total</th>
                <th className="py-3 px-5 font-bold text-right">Date</th>
                <th className="py-3 px-5 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-zinc-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-black/40 dark:text-zinc-500 text-xs">
                    No orders found matching the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-black/[0.015] transition-colors dark:hover:bg-zinc-800/30"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-black dark:text-white">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                      <span className="block text-[11px] font-normal text-black/40 dark:text-zinc-500">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-black dark:text-white">
                        {order.customer.name}
                      </div>
                      <div className="text-[11px] text-black/50 dark:text-zinc-400">{order.customer.email}</div>
                    </td>

                    <td className="py-3.5 px-5">{getOrderStatusBadge(order.status)}</td>

                    <td className="py-3.5 px-5">
                      {getPaymentBadge(order.paymentStatus)}
                      <span className="block text-[10px] text-black/40 dark:text-zinc-500 uppercase font-mono">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-black dark:text-white font-mono">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-5 text-right text-black/50 dark:text-zinc-400 text-[11px]">
                      {order.createdAt}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-[12px]">
                          <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer text-xs">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer text-xs">
                            <Link href="/admin/orders">Manage Orders</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}