// components/admin/admin-order-detail-client.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrintableInvoice } from '@/components/invoice/printable-invoice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Printer,
  Edit,
  CheckCircle2,
  Truck,
  Package,
  Check,
  CreditCard,
  ArrowLeft,
  User,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
} from 'lucide-react';

interface OrderDetailClientProps {
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
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      imageUrl: string | null;
    } | null;
    payment: {
      paymentMethod: string;
      stripePaymentIntentId: string | null;
      status: PaymentStatus;
      amount: number;
    } | null;
    items: Array<{
      id: string;
      title: string;
      size: string;
      color: string;
      unitPrice: number;
      quantity: number;
      total: number;
      variant: {
        sku: string;
        product: {
          images: Array<{ url: string }>;
        };
      };
    }>;
  };
}

export function AdminOrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);

  const steps: Array<{ status: OrderStatus; label: string; icon: typeof CheckCircle2 }> = [
    { status: OrderStatus.PENDING, label: 'Pending', icon: Package },
    { status: OrderStatus.PROCESSING, label: 'Processing', icon: CheckCircle2 },
    { status: OrderStatus.SHIPPED, label: 'Shipped', icon: Truck },
    { status: OrderStatus.DELIVERED, label: 'Delivered', icon: Check },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 0;
      case OrderStatus.PROCESSING:
        return 1;
      case OrderStatus.SHIPPED:
        return 2;
      case OrderStatus.DELIVERED:
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentStatus);

  const handleStatusDispatch = async (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    startTransition(async () => {
      await updateOrderStatus(order.id, newStatus);
      router.refresh();
    });
  };

  const handleAdvanceStatus = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextStatus = steps[currentStepIdx + 1].status;
      handleStatusDispatch(nextStatus);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 font-satoshi text-black dark:text-white transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/orders')}
            className="h-8 w-8 rounded-lg border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-integral uppercase tracking-tight text-black dark:text-white">
              Order {order.orderNumber}
            </h1>
            <p className="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
              Placed on{' '}
              <span className="font-semibold text-black dark:text-white">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrintReceipt}
            variant="outline"
            size="sm"
            className="h-8.5 text-xs font-semibold gap-1.5 rounded-[62px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white px-5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print Invoice
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={isPending}
                className="h-8.5 text-xs font-semibold gap-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-[62px] px-5"
              >
                <Edit className="h-3.5 w-3.5" /> {isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs font-satoshi">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-black/40 dark:text-zinc-500">
                Change Order Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {steps.map((st) => (
                <DropdownMenuItem
                  key={st.status}
                  onClick={() => handleStatusDispatch(st.status)}
                  className="cursor-pointer font-medium"
                >
                  Mark {st.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusDispatch(OrderStatus.CANCELLED)}
                className="cursor-pointer text-rose-600 font-bold"
              >
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stepper Progress */}
      {currentStatus === OrderStatus.CANCELLED ? (
        <Card className="border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h4 className="font-bold text-sm">Order Cancelled</h4>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                This order was cancelled and inventory quantities have been rolled back.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-black dark:text-white">Delivery Pipeline</h2>
            {currentStepIdx < steps.length - 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAdvanceStatus}
                className="text-xs font-bold text-black dark:text-white hover:bg-[#F0F0F0] dark:hover:bg-zinc-800"
              >
                Next Step →
              </Button>
            )}
          </div>

          <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
            <div className="absolute left-10 right-10 top-5 h-1 bg-[#F0F0F0] dark:bg-black -z-0">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-300"
                style={{
                  width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              const isCompleted = idx <= currentStepIdx;
              return (
                <div key={step.label} className="relative z-10 flex flex-col items-center gap-2 text-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black'
                        : 'bg-[#F0F0F0] dark:bg-black text-black/40 dark:text-zinc-500'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isCompleted ? 'text-black dark:text-white' : 'text-black/40 dark:text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <span className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              Current Status: {steps[currentStepIdx]?.label}
            </span>
          </div>
        </Card>
      )}

      {/* 2-Column Details Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (7 cols): Customer & Items */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white pb-2 border-b border-black/10 dark:border-zinc-800">
              Customer Information
            </h3>
            <div className="text-xs space-y-2 text-black/70 dark:text-zinc-300">
              <p className="font-bold text-black dark:text-white text-sm flex items-center gap-2">
                <User size={14} /> {order.customerName}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} /> {order.customerEmail}
              </p>
              {order.user?.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {order.user.phone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <MapPin size={14} /> {order.shippingAddress}
              </p>
            </div>

            <div className="rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-black/50 p-4 space-y-1 mt-4">
              <span className="text-xs font-bold text-black dark:text-white block">Payment Details</span>
              <p className="text-xs text-black/70 dark:text-zinc-300 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-black/50 dark:text-zinc-400" />
                Method: {order.payment?.paymentMethod ?? 'STRIPE'}
              </p>
              {order.payment?.stripePaymentIntentId && (
                <p className="text-[10px] font-mono text-black/40 dark:text-zinc-500">
                  PI: {order.payment.stripePaymentIntentId}
                </p>
              )}
            </div>
          </Card>

          {/* Line Items Table */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 dark:border-zinc-800 text-black/40 dark:text-zinc-500 font-semibold">
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Size / Color</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
                  {order.items.map((item) => {
                    const imgUrl =
                      item.variant?.product?.images?.[0]?.url || '/images/hero1.png';
                    return (
                      <tr key={item.id}>
                        <td className="py-3 flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-[10px] overflow-hidden bg-[#F0F0F0] dark:bg-black shrink-0 border border-black/10 dark:border-zinc-800">
                            <Image src={imgUrl} alt={item.title} fill className="object-cover" />
                          </div>
                          <span className="font-bold text-black dark:text-white">{item.title}</span>
                        </td>
                        <td className="py-3 font-medium text-black/70 dark:text-zinc-300">
                          {item.size} / {item.color}
                        </td>
                        <td className="py-3 font-semibold text-black/70 dark:text-zinc-300">
                          {item.quantity}
                        </td>
                        <td className="py-3 font-medium text-black/60 dark:text-zinc-400">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-bold text-black dark:text-white">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Financial Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white pb-2 border-b border-black/10 dark:border-zinc-800">
              Financial Breakdown
            </h3>
            <div className="space-y-3 text-xs font-satoshi">
              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-bold text-black dark:text-white">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-bold">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-black/60 dark:text-zinc-400">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/10 dark:border-zinc-800 pt-3 text-base font-bold text-black dark:text-white">
                <span>Total Amount</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dedicated Printable Commercial Tax Invoice (Only visible when printing) */}
      <PrintableInvoice order={order} />
    </div>
  );
}