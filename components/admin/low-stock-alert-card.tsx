// components/admin/low-stock-alert-card.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LowStockVariantItem,
  quickRestockVariant,
} from '@/actions/product';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertTriangle,
  PackagePlus,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { AdminToast, AdminToastState } from '@/components/admin/admin-toast';

interface LowStockAlertCardProps {
  initialVariants: LowStockVariantItem[];
}

export function LowStockAlertCard({ initialVariants }: LowStockAlertCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [toastState, setToastState] = useState<AdminToastState | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantityForVariant = (variantId: string) => {
    return quantities[variantId] !== undefined ? quantities[variantId] : 20;
  };

  const handleRestock = (variantId: string) => {
    const qtyToAdd = getQuantityForVariant(variantId);
    if (qtyToAdd <= 0) {
      setToastState({
        type: 'error',
        message: 'Please enter a valid restock quantity greater than 0.',
      });
      return;
    }

    setRestockingId(variantId);
    startTransition(async () => {
      const res = await quickRestockVariant(variantId, qtyToAdd);
      setRestockingId(null);
      if (res.success) {
        setToastState({
          type: 'success',
          message: res.message || `Successfully added +${qtyToAdd} units.`,
        });
        router.refresh();
      } else {
        setToastState({
          type: 'error',
          message: res.error || 'Failed to restock.',
        });
      }
    });
  };

  return (
    <div className="space-y-3 font-admin">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <span>Low Inventory Warnings</span>
          {initialVariants.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {initialVariants.length} critical
            </span>
          )}
        </h2>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-black/60 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1"
        >
          View all catalog <ChevronRight size={13} />
        </Link>
      </div>

      {initialVariants.length === 0 ? (
        <Card className="rounded-[20px] border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 text-center shadow-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              All Inventory Stock Healthy
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-sm">
              No variant stock has fallen below the 5-unit critical reorder threshold.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {initialVariants.map((item) => {
            const isOutOfStock = item.stockQuantity === 0;
            const isRestockingThis = restockingId === item.id;
            const currentQty = getQuantityForVariant(item.id);

            return (
              <Card
                key={item.id}
                className="rounded-[18px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs hover:border-black/20 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F0F0F0] dark:bg-zinc-800 shrink-0 border border-black/5 dark:border-zinc-700">
                      <Image
                        src={item.imageUrl}
                        alt={item.productTitle}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-black dark:text-white truncate">
                        {item.productTitle}
                      </p>
                      <p className="text-[11px] text-black/60 dark:text-zinc-400 font-mono truncate">
                        {item.size} • {item.colorName} • {item.sku}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isOutOfStock ? '0 units (Sold Out)' : `${item.stockQuantity} units remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Custom Restock Input & Action */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <div className="flex items-center bg-[#F0F0F0] dark:bg-zinc-800 rounded-[62px] border border-black/10 dark:border-zinc-700 px-2 h-8">
                      <span className="text-[11px] font-bold text-black/40 dark:text-zinc-500 mr-1 select-none">
                        +
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={currentQty === 0 ? '' : currentQty}
                        placeholder="20"
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: isNaN(val) ? 0 : Math.max(1, val),
                          }));
                        }}
                        className="w-11 bg-transparent text-center text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                        title="Enter custom restock amount (e.g. 5, 18, 50)"
                      />
                    </div>

                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleRestock(item.id)}
                      className="h-8 text-xs font-bold rounded-[62px] bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isRestockingThis ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <PackagePlus size={13} />
                          <span>Restock</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AdminToast toast={toastState} onDismiss={() => setToastState(null)} />
    </div>
  );
}
