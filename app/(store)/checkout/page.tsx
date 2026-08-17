// app/(store)/checkout/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Elements } from '@stripe/react-stripe-js';
import { useUser } from '@clerk/nextjs';
import {
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Truck,
  Banknote,
  ArrowLeft,
  Lock,
  Tag,
  CheckCircle2,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { checkoutFormSchema, CheckoutFormValues } from '@/schemas/checkout';
import { getStripe } from '@/lib/stripe-client';
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form';
import { ReservationTimer } from '@/components/checkout/reservation-timer';
import { createCashOnDeliveryOrder } from '@/actions/order';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);

  const {
    items,
    promoCode,
    discountPercentage,
    isPromoApplied,
    getSubtotal,
    getDiscountAmount,
    deliveryFee,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
    useCartStore.persist.rehydrate();
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      paymentMethod: 'CARD',
      saveInfo: true,
    },
    mode: 'onTouched',
  });

  // Autofill verified user data from Clerk
  useEffect(() => {
    if (isUserLoaded && user) {
      if (user.primaryEmailAddress?.emailAddress) {
        form.setValue('email', user.primaryEmailAddress.emailAddress, {
          shouldValidate: true,
        });
      }
      if (user.firstName)
        form.setValue('firstName', user.firstName, { shouldValidate: true });
      if (user.lastName)
        form.setValue('lastName', user.lastName, { shouldValidate: true });
    }
  }, [isUserLoaded, user, form]);

  const selectedPaymentMethod = form.watch('paymentMethod');

  const subtotal = isMounted ? getSubtotal() : 0;
  const discountAmount = isMounted ? getDiscountAmount() : 0;
  const shipping = items.length === 0 ? 0 : subtotal > 200 ? 0 : deliveryFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoMessage(null);

    const codeToApply = promoInput.trim();
    if (!codeToApply) {
      setPromoError('Please enter a promo code.');
      return;
    }

    const success = applyPromoCode(codeToApply);
    if (success) {
      setPromoMessage(`Promo code "${codeToApply.toUpperCase()}" applied successfully!`);
      setPromoInput('');
      // If payment intent was already loaded, reset it so new price is charged
      if (clientSecret) {
        setClientSecret(null);
      }
    } else {
      setPromoError('Invalid promo code. Try "SHOP20" or "SAVE30"!');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoMessage(null);
    setPromoError(null);
    if (clientSecret) {
      setClientSecret(null);
    }
  };

  const onShippingSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const formattedItems = items.map((item) => ({
        variantId: item.variantId || item.id,
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      }));

      // Cash On Delivery Flow
      if (data.paymentMethod === 'COD') {
        const codResult = await createCashOnDeliveryOrder({
          customerName: `${data.firstName.trim()} ${data.lastName.trim()}`,
          customerEmail: data.email.trim(),
          shippingAddress: `${data.address}${
            data.apartment ? ', ' + data.apartment : ''
          }`,
          city: data.city.trim(),
          postalCode: data.postalCode.trim(),
          country: 'United States',
          items: formattedItems,
          subtotal,
          shippingFee: shipping,
          discount: discountAmount,
          total: grandTotal,
          userId: user?.id,
        });

        if (!codResult.success || !codResult.data?.orderNumber) {
          throw new Error(
            codResult.error || 'Failed to place Cash on Delivery order.'
          );
        }

        clearCart();
        router.replace(
          `/order-confirmation?orderNumber=${codResult.data.orderNumber}`
        );
        return;
      }

      // Credit / Debit Card (Stripe Intent Initialization)
      const payload = {
        items: formattedItems,
        customerName: `${data.firstName.trim()} ${data.lastName.trim()}`,
        customerEmail: data.email.trim(),
        shippingAddress: `${data.address}, ${
          data.apartment ? data.apartment + ', ' : ''
        }${data.city}, ${data.state} ${data.postalCode}`,
        userId: user?.id,
        promoCode: isPromoApplied && promoCode ? promoCode : undefined,
      };

      const response = await fetch('/api/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to initialize payment gateway.');
      }

      setClientSecret(result.data.clientSecret);
      setActiveOrderId(result.data.orderId);
      setActiveOrderNumber(result.data.orderNumber);
      setReservationExpiresAt(result.data.expiresAt);
    } catch (error) {
      console.error('[CHECKOUT_SUBMISSION_ERROR]:', error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'An error occurred during checkout initialization.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full bg-white dark:bg-black min-h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="w-full bg-white dark:bg-black pb-20 font-satoshi text-black dark:text-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] pt-6">
          <div className="w-full bg-[#F0F0F0]/50 dark:bg-zinc-900/50 rounded-[20px] border border-black/10 dark:border-zinc-800 py-16 px-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-zinc-700 flex items-center justify-center text-black/60 dark:text-zinc-400 shadow-xs">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <h2 className="font-integral font-bold text-[24px] sm:text-[32px] uppercase">
              Your Cart is Empty
            </h2>

            <p className="font-satoshi text-[14px] sm:text-[16px] text-black/60 dark:text-zinc-400 max-w-[420px]">
              Add items from the catalog before proceeding to checkout.
            </p>

            <Link
              href="/shop"
              className="mt-2 h-[52px] px-8 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-medium text-[16px] flex items-center gap-2 hover:bg-black/80 dark:hover:bg-white/80 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-black pb-20 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-between py-5 sm:py-6 text-black/60 dark:text-zinc-400 font-satoshi text-[14px] sm:text-[16px]"
        >
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={16} className="text-black/40 dark:text-zinc-600" />
            <Link
              href="/cart"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Cart
            </Link>
            <ChevronRight size={16} className="text-black/40 dark:text-zinc-600" />
            <span className="text-black dark:text-white font-medium">Checkout</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[14px] text-black/60 dark:text-zinc-400 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
        </nav>

        <h1 className="font-integral font-bold text-[32px] sm:text-[40px] leading-[38px] sm:leading-[48px] uppercase mb-5 sm:mb-6">
          CHECKOUT
        </h1>

        {/* Error Notification */}
        {checkoutError && (
          <div className="mb-6 p-4 sm:p-5 rounded-[16px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-rose-600 dark:text-rose-400 text-sm font-medium">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{checkoutError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                clearCart();
                router.push('/shop');
              }}
              className="h-9 px-4 rounded-[62px] bg-rose-600 text-white font-satoshi font-bold text-xs flex items-center gap-2 hover:bg-rose-700 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw size={14} />
              <span>Reset Cart & View Catalog</span>
            </button>
          </div>
        )}

        {/* 2-Column Responsive Grid */}
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start">
          {/* Left Column: Shipping & Payment Cards */}
          <div className="w-full lg:w-[58%] xl:w-[715px] space-y-6 shrink-0">
            {/* 30-Minute Reservation Timer */}
            {clientSecret && reservationExpiresAt && (
              <ReservationTimer
                expiresAt={reservationExpiresAt}
                onExpire={() => {
                  setCheckoutError(
                    'Your 30-minute stock hold has expired. Please review your cart and re-initiate payment.'
                  );
                  setClientSecret(null);
                  setActiveOrderId(null);
                  setActiveOrderNumber(null);
                  setReservationExpiresAt(null);
                }}
              />
            )}

            {/* Form 1: Shipping Details Form */}
            <form
              id="shipping-form"
              onSubmit={form.handleSubmit(onShippingSubmit)}
              className="bg-white dark:bg-zinc-900 rounded-[20px] border border-black/10 dark:border-zinc-800 p-5 sm:p-7 space-y-5"
            >
              <div className="flex items-center gap-2.5 border-b border-black/10 dark:border-zinc-800 pb-4">
                <Truck className="w-5 h-5" />
                <h2 className="font-satoshi font-bold text-[20px]">Shipping Details</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    disabled={Boolean(clientSecret)}
                    placeholder="alex.smith@example.com"
                    className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-[12px] text-rose-600 px-3">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                      First Name *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(clientSecret)}
                      placeholder="Alex"
                      className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                      {...form.register('firstName')}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-[12px] text-rose-600 px-3">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(clientSecret)}
                      placeholder="Smith"
                      className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                      {...form.register('lastName')}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-[12px] text-rose-600 px-3">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    disabled={Boolean(clientSecret)}
                    placeholder="123 Fashion Street"
                    className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                    {...form.register('address')}
                  />
                  {form.formState.errors.address && (
                    <p className="text-[12px] text-rose-600 px-3">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                      City *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(clientSecret)}
                      placeholder="New York"
                      className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                      {...form.register('city')}
                    />
                    {form.formState.errors.city && (
                      <p className="text-[12px] text-rose-600 px-3">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                      State *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(clientSecret)}
                      placeholder="NY"
                      className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                      {...form.register('state')}
                    />
                    {form.formState.errors.state && (
                      <p className="text-[12px] text-rose-600 px-3">
                        {form.formState.errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(clientSecret)}
                      placeholder="10001"
                      className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                      {...form.register('postalCode')}
                    />
                    {form.formState.errors.postalCode && (
                      <p className="text-[12px] text-rose-600 px-3">
                        {form.formState.errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-satoshi font-medium text-[13px] sm:text-[14px]">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    disabled={Boolean(clientSecret)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                    {...form.register('phone')}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-[12px] text-rose-600 px-3">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* Payment Method Selector & Stripe Elements Container */}
            <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-black/10 dark:border-zinc-800 p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-black/10 dark:border-zinc-800 pb-4">
                <CreditCard className="w-5 h-5" />
                <h2 className="font-satoshi font-bold text-[20px]">Payment Method</h2>
              </div>

              {!clientSecret && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() =>
                      form.setValue('paymentMethod', 'CARD', { shouldValidate: true })
                    }
                    className={`cursor-pointer rounded-[16px] border p-4 flex flex-col justify-between space-y-3 transition-all ${
                      selectedPaymentMethod === 'CARD'
                        ? 'border-black dark:border-white bg-black/5 dark:bg-white/10 ring-1 ring-black dark:ring-white'
                        : 'border-black/10 dark:border-zinc-800 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-5 h-5" />
                      {selectedPaymentMethod === 'CARD' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-satoshi font-bold text-[14px]">
                        Credit / Debit Card
                      </p>
                      <p className="font-satoshi text-[12px] text-black/60 dark:text-zinc-400">
                        Stripe Elements Gateway
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      form.setValue('paymentMethod', 'COD', { shouldValidate: true })
                    }
                    className={`cursor-pointer rounded-[16px] border p-4 flex flex-col justify-between space-y-3 transition-all ${
                      selectedPaymentMethod === 'COD'
                        ? 'border-black dark:border-white bg-black/5 dark:bg-white/10 ring-1 ring-black dark:ring-white'
                        : 'border-black/10 dark:border-zinc-800 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      {selectedPaymentMethod === 'COD' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-satoshi font-bold text-[14px]">
                        Cash on Delivery
                      </p>
                      <p className="font-satoshi text-[12px] text-black/60 dark:text-zinc-400">
                        Pay upon delivery
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form 2: Standalone Stripe Elements Form (Non-nested) */}
              {clientSecret && activeOrderId && activeOrderNumber && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-black/60 dark:text-zinc-400">
                      Order Reference: {activeOrderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setClientSecret(null);
                        setActiveOrderId(null);
                        setActiveOrderNumber(null);
                        setReservationExpiresAt(null);
                      }}
                      className="text-xs text-black dark:text-white underline font-medium cursor-pointer"
                    >
                      Edit Shipping Info
                    </button>
                  </div>

                  <Elements
                    stripe={getStripe()}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'flat',
                        variables: {
                          colorPrimary: '#000000',
                          borderRadius: '12px',
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      orderId={activeOrderId}
                      orderNumber={activeOrderNumber}
                      totalAmount={grandTotal}
                      onSuccess={(orderNum) => {
                        clearCart();
                        router.replace(
                          `/order-confirmation?orderNumber=${orderNum}`
                        );
                      }}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:flex-1 xl:w-[505px] shrink-0 sticky top-28">
            <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-black/10 dark:border-zinc-800 p-5 sm:p-6 space-y-6">
              <h2 className="font-satoshi font-bold text-[20px] sm:text-[24px] pb-4 border-b border-black/10 dark:border-zinc-800">
                Order Summary
              </h2>

              <div className="max-h-[240px] overflow-y-auto space-y-3 pr-1 divide-y divide-black/10 dark:divide-zinc-800 no-scrollbar">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 pt-3 first:pt-0"
                  >
                    <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-[12px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0] dark:bg-zinc-800">
                      <Image
                        src={item.image || '/images/pd1.png'}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white font-satoshi">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-satoshi font-bold text-[14px] truncate">
                        {item.title}
                      </h4>
                      <p className="font-satoshi text-[12px] text-black/60 dark:text-zinc-400">
                        Size: {item.size} • Color: {item.color}
                      </p>
                    </div>
                    <div className="font-satoshi font-bold text-[14px]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input & Badges */}
              <div className="space-y-2 pt-2">
                {isPromoApplied && promoCode ? (
                  <div className="flex items-center justify-between p-3 rounded-[16px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-bold uppercase">{promoCode}</span>
                        <span className="text-[11px] ml-1.5 opacity-80">
                          ({discountPercentage}% Off Applied)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 underline font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Add promo code (e.g. SHOP20)"
                        className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none pl-12 pr-4 font-satoshi text-[14px] placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white uppercase"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          setPromoError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo(e);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="h-[48px] px-6 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-bold text-[14px] hover:bg-black/80 dark:hover:bg-white/80 transition-all shrink-0 active:scale-95 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {promoError && (
                  <p className="text-[12px] text-rose-500 font-medium pl-3">
                    {promoError}
                  </p>
                )}

                {promoMessage && (
                  <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium pl-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 pt-3 border-t border-black/10 dark:border-zinc-800 font-satoshi text-[15px] sm:text-[16px]">
                <div className="flex justify-between text-black/60 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-black dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-black/60 dark:text-zinc-400">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black dark:text-white">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 uppercase text-xs font-bold">
                        Free
                      </span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>
                      Discount {discountPercentage > 0 ? `(-${discountPercentage}%)` : ''}
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-black/10 dark:border-zinc-800 text-[20px] font-bold">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Shipping / COD Submission Trigger */}
              {!clientSecret ? (
                <button
                  type="submit"
                  form="shipping-form"
                  disabled={isSubmitting}
                  className="w-full min-h-[50px] py-3.5 px-5 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-semibold text-[14px] sm:text-[15px] flex items-center justify-center gap-2 hover:bg-black/85 dark:hover:bg-white/85 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Initializing Gateway...</span>
                    </span>
                  ) : selectedPaymentMethod === 'CARD' ? (
                    <span className="flex items-center justify-center gap-1.5 text-center leading-tight">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Continue to Payment</span>
                      <span className="font-bold ml-0.5">(${grandTotal.toFixed(2)})</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 text-center leading-tight">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Confirm Cash on Delivery</span>
                      <span className="font-bold ml-0.5">(${grandTotal.toFixed(2)})</span>
                    </span>
                  )}
                </button>
              ) : (
                <div className="rounded-[16px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Shipping verified. Complete payment on the left.</span>
                </div>
              )}

              <p className="font-satoshi text-[11px] text-center text-black/40 dark:text-zinc-500">
                By placing your order you agree to SHOP.CO Terms of Service & Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}