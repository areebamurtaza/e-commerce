// components/order/customer-return-dialog.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { requestCustomerReturn } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

interface CustomerReturnDialogProps {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
}

export function CustomerReturnDialog({
  orderId,
  orderNumber,
  total,
  paymentStatus,
}: CustomerReturnDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Item size does not fit');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReturn = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await requestCustomerReturn(orderId, reason, notes);
      if (res.success) {
        setSuccessMsg(res.message || 'Return & refund initiated successfully.');
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to process return request.');
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
        className="h-8.5 text-xs font-bold gap-1.5 rounded-[62px] border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3.5 cursor-pointer shadow-2xs"
      >
        <RotateCcw size={13} className="text-zinc-600 dark:text-zinc-400" />
        <span>Return / Refund</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[440px] rounded-[24px] bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 p-6 font-satoshi text-black dark:text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shrink-0">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Request Return / Refund
                  </h3>
                  <p className="text-xs text-black/60 dark:text-zinc-400">
                    Order #{orderNumber} • ${total.toFixed(2)} USD
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
              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-zinc-800/60 text-xs text-black/70 dark:text-zinc-300">
                <p>
                  Submit a return & refund request for your delivered order. Our store admin team will review your request and process your refund of{' '}
                  <strong className="text-black dark:text-white font-mono">${total.toFixed(2)} USD</strong> back to your original payment method.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black/80 dark:text-zinc-200">
                  Select Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-9 rounded-xl border border-black/10 dark:border-zinc-800 bg-[#F0F0F0] dark:bg-black px-3 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Item size does not fit">Item size does not fit</option>
                  <option value="Item is defective or damaged">Item is defective or damaged</option>
                  <option value="Item does not match description">Item does not match description</option>
                  <option value="Received wrong item or color">Received wrong item or color</option>
                  <option value="No longer needed / Changed mind">No longer needed / Changed mind</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black/80 dark:text-zinc-200">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  rows={2}
                  placeholder="Tell us more about the issue..."
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-black/10 dark:border-zinc-800 bg-[#F0F0F0] dark:bg-black p-2.5 text-xs focus:outline-none resize-none"
                />
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
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending || Boolean(successMsg)}
                onClick={handleReturn}
                className="rounded-[62px] text-xs h-9 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-zinc-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Return Request</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
