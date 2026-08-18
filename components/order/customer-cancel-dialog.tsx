// components/order/customer-cancel-dialog.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelCustomerOrder } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Loader2, CheckCircle2, Ban } from 'lucide-react';

interface CustomerCancelDialogProps {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  createdAt: Date | string;
}

export function CustomerCancelDialog({
  orderId,
  orderNumber,
  total,
  paymentStatus,
  createdAt,
}: CustomerCancelDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Changed my mind');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check 30-minute window
  const orderTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - orderTime) / (1000 * 60));
  const remainingMinutes = Math.max(0, 30 - elapsedMinutes);

  const handleCancel = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await cancelCustomerOrder(orderId, reason);
      if (res.success) {
        setSuccessMsg(res.message || 'Order cancelled successfully.');
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to cancel order.');
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8.5 text-xs font-bold gap-1.5 rounded-[62px] border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-3.5 cursor-pointer"
      >
        <Ban size={13} className="text-rose-600" />
        <span>Cancel Order</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 p-6 font-satoshi text-black dark:text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Ban size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Cancel Order #{orderNumber}
                  </h3>
                  <p className="text-xs text-black/60 dark:text-zinc-400">
                    {remainingMinutes > 0
                      ? `Available for the next ${remainingMinutes} minutes`
                      : 'Immediate cancellation before dispatch'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-black/40 hover:text-black dark:text-zinc-500 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-black/70 dark:text-zinc-300 leading-relaxed">
                {paymentStatus === 'SUCCEEDED'
                  ? `Your order will be cancelled immediately and your total of $${total.toFixed(2)} USD will be refunded directly to your payment method.`
                  : 'Your order will be cancelled and items released from reserved stock.'}
              </p>

              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-black/80 dark:text-zinc-200">
                  Reason for Cancellation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-9 rounded-xl border border-black/10 dark:border-zinc-800 bg-[#F0F0F0] dark:bg-black px-3 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Need to change shipping address">Need to change shipping address</option>
                  <option value="Found a better price">Found a better price</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-[62px] text-xs h-9"
              >
                Keep Order
              </Button>
              <Button
                type="button"
                disabled={isPending || Boolean(successMsg)}
                onClick={handleCancel}
                className="rounded-[62px] text-xs h-9 bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
