'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { CartItemCard } from '@/components/cart/cart-item-card';
import { OrderSummary } from '@/components/cart/order-summary';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    items,
    discountPercentage,
    deliveryFee,
    isPromoApplied,
    updateQuantity,
    removeItem,
    applyPromoCode,
    getSubtotal,
    getDiscountAmount,
    getTotal,
  } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full bg-white min-h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  const handleCheckout = () => {
    alert('Proceeding to checkout page...');
  };

  return (
    <div className="w-full bg-white pb-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-3 py-5 sm:py-6 text-black/60 font-satoshi text-[14px] sm:text-[16px]"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="text-black/40" />
          <span className="text-black font-medium">Cart</span>
        </nav>

        {/* Page Title */}
        <h1 className="font-integral font-bold text-[32px] sm:text-[40px] leading-[38px] sm:leading-[48px] text-black uppercase mb-5 sm:mb-6">
          YOUR CART
        </h1>

        {items.length > 0 ? (
          /* 2-Column Responsive Layout */
          <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start">
            {/* Left Column: Cart Items Card Container */}
            <div className="w-full lg:w-[58%] xl:w-[715px] bg-white rounded-[20px] border border-black/10 px-4 sm:px-6 shrink-0">
              {items.map((item, index) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  isLast={index === items.length - 1}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                />
              ))}
            </div>

            {/* Right Column: Order Summary Card Container */}
            <div className="w-full lg:flex-1 xl:w-[505px] shrink-0 sticky top-28">
              <OrderSummary
                subtotal={subtotal}
                discountPercentage={discountPercentage}
                discountAmount={discountAmount}
                deliveryFee={deliveryFee}
                total={total}
                isPromoApplied={isPromoApplied}
                onApplyPromoCode={applyPromoCode}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        ) : (
          /* Empty Cart View */
          <div className="w-full bg-[#F0F0F0]/50 rounded-[20px] border border-black/10 py-16 px-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white border border-black/10 flex items-center justify-center text-black/60 shadow-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <h2 className="font-integral font-bold text-[24px] sm:text-[32px] text-black uppercase">
              Your Cart is Empty
            </h2>

            <p className="font-satoshi text-[14px] sm:text-[16px] text-black/60 max-w-[420px]">
              Looks like you haven&apos;t added any items to your shopping cart yet. Explore our top selling clothes and fresh new arrivals!
            </p>

            <Link
              href="/shop"
              className="mt-2 h-[52px] px-8 rounded-[62px] bg-black text-white font-satoshi font-medium text-[16px] flex items-center gap-2 hover:bg-black/80 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Explore Products</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}