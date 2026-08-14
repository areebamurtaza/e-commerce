'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  CreditCard,
} from 'lucide-react';

interface OrderItem {
  id: string;
  title: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetails {
  orderNumber: string;
  date: string;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const orderId = resolvedParams.id || 'ORD-894201';

  // Mock order data for hydrated presentation
  const mockOrder: OrderDetails = {
    orderNumber: orderId,
    date: 'August 13, 2026',
    status: 'PROCESSING',
    items: [
      {
        id: '1',
        title: 'Gradient Graphic T-shirt',
        size: 'Large',
        color: 'White',
        price: 145,
        quantity: 1,
        image: '/images/m2.png',
      },
      {
        id: '2',
        title: 'Checkered Shirt',
        size: 'Medium',
        color: 'Red',
        price: 180,
        quantity: 1,
        image: '/images/n3.png',
      },
    ],
    shippingAddress: {
      name: 'Alex Smith',
      street: '123 Fashion Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'Credit Card (Stripe)',
    subtotal: 325.0,
    shippingFee: 0.0,
    tax: 26.0,
    total: 351.0,
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(mockOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) {
    return (
      <div className="w-full bg-white min-h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white pb-20 pt-6">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-satoshi text-[14px] text-black/60 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-satoshi font-semibold">
            <ShieldCheck size={16} />
            <span>Verified Purchase</span>
          </div>
        </div>

        {/* Hero Order Status Header */}
        <div className="bg-[#F0F0F0]/60 rounded-[20px] border border-black/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="font-integral font-bold text-[24px] sm:text-[32px] text-black uppercase">
                  ORDER CONFIRMED
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[12px] font-satoshi font-bold px-3 py-1 rounded-full">
                  Processing
                </span>
              </div>
              <p className="font-satoshi text-[14px] text-black/60">
                Thank you for your purchase! We are preparing your items for shipment.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-[62px] border border-black/10 shrink-0">
              <span className="font-satoshi text-[13px] text-black/60">Order #</span>
              <span className="font-satoshi font-bold text-[14px] text-black">
                {mockOrder.orderNumber}
              </span>
              <button
                onClick={copyOrderNumber}
                className="p-1 hover:bg-black/5 rounded-full transition-colors ml-1 text-black/60 hover:text-black"
                title="Copy Order Number"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Fulfillment Tracking Progress Bar */}
          <div className="pt-4 border-t border-black/10 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-black">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-satoshi font-bold text-[13px] sm:text-[15px]">Placed</span>
              </div>
              <div className="h-2 w-full bg-emerald-600 rounded-full" />
              <p className="font-satoshi text-[11px] text-black/50">{mockOrder.date}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-black">
                <Clock className="w-5 h-5 text-black shrink-0" />
                <span className="font-satoshi font-bold text-[13px] sm:text-[15px]">Processing</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-black animate-pulse" />
              </div>
              <p className="font-satoshi text-[11px] text-black/50">Expected in 24h</p>
            </div>

            <div className="space-y-2 opacity-50">
              <div className="flex items-center gap-2 text-black/60">
                <Truck className="w-5 h-5 shrink-0" />
                <span className="font-satoshi font-bold text-[13px] sm:text-[15px]">Delivered</span>
              </div>
              <div className="h-2 w-full bg-black/10 rounded-full" />
              <p className="font-satoshi text-[11px] text-black/50">Est. Aug 16, 2026</p>
            </div>
          </div>
        </div>

        {/* 2-Column Order Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-7 bg-white rounded-[20px] border border-black/10 p-6 space-y-4">
            <h2 className="font-satoshi font-bold text-[20px] text-black pb-3 border-b border-black/10">
              Ordered Items ({mockOrder.items.length})
            </h2>

            <div className="divide-y divide-black/10">
              {mockOrder.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-[12px] bg-[#F0F0F0] border border-black/10">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-satoshi font-bold text-[16px] text-black truncate">
                      {item.title}
                    </h3>
                    <p className="font-satoshi text-[13px] text-black/60">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="font-satoshi text-[13px] text-black/60">
                      Qty: <span className="font-bold text-black">{item.quantity}</span>
                    </p>
                  </div>
                  <div className="font-satoshi font-bold text-[16px] text-black">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Address, Payment & Financial Ledger */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Address & Payment Summary */}
            <div className="bg-white rounded-[20px] border border-black/10 p-6 space-y-4">
              <div className="space-y-3 pb-4 border-b border-black/10">
                <div className="flex items-center gap-2 text-black font-satoshi font-bold text-[16px]">
                  <MapPin size={18} />
                  <span>Shipping Address</span>
                </div>
                <div className="font-satoshi text-[14px] text-black/70 space-y-0.5 pl-6">
                  <p className="font-bold text-black">{mockOrder.shippingAddress.name}</p>
                  <p>{mockOrder.shippingAddress.street}</p>
                  <p>
                    {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.state}{' '}
                    {mockOrder.shippingAddress.postalCode}
                  </p>
                  <p>{mockOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-black font-satoshi font-bold text-[16px]">
                  <CreditCard size={18} />
                  <span>Payment Method</span>
                </div>
                <p className="font-satoshi text-[14px] text-black/70 pl-6">
                  {mockOrder.paymentMethod}
                </p>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="bg-[#F0F0F0]/50 rounded-[20px] border border-black/10 p-6 space-y-3 font-satoshi text-[15px]">
              <h3 className="font-bold text-[18px] text-black pb-2 border-b border-black/10">
                Payment Breakdown
              </h3>
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span className="font-bold text-black">${mockOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Sales Tax (8%)</span>
                <span className="font-bold text-black">${mockOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-black/10 text-[18px] font-bold text-black">
                <span>Total Paid</span>
                <span>${mockOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}