// app/(store)/orders/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getOrderById } from '@/actions/order';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderTrackingActions } from '@/components/checkout/order-tracking-actions';
import { PrintableInvoice } from '@/components/invoice/printable-invoice';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getOrderById(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Order Not Found | SHOP.CO',
      description: 'The requested order details could not be found.',
    };
  }

  return {
    title: `Order ${result.data.orderNumber} | SHOP.CO`,
    description: `Track status, shipment, and receipt for order ${result.data.orderNumber}.`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = await params;
  const orderResult = await getOrderById(resolvedParams.id);

  if (!orderResult.success || !orderResult.data) {
    notFound();
  }

  const order = orderResult.data;

  // Formatting helpers
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isCancelled = order.status === OrderStatus.CANCELLED;

  // Stepper state calculation
  const statusSteps = [
    {
      label: 'Order Placed',
      description: formattedDate,
      isCompleted: true,
      icon: CheckCircle2,
    },
    {
      label: 'Processing',
      description:
        order.status === OrderStatus.PROCESSING ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
          ? 'Payment Verified'
          : 'Awaiting Fulfillment',
      isCompleted:
        order.status === OrderStatus.PROCESSING ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED,
      icon: Clock,
    },
    {
      label: 'Shipped',
      description:
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
          ? 'In Transit'
          : 'Pending Dispatch',
      isCompleted:
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED,
      icon: Truck,
    },
    {
      label: 'Delivered',
      description:
        order.status === OrderStatus.DELIVERED
          ? 'Package Received'
          : 'Est. 3-5 Days',
      isCompleted: order.status === OrderStatus.DELIVERED,
      icon: Package,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-black pb-24 pt-6 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] space-y-8">
        {/* Navigation & Header Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 font-satoshi text-sm text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Account Orders</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck size={16} />
              <span>Verified Purchase</span>
            </div>
            <OrderTrackingActions orderNumber={order.orderNumber} />
          </div>
        </div>

        {/* Hero Order Status Banner */}
        <div className="bg-[#F0F0F0]/60 dark:bg-zinc-900/60 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="font-integral font-bold text-[24px] sm:text-[32px] text-black dark:text-white uppercase tracking-tight">
                  {isCancelled ? 'ORDER CANCELLED' : 'ORDER DETAILS'}
                </h1>
                <span
                  className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                    isCancelled
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : order.status === OrderStatus.DELIVERED
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : order.status === OrderStatus.SHIPPED
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-black/60 dark:text-zinc-400">
                Placed on {formattedDate} • Customer: {order.customerName} (
                {order.customerEmail})
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-[62px] border border-black/10 dark:border-zinc-700 shrink-0 self-start sm:self-auto">
              <span className="text-xs text-black/60 dark:text-zinc-400">Order #</span>
              <span className="font-mono font-bold text-sm text-black dark:text-white">
                {order.orderNumber}
              </span>
            </div>
          </div>

          {/* Fulfillment Tracking Progress Stepper */}
          {!isCancelled ? (
            <div className="pt-6 border-t border-black/10 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StepIcon
                        className={`w-5 h-5 shrink-0 ${
                          step.isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-black/30 dark:text-zinc-600'
                        }`}
                      />
                      <span
                        className={`font-bold text-xs sm:text-sm ${
                          step.isCompleted
                            ? 'text-black dark:text-white'
                            : 'text-black/40 dark:text-zinc-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    <div className="h-2 w-full bg-black/10 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          step.isCompleted
                            ? 'bg-emerald-600 dark:bg-emerald-500 w-full'
                            : 'w-0'
                        }`}
                      />
                    </div>

                    <p className="text-[11px] text-black/50 dark:text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-[16px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-xs sm:text-sm">
              <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>
                This order was cancelled. Reserved inventory was released back to the store
                catalog.
              </span>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Breakdown Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Ordered Items List */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
            <h2 className="font-bold text-lg sm:text-xl text-black dark:text-white pb-3 border-b border-black/10 dark:border-zinc-800">
              Purchased Items ({order.items.length})
            </h2>

            <div className="divide-y divide-black/10 dark:divide-zinc-800">
              {order.items.map((item) => {
                const primaryImage =
                  item.variant?.product?.images?.[0]?.url || '/images/pd1.png';

                return (
                  <div
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                  >
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-[14px] bg-[#F0F0F0] dark:bg-zinc-800 border border-black/10 dark:border-zinc-800">
                      <Image
                        src={primaryImage}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-sm sm:text-base text-black dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-black/60 dark:text-zinc-400">
                        Size: <span className="font-semibold">{item.size}</span> • Color:{' '}
                        <span className="font-semibold">{item.color}</span>
                      </p>
                      <p className="text-xs text-black/60 dark:text-zinc-400">
                        Quantity: <span className="font-bold text-black dark:text-white">{item.quantity}</span>
                      </p>
                    </div>

                    <div className="font-bold text-sm sm:text-base text-black dark:text-white text-right">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Address, Payment & Financial Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Address & Payment Summary Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
              <div className="space-y-2 pb-4 border-b border-black/10 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-black dark:text-white font-bold text-base">
                  <MapPin size={18} />
                  <span>Shipping Address</span>
                </div>
                <div className="text-xs sm:text-sm text-black/70 dark:text-zinc-300 space-y-0.5 pl-6">
                  <p className="font-bold text-black dark:text-white">
                    {order.customerName}
                  </p>
                  <p>{order.shippingAddress}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-black dark:text-white font-bold text-base">
                  <CreditCard size={18} />
                  <span>Payment Information</span>
                </div>
                <div className="text-xs sm:text-sm text-black/70 dark:text-zinc-300 space-y-1 pl-6">
                  <p>
                    Method:{' '}
                    <span className="font-semibold text-black dark:text-white">
                      {order.payment?.paymentMethod || 'Credit Card (Stripe)'}
                    </span>
                  </p>
                  <p>
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        order.paymentStatus === PaymentStatus.SUCCEEDED
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Ledger Card */}
            <div className="bg-[#F0F0F0]/60 dark:bg-zinc-900/60 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 space-y-3 text-sm">
              <h3 className="font-bold text-base sm:text-lg text-black dark:text-white pb-2 border-b border-black/10 dark:border-zinc-800">
                Financial Summary
              </h3>

              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-bold text-black dark:text-white">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Shipping Fee</span>
                <span className="font-bold text-black dark:text-white">
                  {order.shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 uppercase text-xs">
                      Free
                    </span>
                  ) : (
                    `$${order.shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-black/10 dark:border-zinc-800 text-lg font-bold text-black dark:text-white">
                <span>Total Amount</span>
                <span>${order.total.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Printable Commercial Tax Invoice (Only visible when printing) */}
      <PrintableInvoice order={order} />
    </div>
  );
}