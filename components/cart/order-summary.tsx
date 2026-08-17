'use client';

import { useState } from 'react';
import { Tag, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  isPromoApplied: boolean;
  promoCode?: string;
  onApplyPromoCode: (code: string) => boolean;
  onRemovePromoCode?: () => void;
  onCheckout: () => void;
}

export function OrderSummary({
  subtotal,
  discountPercentage,
  discountAmount,
  deliveryFee,
  total,
  isPromoApplied,
  promoCode,
  onApplyPromoCode,
  onRemovePromoCode,
  onCheckout,
}: OrderSummaryProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code.');
      return;
    }

    const success = onApplyPromoCode(promoInput);
    if (success) {
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try "SHOP20" or "SAVE30"!');
    }
  };

  return (
    <div className="w-full bg-white rounded-[20px] border border-black/10 p-5 sm:p-6 flex flex-col gap-5 sm:gap-6">
      <h2 className="font-satoshi font-bold text-[20px] sm:text-[24px] leading-[27px] sm:leading-[32px] text-black">
        Order Summary
      </h2>

      {/* Breakdown Rows */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between font-satoshi text-[16px] sm:text-[20px]">
          <span className="text-black/60 font-normal">Subtotal</span>
          <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between font-satoshi text-[16px] sm:text-[20px]">
          <span className="text-black/60 font-normal">
            Discount {discountPercentage > 0 ? `(-${discountPercentage}%)` : ''}
          </span>
          <span className="font-bold text-[#FF3333]">-${discountAmount.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between font-satoshi text-[16px] sm:text-[20px]">
          <span className="text-black/60 font-normal">Delivery Fee</span>
          <span className="font-bold text-black">
            {deliveryFee === 0 ? (
              <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
            ) : (
              `$${deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="w-full h-[1px] bg-black/10 my-1" />

        <div className="flex items-center justify-between font-satoshi text-[18px] sm:text-[20px]">
          <span className="text-black font-normal">Total</span>
          <span className="font-bold text-[20px] sm:text-[24px] text-black">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Promo Code Input Form */}
      <div className="space-y-2">
        {isPromoApplied ? (
          <div className="flex items-center justify-between p-3 rounded-[16px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold uppercase">{promoCode || 'PROMO'}</span>
                <span className="text-[11px] ml-1.5 opacity-80">
                  ({discountPercentage}% Off Applied)
                </span>
              </div>
            </div>
            {onRemovePromoCode && (
              <button
                type="button"
                onClick={onRemovePromoCode}
                className="text-xs text-rose-600 hover:text-rose-800 underline font-medium cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex gap-3">
            <div className="flex-1 h-[48px] bg-[#F0F0F0] rounded-[62px] px-4 flex items-center gap-3">
              <Tag className="w-5 h-5 text-black/40 shrink-0" />
              <input
                type="text"
                placeholder="Add promo code (e.g. SHOP20)"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  setPromoError('');
                }}
                className="w-full bg-transparent font-satoshi font-normal text-[14px] sm:text-[16px] text-black placeholder:text-black/40 focus:outline-none uppercase"
                aria-label="Add promo code"
              />
            </div>

            <button
              type="submit"
              className="h-[48px] px-6 sm:px-7 bg-black text-white font-satoshi font-medium text-[14px] sm:text-[16px] rounded-[62px] hover:bg-black/80 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              Apply
            </button>
          </form>
        )}

        {promoError && (
          <span className="font-satoshi text-[12px] text-[#FF3333] pl-4 block">
            {promoError}
          </span>
        )}
      </div>

      {/* Checkout CTA */}
      <button
        type="button"
        onClick={onCheckout}
        className="w-full h-[54px] sm:h-[60px] bg-black text-white font-satoshi font-medium text-[16px] rounded-[62px] flex items-center justify-center gap-3 hover:bg-black/80 active:scale-98 transition-all cursor-pointer"
      >
        <span>Go to Checkout</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}