// app/admin/orders/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/actions/order';
import { OrderStatusController } from '@/components/admin/order-status-controller';
import { RefundDialog } from '@/components/admin/refund-dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, CreditCard, PackageCheck, AlertCircle } from 'lucide-react';
import { PaymentStatus } from '@prisma/client';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const result = await getAdminOrderById(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const { order } = result;

  return (
    <div className="space-y-6 font-admin text-black dark:text-white">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-black/10 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold font-admin uppercase tracking-tight text-black dark:text-white">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-black/60 dark:text-zinc-400">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <RefundDialog
            orderId={order.id}
            orderNumber={order.orderNumber}
            totalAmount={order.total}
            stripePaymentIntentId={order.payment?.stripePaymentIntentId}
            isRefunded={order.paymentStatus === PaymentStatus.REFUNDED}
          />

          <OrderStatusController
            orderId={order.id}
            initialStatus={order.status}
            initialPaymentStatus={order.paymentStatus}
          />
        </div>
      </div>

      {/* Return Request Banner */}
      {order.returnRequested && order.paymentStatus !== PaymentStatus.REFUNDED && (
        <div className="p-4 rounded-[16px] bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex items-start gap-3.5 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-sm text-amber-950 dark:text-amber-100">
              Customer Return & Refund Request Pending Approval
            </p>
            <p>
              <strong>Customer Reason:</strong> {order.returnReason || 'Not specified'}
            </p>
            {order.returnNotes && (
              <p>
                <strong>Customer Notes:</strong> {order.returnNotes}
              </p>
            )}
            <p className="text-[11px] text-amber-700 dark:text-amber-300/80 pt-1">
              Click the &quot;Refund Order&quot; button in the header action bar to approve the return, execute the Stripe refund, and restock inventory.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Order Items Table (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="rounded-[20px] border border-black/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <PackageCheck className="h-4 w-4" /> Purchased Items ({order.items.length})
            </h2>

            <div className="divide-y divide-black/5 dark:divide-zinc-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] border border-black/10 bg-[#F0F0F0] dark:border-zinc-800 dark:bg-zinc-800">
                      <Image
                        src={item.variant?.product?.images?.[0]?.url || '/images/pd1.png'}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-black dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-black/50 dark:text-zinc-400">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="text-[11px] text-black/50 dark:text-zinc-400">
                        Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-black dark:text-white">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-black/10 pt-4 text-xs dark:border-zinc-800">
              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Shipping Fee</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  ${order.shippingFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/10 dark:border-zinc-800 text-base font-bold">
                <span>Total Amount</span>
                <span className="font-mono text-lg">${order.total.toFixed(2)} USD</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Customer & Payment Meta (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="rounded-[20px] border border-black/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4" /> Customer Profile
            </h3>
            <div className="text-xs space-y-1">
              <p className="font-bold text-black dark:text-white">{order.customerName}</p>
              <p className="text-black/60 dark:text-zinc-400">{order.customerEmail}</p>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-zinc-800 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-black/60 dark:text-zinc-400">
                <MapPin className="h-3.5 w-3.5" /> Shipping Address
              </span>
              <p className="text-black dark:text-white pt-1">{order.shippingAddress}</p>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-zinc-800 text-xs space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-black/60 dark:text-zinc-400">
                <CreditCard className="h-3.5 w-3.5" /> Payment Details
              </span>
              <div className="pt-1 flex items-center justify-between">
                <span
                  className={`font-mono font-bold text-xs uppercase px-2 py-0.5 rounded-md ${
                    order.paymentStatus === PaymentStatus.SUCCEEDED
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : order.paymentStatus === PaymentStatus.REFUNDED
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {order.paymentStatus}
                </span>
                <span className="text-[11px] text-black/50 dark:text-zinc-400 font-mono">
                  {order.payment?.paymentMethod || 'STRIPE'}
                </span>
              </div>
              {order.payment?.stripePaymentIntentId && (
                <p className="text-[10px] text-black/40 dark:text-zinc-500 font-mono truncate">
                  ID: {order.payment.stripePaymentIntentId}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}