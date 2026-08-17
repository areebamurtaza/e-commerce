// components/invoice/printable-invoice.tsx
import Image from 'next/image';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface PrintableInvoiceProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date | string;
    payment?: {
      paymentMethod: string;
      status: PaymentStatus;
    } | null;
    items: Array<{
      id: string;
      title: string;
      size: string;
      color: string;
      unitPrice: number;
      quantity: number;
      total: number;
      variant?: {
        sku?: string;
        product?: {
          images?: Array<{ url: string; isPrimary?: boolean }>;
        };
      };
      image?: string;
    }>;
  };
}

export function PrintableInvoice({ order }: PrintableInvoiceProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const paymentMethodLabel =
    order.payment?.paymentMethod === 'COD'
      ? 'Cash on Delivery (COD)'
      : order.payment?.paymentMethod === 'CARD' || order.payment?.paymentMethod === 'STRIPE'
      ? 'Credit / Debit Card (Stripe Secured)'
      : 'Card Payment';

  const isPaid = order.paymentStatus === PaymentStatus.SUCCEEDED;

  return (
    <div
      id="printable-invoice"
      className="hidden print:block bg-white text-black p-8 font-sans max-w-[800px] mx-auto"
      style={{ colorScheme: 'light' }}
    >
      {/* Invoice Header */}
      <div className="flex items-start justify-between border-b-2 border-black pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">SHOP.CO</h1>
          <p className="text-xs text-gray-600 mt-0.5">High-End Contemporary Fashion & Apparel</p>
          <p className="text-[11px] text-gray-500 mt-1">
            Web: <span className="font-semibold text-gray-700">shop.co</span> • Concierge: support@shop.co
          </p>
        </div>

        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded mb-1">
            Official Invoice
          </div>
          <p className="text-sm font-mono font-bold text-gray-900 mt-1">{order.orderNumber}</p>
          <p className="text-xs text-gray-500">Date: {formattedDate}</p>
        </div>
      </div>

      {/* Billed To & Payment Meta */}
      <div className="grid grid-cols-2 gap-8 py-6 border-b border-gray-200 text-xs">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Billed & Shipped To:
          </h3>
          <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
          <p className="text-gray-700 mt-0.5">{order.customerEmail}</p>
          <p className="text-gray-700 mt-1 leading-relaxed whitespace-pre-line">
            {order.shippingAddress}
          </p>
        </div>

        <div className="text-right">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Payment & Order Status:
          </h3>
          <p className="text-gray-900">
            Payment Method: <span className="font-semibold">{paymentMethodLabel}</span>
          </p>
          <p className="mt-1">
            Payment Status:{' '}
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isPaid ? 'PAID & VERIFIED' : 'PENDING SETTLEMENT'}
            </span>
          </p>
          <p className="text-gray-900 mt-1">
            Fulfillment: <span className="font-semibold uppercase">{order.status}</span>
          </p>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="py-6 border-b border-gray-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 bg-gray-50">
              <th className="py-2.5 px-3 font-bold uppercase text-gray-800">#</th>
              <th className="py-2.5 px-3 font-bold uppercase text-gray-800">Item Description</th>
              <th className="py-2.5 px-3 font-bold uppercase text-gray-800">Variant</th>
              <th className="py-2.5 px-3 font-bold uppercase text-center text-gray-800">Qty</th>
              <th className="py-2.5 px-3 font-bold uppercase text-right text-gray-800">Unit Price</th>
              <th className="py-2.5 px-3 font-bold uppercase text-right text-gray-800">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item, idx) => {
              const sku = item.variant?.sku || `SKU-${idx + 1}`;
              const imageUrl =
                item.variant?.product?.images?.[0]?.url ||
                item.image ||
                '/images/pd1.png';

              return (
                <tr key={item.id} className="align-middle">
                  <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-[10px] font-mono text-gray-500">{sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-700">
                    Size: <span className="font-semibold">{item.size}</span>
                    <br />
                    Color: <span className="font-semibold">{item.color}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-gray-700">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">${item.total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-between items-start py-6 border-b border-gray-200">
        <div className="w-1/2 pr-6 text-xs text-gray-500 space-y-1">
          <p className="font-bold text-gray-700">Return & Exchange Policy:</p>
          <p className="text-[11px] leading-relaxed">
            Items may be returned or exchanged within 30 days of receipt in original, unworn condition with tags attached.
          </p>
        </div>

        <div className="w-1/2 max-w-[260px] space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">${order.subtotal.toFixed(2)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Promotional Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Delivery / Shipping</span>
            <span className="font-semibold text-gray-900">
              {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t-2 border-black text-sm font-extrabold text-black">
            <span>Total Paid (USD)</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Invoice Footer */}
      <div className="pt-6 text-center text-[11px] text-gray-400">
        <p className="font-semibold text-gray-600">Thank you for choosing SHOP.CO!</p>
        <p className="mt-0.5">This document serves as an official electronic receipt and tax invoice for order #{order.orderNumber}.</p>
      </div>
    </div>
  );
}
