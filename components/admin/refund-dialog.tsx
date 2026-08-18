// components/admin/refund-dialog.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { refundStripeOrder } from '@/actions/order';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

interface RefundDialogProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  stripePaymentIntentId?: string | null;
  isRefunded: boolean;
  onSuccess?: () => void;
}

export function RefundDialog({
  orderId,
  orderNumber,
  totalAmount,
  stripePaymentIntentId,
  isRefunded,
  onSuccess,
}: RefundDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('requested_by_customer');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (isRefunded) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[62px] text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        <CheckCircle2 size={13} className="text-zinc-500" />
        <span>Refunded</span>
      </span>
    );
  }

  if (!stripePaymentIntentId) {
    return null;
  }

  const handleProcessRefund = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await refundStripeOrder(orderId, reason);
      if (res.success) {
        setSuccessMsg(res.message || 'Refund successfully processed.');
        setTimeout(() => {
          setIsOpen(false);
          if (onSuccess) onSuccess();
          router.refresh();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to process refund.');
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
        className="h-8.5 text-xs font-bold gap-1.5 rounded-[62px] border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-4 cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
        <span>Refund Order</span>
      </Button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[460px] rounded-[24px] bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 p-6 font-admin text-black dark:text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Refund Order #{orderNumber}
                  </h3>
                  <p className="text-xs text-black/60 dark:text-zinc-400">
                    Initiates an immediate full refund via the Stripe API.
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

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-zinc-800/60 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Total Refund Amount:</span>
                  <span className="text-rose-600 font-mono text-sm">${totalAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-black/60 dark:text-zinc-400 font-mono text-[11px]">
                  <span>Payment Intent:</span>
                  <span className="truncate max-w-[200px]">{stripePaymentIntentId}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black/80 dark:text-zinc-200">
                  Reason for Refund
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-9 rounded-xl border border-black/10 dark:border-zinc-800 bg-[#F0F0F0] dark:bg-black px-3 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="requested_by_customer">Customer Request / Cancellation</option>
                  <option value="duplicate">Duplicate Charge</option>
                  <option value="fraudulent">Suspected Fraudulent Activity</option>
                </select>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-rose-600" />
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
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending || Boolean(successMsg)}
                onClick={handleProcessRefund}
                className="rounded-[62px] text-xs h-9 bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Refunding via Stripe...</span>
                  </>
                ) : (
                  <span>Confirm Stripe Refund</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
