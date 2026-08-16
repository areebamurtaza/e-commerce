// components/admin/order-status-controller.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface OrderStatusControllerProps {
  orderId: string;
  initialStatus: OrderStatus;
  initialPaymentStatus: PaymentStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  SHIPPED: {
    label: 'Shipped',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
};

export function OrderStatusController({
  orderId,
  initialStatus,
  initialPaymentStatus,
}: OrderStatusControllerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStatusUpdate = () => {
    if (selectedStatus === currentStatus) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const response = await updateOrderStatus(orderId, selectedStatus);

      if (!response.success) {
        setErrorMessage(response.error || 'Failed to update order status.');
        setSelectedStatus(currentStatus);
        return;
      }

      if (response.data) {
        setCurrentStatus(response.data.currentStatus);
        setSelectedStatus(response.data.currentStatus);
      } else {
        setCurrentStatus(selectedStatus);
      }

      setSuccessMessage(`Order status updated to ${selectedStatus}`);
      router.refresh();
    });
  };

  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className="space-y-3 font-satoshi">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${config.bg} ${config.text} ${config.border}`}
        >
          Status: {config.label}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            disabled={isPending}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            aria-label="Change Order Status"
            className="h-9 rounded-full border border-black/10 bg-[#F0F0F0] px-4 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:ring-white"
          >
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled (Restock)</option>
          </select>

          <Button
            type="button"
            size="sm"
            onClick={handleStatusUpdate}
            disabled={isPending || selectedStatus === currentStatus}
            className="h-9 rounded-full bg-black px-4 text-xs font-bold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Apply Status
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}