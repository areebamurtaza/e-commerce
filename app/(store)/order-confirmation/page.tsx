'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNum = searchParams.get('order') || 'ORD-892341';

  return (
    <div className="w-full bg-white pb-20 pt-12 font-satoshi text-black">
      <div className="max-w-[720px] mx-auto px-4 text-center space-y-8">
        {/* Success Icon Badge */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-in zoom-in-50 duration-300">
            <Check size={40} className="stroke-[3]" />
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="font-integral font-bold text-[32px] sm:text-[44px] leading-tight text-black uppercase tracking-tight">
            ORDER CONFIRMED!
          </h1>
          <p className="font-satoshi text-sm sm:text-base text-black/60 max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. We have received your order and are currently processing it.
          </p>
        </div>

        {/* Order Details Card Container */}
        <div className="bg-[#F0F0F0]/60 rounded-[20px] border border-black/10 p-6 sm:p-8 space-y-4 text-left text-sm max-w-lg mx-auto">
          <div className="flex justify-between items-center py-1">
            <span className="text-black/60 font-medium">Order Number:</span>
            <span className="font-mono font-bold text-black text-base">{orderNum}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-black/10">
            <span className="text-black/60 font-medium">Estimated Delivery:</span>
            <span className="font-bold text-black">3 - 5 Business Days</span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-black/10">
            <span className="text-black/60 font-medium">Payment Status:</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Paid (Stripe)
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-[52px] px-8 rounded-[62px] border-black/20 text-black font-satoshi font-medium text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all active:scale-95"
          >
            <Link href="/account">
              <Package size={18} />
              <span>View Order History</span>
            </Link>
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto h-[52px] px-8 rounded-[62px] bg-black text-white font-satoshi font-medium text-sm flex items-center justify-center gap-2 hover:bg-black/80 transition-all active:scale-95"
          >
            <Link href="/shop">
              <span>Continue Shopping</span>
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-white min-h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}