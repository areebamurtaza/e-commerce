// components/checkout/stripe-payment-form.tsx
'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

interface StripePaymentFormProps {
  totalAmount: number;
  orderNumber: string;
  onSuccess: () => void;
}

export function StripePaymentForm({
  totalAmount,
  orderNumber,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePaymentSubmit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const returnUrl = `${window.location.origin}/order-confirmation?orderNumber=${orderNumber}`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment processing failed. Please check your card details.');
        setIsProcessing(false);
      } else {
        // Payment succeeded without requiring 3DS redirect
        onSuccess();
      }
    } catch (err) {
      console.error('[STRIPE_CONFIRMATION_ERROR]:', err);
      setErrorMessage('An unexpected error occurred while confirming payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-[12px] flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-[16px] border border-black/10 dark:border-zinc-800 shadow-inner">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Pay CTA Action */}
      <button
        type="button"
        onClick={handlePaymentSubmit}
        disabled={!stripe || isProcessing}
        className="w-full h-[54px] rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-bold text-[15px] sm:text-[16px] flex items-center justify-center gap-2 hover:bg-black/80 dark:hover:bg-white/80 transition-all active:scale-98 shadow-md disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying with Bank...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay ${totalAmount.toFixed(2)} Securely</span>
          </>
        )}
      </button>

      <p className="font-satoshi text-[11px] text-center text-black/40 dark:text-zinc-500">
        Transactions are encrypted with TLS 1.3 & 256-Bit AES Encryption via Stripe.
      </p>
    </div>
  );
}