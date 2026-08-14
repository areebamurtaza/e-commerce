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
  ArrowUpDown,
  Filter,
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

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </Badge>
        );
      case 'SHIPPED':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 gap-1 font-medium">
            <Truck className="h-3 w-3" /> Shipped
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 gap-1 font-medium">
            <Clock className="h-3 w-3" /> Processing
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 gap-1 font-medium">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCEEDED':
        return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Paid</span>;
      case 'PENDING':
        return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending</span>;
      case 'REFUNDED':
        return <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Refunded</span>;
      default:
        return <span className="text-xs text-rose-600">Failed</span>;
    }
  };

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Recent Customer Orders</CardTitle>
          <CardDescription className="text-xs">
            Live orders awaiting fulfillment or processing
          </CardDescription>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs font-medium capitalize"
                onClick={() => setStatusFilter(filter)}
              >
                {filter.toLowerCase()}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs font-medium">
            <Link href="/admin/orders">
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold text-right">Date</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No orders found matching status filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-900/50"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {order.orderNumber}
                      <span className="block text-[11px] font-normal text-slate-500">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {order.customer.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{order.customer.email}</div>
                    </td>
                    <td className="py-3.5 px-4">{getOrderStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4">
                      {getPaymentBadge(order.paymentStatus)}
                      <span className="block text-[10px] text-slate-400 uppercase">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                      {order.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            Mark Shipped
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