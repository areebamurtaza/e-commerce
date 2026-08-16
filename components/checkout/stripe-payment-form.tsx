// components/checkout/stripe-payment-form.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { confirmStripeOrderPayment } from '@/actions/order';
import { Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface StripePaymentFormProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  onSuccess?: (orderNumber: string) => void;
}

export function StripePaymentForm({
  orderId,
  orderNumber,
  totalAmount,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent default form action and stop event bubbling to any parent containers
    e.preventDefault();
    e.stopPropagation();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Authorize card payment with Stripe Elements SDK
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        setErrorMessage(stripeError.message || 'Card authorization failed.');
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 2. Finalize atomic inventory deduction and settle payment status
        const settleResult = await confirmStripeOrderPayment(orderId, paymentIntent.id);

        if (!settleResult.success) {
          setErrorMessage(settleResult.error || 'Failed to settle order.');
          setIsLoading(false);
          return;
        }

        // 3. Clear cart and trigger redirect
        if (onSuccess) {
          onSuccess(orderNumber);
        } else {
          router.replace(`/order-confirmation?orderNumber=${orderNumber}`);
        }
      } else {
        setErrorMessage('Payment was not completed. Please check your details and try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[STRIPE_PAYMENT_SUBMIT_ERROR]:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred during payment processing.'
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-satoshi">
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-[16px] border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="rounded-[16px] border border-black/10 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-black/50 dark:text-zinc-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          256-bit TLS encrypted
        </span>
        <span>Stripe Gateway</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="h-12 w-full rounded-[62px] bg-black text-sm font-bold text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Settling ${totalAmount.toFixed(2)} USD...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Authorize & Pay ${totalAmount.toFixed(2)} USD
          </>
        )}
      </Button>
    </form>
  );
}