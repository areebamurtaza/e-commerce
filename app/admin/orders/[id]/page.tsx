// app/admin/orders/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/actions/order';
import { OrderStatusController } from '@/components/admin/order-status-controller';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, CreditCard, PackageCheck } from 'lucide-react';

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
    <div className="space-y-6 font-satoshi text-black dark:text-white">
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
            <h1 className="font-integral text-2xl font-bold uppercase tracking-tight">
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

        <OrderStatusController
          orderId={order.id}
          initialStatus={order.status}
          initialPaymentStatus={order.paymentStatus}
        />
      </div>

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

            <div className="pt-3 border-t border-black/10 dark:border-zinc-800 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-black/60 dark:text-zinc-400">
                <CreditCard className="h-3.5 w-3.5" /> Payment Status
              </span>
              <div className="pt-1 flex items-center justify-between">
                <span className="font-mono font-bold uppercase">{order.paymentStatus}</span>
                <span className="text-[11px] text-black/50 dark:text-zinc-400 font-mono">
                  {order.payment?.paymentMethod || 'STRIPE'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}