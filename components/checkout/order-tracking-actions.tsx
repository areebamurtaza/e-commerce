// components/checkout/order-tracking-actions.tsx
'use client';

import { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderTrackingActionsProps {
  orderNumber: string;
}

export function OrderTrackingActions({ orderNumber }: OrderTrackingActionsProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopyOrderNumber}
        className="h-8 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-semibold gap-1.5 cursor-pointer bg-white dark:bg-zinc-900"
      >
        {copied ? (
          <>
            <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span>Copy #</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePrintReceipt}
        className="h-8 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-semibold gap-1.5 cursor-pointer bg-white dark:bg-zinc-900"
      >
        <Printer size={13} />
        <span>Print Receipt</span>
      </Button>
    </div>
  );
}