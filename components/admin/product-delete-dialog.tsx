// components/admin/product-delete-dialog.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { deleteProduct, archiveProduct } from '@/actions/product';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Archive,
  AlertTriangle,
  X,
  Loader2,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';

export interface ProductToDelete {
  id: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  price?: number;
}

interface ProductDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductToDelete | null;
  onDeleted?: (message: string) => void;
}

export function ProductDeleteDialog({
  isOpen,
  onClose,
  product,
  onDeleted,
}: ProductDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [linkedOrdersInfo, setLinkedOrdersInfo] = useState<{
    hasLinkedOrders: boolean;
    orderCount: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleCleanDelete = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteProduct(product.id, { force: false });

      if (res.success) {
        onClose();
        if (onDeleted) onDeleted(res.message || 'Product deleted successfully.');
      } else {
        if (res.data?.linkedOrders) {
          setLinkedOrdersInfo({
            hasLinkedOrders: true,
            orderCount: res.data.orderCount || 1,
          });
        } else {
          setErrorMsg(res.error || 'Failed to delete product.');
        }
      }
    });
  };

  const handleForceDelete = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteProduct(product.id, { force: true });

      if (res.success) {
        onClose();
        if (onDeleted) onDeleted(res.message || 'Product and related records permanently deleted.');
      } else {
        setErrorMsg(res.error || 'Failed to force delete product.');
      }
    });
  };

  const handleArchive = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await archiveProduct(product.id);

      if (res.success) {
        onClose();
        if (onDeleted) onDeleted(res.message || 'Product archived successfully.');
      } else {
        setErrorMsg(res.error || 'Failed to archive product.');
      }
    });
  };

  const handleModalClose = () => {
    if (isPending) return;
    setLinkedOrdersInfo(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 shadow-2xl overflow-hidden font-admin text-black dark:text-white animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Close Icon */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-black/10 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                linkedOrdersInfo
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {linkedOrdersInfo ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {linkedOrdersInfo ? 'Product Linked to Orders' : 'Delete Product'}
              </h2>
              <p className="text-xs text-black/60 dark:text-zinc-400">
                {linkedOrdersInfo
                  ? 'Active order history detected'
                  : 'Permanently remove from catalog'}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            disabled={isPending}
            className="p-1.5 rounded-full text-black/50 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-black/5 dark:bg-zinc-800/60 border border-black/5 dark:border-zinc-700/50">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shrink-0 border border-black/10 dark:border-zinc-800">
              <Image
                src={product.imageUrl || '/images/pd1.png'}
                alt={product.name}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold truncate text-black dark:text-white">
                {product.name}
              </h3>
              <p className="text-xs text-black/60 dark:text-zinc-400">
                {product.sku && <span className="font-mono">{product.sku} • </span>}
                {product.price !== undefined && (
                  <span className="font-semibold text-black dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Context Notice / Instructions */}
          {!linkedOrdersInfo ? (
            <div className="text-xs text-black/70 dark:text-zinc-300 leading-relaxed space-y-2">
              <p>
                Are you sure you want to delete this product? This action will permanently remove
                all associated variants, gallery images, and customer reviews.
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] border border-rose-200 dark:border-rose-900/50">
                <Info size={15} className="shrink-0" />
                <span>This action cannot be undone once executed.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldAlert size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Referenced in {linkedOrdersInfo.orderCount} Order(s)</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  This product has existing customer purchase history. Choose how you would like to proceed:
                </p>
              </div>

              <div className="grid gap-2 pt-1">
                <div className="p-3 rounded-xl border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left">
                  <p className="font-bold text-xs text-black dark:text-white flex items-center gap-1.5">
                    <Archive size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Option 1: Archive & Hide (Recommended)
                  </p>
                  <p className="text-[11px] text-black/60 dark:text-zinc-400 mt-1">
                    Zeroes inventory stock and removes the item from the storefront while keeping customer receipts and order records intact.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-left">
                  <p className="font-bold text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <Trash2 size={14} />
                    Option 2: Force Delete
                  </p>
                  <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                    Completely purges the product along with associated test order line items from the database.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-6 pt-2 pb-6 border-t border-black/10 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={isPending}
            className="w-full sm:w-auto h-9 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white px-5 cursor-pointer"
          >
            Cancel
          </Button>

          {!linkedOrdersInfo ? (
            <Button
              type="button"
              onClick={handleCleanDelete}
              disabled={isPending}
              className="w-full sm:w-auto h-9 text-xs font-semibold rounded-[62px] bg-rose-600 hover:bg-rose-700 text-white px-5 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Delete Product</span>
                </>
              )}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleArchive}
                disabled={isPending}
                className="w-full sm:w-auto h-9 text-xs font-semibold rounded-[62px] bg-emerald-600 hover:bg-emerald-700 text-white px-5 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : (
                  <>
                    <Archive size={14} />
                    <span>Archive & Hide</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleForceDelete}
                disabled={isPending}
                variant="outline"
                className="w-full sm:w-auto h-9 text-xs font-semibold rounded-[62px] border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Force Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Force Delete</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
