// components/account/invoice-modal.tsx
'use client';

import { useState } from 'react';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface InvoiceItem {
  id: string;
  title: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatusType = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface InvoiceData {
  orderNumber: string;
  dateIssued: string;
  paymentMethod: string;
  status: OrderStatusType;
  customerName: string;
  shippingAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Item',
      'Size',
      'Color',
      'Qty',
      'Unit Price',
      'Total Paid',
    ];
    const rows = invoice.items.map((item) => [
      invoice.orderNumber,
      `"${invoice.dateIssued}"`,
      `"${invoice.customerName}"`,
      `"${item.title}"`,
      item.size,
      item.color,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`,
      `$${invoice.total.toFixed(2)}`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Receipt_${invoice.orderNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeStyle = (status: OrderStatusType) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';
      case 'Shipped':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300';
      case 'Processing':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300';
      case 'Pending':
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-satoshi text-black dark:text-white transition-colors">
        {/* Modal Header Actions */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-integral text-xl font-bold tracking-tight text-black dark:text-white">
              SHOP.CO
            </span>
            <span className="text-xs text-black/40 dark:text-zinc-500 font-bold uppercase tracking-wider">
              Official Digital Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-bold flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">CSV</span>
            </Button>

            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-bold flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>{isPrinting ? 'Preparing...' : 'Print'}</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="bg-[#F0F0F0]/60 dark:bg-black rounded-[20px] p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-black/5 dark:border-zinc-800">
          <div>
            <span className="text-black/50 dark:text-zinc-500 font-medium block">Invoice Number:</span>
            <span className="font-mono font-bold text-sm text-black dark:text-white">
              {invoice.orderNumber}
            </span>
          </div>
          <div>
            <span className="text-black/50 dark:text-zinc-500 font-medium block">Date Issued:</span>
            <span className="font-bold text-black dark:text-white">{invoice.dateIssued}</span>
          </div>
          <div>
            <span className="text-black/50 dark:text-zinc-500 font-medium block">Payment Method:</span>
            <span className="font-bold text-black dark:text-white">{invoice.paymentMethod}</span>
          </div>
          <div>
            <span className="text-black/50 dark:text-zinc-500 font-medium block">Status:</span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-0.5 ${getStatusBadgeStyle(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-zinc-500">
            Billed & Shipped To:
          </h4>
          <p className="font-bold text-base text-black dark:text-white">{invoice.customerName}</p>
          <p className="text-xs text-black/70 dark:text-zinc-300 leading-relaxed max-w-md">
            {invoice.shippingAddress}
          </p>
        </div>

        {/* Itemized Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-zinc-500 border-b border-black/10 dark:border-zinc-800 pb-2">
            Itemized Details
          </h4>

          <div className="divide-y divide-black/10 dark:divide-zinc-800">
            {invoice.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                <div className="space-y-0.5">
                  <p className="font-bold text-black dark:text-white">{item.title}</p>
                  <p className="text-xs text-black/60 dark:text-zinc-400">
                    Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="font-mono font-bold text-black dark:text-white">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger Calculations */}
        <div className="border-t border-black/10 dark:border-zinc-800 pt-4 space-y-2 text-sm font-satoshi">
          <div className="flex justify-between text-black/60 dark:text-zinc-400">
            <span>Subtotal</span>
            <span className="font-mono text-black dark:text-white">${invoice.subtotal.toFixed(2)}</span>
          </div>

          {invoice.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Promo Discount</span>
              <span className="font-mono">-${invoice.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-black/60 dark:text-zinc-400">
            <span>Delivery Fee</span>
            <span className="font-mono text-black dark:text-white">
              {invoice.shippingFee === 0 ? 'FREE' : `$${invoice.shippingFee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between border-t border-black/10 dark:border-zinc-800 pt-3 text-lg font-bold text-black dark:text-white">
            <span>Total Paid</span>
            <span className="font-mono">${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/10 dark:border-zinc-800 pt-4 flex items-center justify-between text-xs text-black/40 dark:text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>Verified Official SHOP.CO Digital Receipt</span>
          </div>
          <span className="font-mono">ID: {invoice.orderNumber}-AUTH</span>
        </div>
      </div>
    </div>
  );
}