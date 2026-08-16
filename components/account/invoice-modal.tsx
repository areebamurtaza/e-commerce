// components/account/invoice-modal.tsx
'use client';

import { useRef } from 'react';
import { X, Printer, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DbOrderWithItems } from '@/actions/order';

export interface InvoiceModalProps {
  order: DbOrderWithItems | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-satoshi text-black dark:text-white animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 sm:p-10 shadow-2xl border border-black/10 dark:border-zinc-800 dark:bg-zinc-900 transition-all no-scrollbar">
        {/* Top Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-6 border-b border-black/10 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <h2 id="invoice-title" className="font-integral text-xl font-bold uppercase tracking-tight">
              Order Invoice
            </h2>
            <span className="text-xs text-black/50 dark:text-zinc-400 font-mono">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 px-4 rounded-[62px] border-black/10 dark:border-zinc-700 text-xs font-semibold gap-1.5 cursor-pointer bg-white dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice"
              className="rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div ref={printAreaRef} className="space-y-8 pt-6">
          {/* Header Brand & Invoice Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-black/10 dark:border-zinc-800">
            <div className="space-y-1.5">
              <h1 className="font-integral text-2xl sm:text-3xl font-extrabold tracking-tight">
                SHOP.CO
              </h1>
              <p className="text-xs text-black/60 dark:text-zinc-400 max-w-xs leading-relaxed">
                High-End Fashion & Apparel Global Inc.
                <br />
                125 Fashion Ave, Suite 400
                <br />
                New York, NY 10001, USA
              </p>
            </div>

            <div className="sm:text-right space-y-1 text-xs">
              <div className="font-bold text-sm text-black dark:text-white">
                INVOICE RECEIPT
              </div>
              <p className="text-black/60 dark:text-zinc-400">
                Invoice Date: <span className="font-semibold text-black dark:text-white">{formattedDate}</span>
              </p>
              <p className="text-black/60 dark:text-zinc-400">
                Order Ref: <span className="font-mono font-bold text-black dark:text-white">{order.orderNumber}</span>
              </p>
              <p className="text-black/60 dark:text-zinc-400">
                Payment Channel:{' '}
                <span className="font-semibold text-black dark:text-white">
                  {order.payment?.paymentMethod || 'Credit Card (Stripe)'}
                </span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="p-4 rounded-[16px] bg-[#F0F0F0]/60 dark:bg-zinc-800/60 border border-black/5 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-black dark:text-white pb-1 border-b border-black/5 dark:border-zinc-700">
                <MapPin className="h-4 w-4 text-black/60 dark:text-zinc-400" />
                <span>Billed & Shipped To</span>
              </div>
              <p className="font-bold text-black dark:text-white pt-1">{order.customerName}</p>
              <p className="text-black/70 dark:text-zinc-300">{order.shippingAddress}</p>
              <p className="text-black/60 dark:text-zinc-400">{order.customerEmail}</p>
            </div>

            <div className="p-4 rounded-[16px] bg-[#F0F0F0]/60 dark:bg-zinc-800/60 border border-black/5 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-black dark:text-white pb-1 border-b border-black/5 dark:border-zinc-700">
                <CreditCard className="h-4 w-4 text-black/60 dark:text-zinc-400" />
                <span>Payment & Order Status</span>
              </div>
              <p className="text-black/70 dark:text-zinc-300 pt-1">
                Order Status:{' '}
                <span className="font-bold text-black dark:text-white uppercase">
                  {order.status}
                </span>
              </p>
              <p className="text-black/70 dark:text-zinc-300">
                Payment Status:{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {order.paymentStatus}
                </span>
              </p>
              {order.payment?.stripePaymentIntentId && (
                <p className="text-[11px] font-mono text-black/50 dark:text-zinc-400 truncate">
                  Transaction: {order.payment.stripePaymentIntentId}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-zinc-400">
              Purchased Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-zinc-800 text-black/50 dark:text-zinc-400 font-bold uppercase text-[11px]">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5">Specs</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-zinc-800/60 font-medium">
                  {order.items.map((item) => (
                    <tr key={item.id} className="text-black dark:text-white">
                      <td className="py-3 pr-2 font-bold max-w-[220px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3 text-black/60 dark:text-zinc-400">
                        {item.size} / {item.color}
                      </td>
                      <td className="py-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 text-right text-black/70 dark:text-zinc-300">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-bold">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex justify-end pt-4 border-t border-black/10 dark:border-zinc-800">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-bold text-black dark:text-white">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Delivery / Shipping:</span>
                <span className="font-bold text-black dark:text-white">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount Applied:</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-black/10 dark:border-zinc-800 text-sm font-bold text-black dark:text-white">
                <span>Grand Total Paid:</span>
                <span>${order.total.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-black/10 dark:border-zinc-800 text-center text-[11px] text-black/40 dark:text-zinc-500 space-y-1">
            <p>Thank you for shopping with SHOP.CO. All returns must be initiated within 30 days.</p>
            <p>For support inquiries, contact support@shop.co with your Order Reference.</p>
          </div>
        </div>
      </div>
    </div>
  );
}