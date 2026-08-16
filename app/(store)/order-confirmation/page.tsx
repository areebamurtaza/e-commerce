// app/(store)/order-confirmation/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Package, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { getOrderById } from '@/actions/order';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Order Confirmed | SHOP.CO',
  description: 'Thank you for your purchase. Your order has been placed and is now processing.',
};

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    order?: string;
  }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const resolvedSearchParams = await searchParams;
  const targetOrderNumber =
    resolvedSearchParams.orderNumber || resolvedSearchParams.order;

  if (!targetOrderNumber) {
    notFound();
  }

  const orderResult = await getOrderById(targetOrderNumber);
  const order = orderResult.success ? orderResult.data : null;

  return (
    <div className="w-full bg-white dark:bg-black pb-24 pt-12 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[760px] mx-auto px-4 text-center space-y-8">
        {/* Success Icon Animation Badge */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-in zoom-in-75 duration-300">
            <Check size={44} className="stroke-[3]" />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="font-integral font-bold text-[30px] sm:text-[44px] leading-tight text-black dark:text-white uppercase tracking-tight">
            ORDER CONFIRMED!
          </h1>
          <p className="font-satoshi text-sm sm:text-base text-black/60 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Thank you for your order
            {order?.customerName ? `, ${order.customerName}` : ''}. We have received your
            purchase and our fulfillment team is preparing your items.
          </p>
        </div>

        {/* Order Details Overview Card */}
        <div className="bg-[#F0F0F0]/70 dark:bg-zinc-900/70 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 sm:p-8 space-y-4 text-left text-sm max-w-lg mx-auto shadow-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-black/60 dark:text-zinc-400 font-medium">
              Order Reference:
            </span>
            <span className="font-mono font-bold text-black dark:text-white text-base">
              {order ? order.orderNumber : targetOrderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-black/10 dark:border-zinc-800">
            <span className="text-black/60 dark:text-zinc-400 font-medium">
              Estimated Delivery:
            </span>
            <span className="font-bold text-black dark:text-white">
              3 - 5 Business Days
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-black/10 dark:border-zinc-800">
            <span className="text-black/60 dark:text-zinc-400 font-medium">
              Payment Status:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order?.paymentStatus === 'SUCCEEDED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              {order?.paymentStatus === 'SUCCEEDED'
                ? 'Paid (Verified)'
                : order?.payment?.paymentMethod === 'COD'
                ? 'Cash on Delivery (Pending)'
                : 'Pending Settlement'}
            </span>
          </div>

          {order && (
            <div className="flex justify-between items-center py-1 border-t border-black/10 dark:border-zinc-800">
              <span className="text-black/60 dark:text-zinc-400 font-medium">
                Total Amount:
              </span>
              <span className="font-bold text-black dark:text-white text-base">
                ${order.total.toFixed(2)} USD
              </span>
            </div>
          )}
        </div>

        {/* Primary Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          {order ? (
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-[52px] px-8 rounded-[62px] border-black/20 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-satoshi font-bold text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 cursor-pointer"
            >
              <Link href={`/orders/${order.id}`}>
                <Package size={18} />
                <span>Track Order Details</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-[52px] px-8 rounded-[62px] border-black/20 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-satoshi font-bold text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 cursor-pointer"
            >
              <Link href="/account">
                <Package size={18} />
                <span>View My Orders</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            className="w-full sm:w-auto h-[52px] px-8 rounded-[62px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 font-satoshi font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Link href="/shop">
              <ShoppingBag size={18} />
              <span>Continue Shopping</span>
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>

        {/* Security Assurance Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-black/50 dark:text-zinc-500 font-medium pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>A confirmation receipt has been sent to your email.</span>
        </div>
      </div>
    </div>
  );
}