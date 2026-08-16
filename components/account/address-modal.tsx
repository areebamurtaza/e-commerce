// components/account/address-modal.tsx
'use client';

import { useState, useTransition } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addUserAddress } from '@/actions/user';

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Label is required (e.g. Home, Office)'),
  street: z.string().trim().min(5, 'Street address must be at least 5 characters'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(2, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddressModal({ isOpen, onClose, onSuccess }: AddressModalProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'Home',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: false,
    },
  });

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<AddressFormValues> = (values) => {
    setServerError(null);

    startTransition(async () => {
      const result = await addUserAddress(values);

      if (!result.success) {
        setServerError(result.error || 'Failed to save address.');
        return;
      }

      reset();
      if (onSuccess) onSuccess();
      onClose();
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-satoshi text-black dark:text-white animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[500px] rounded-[24px] bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-zinc-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-black dark:text-white" />
            <h2 id="address-modal-title" className="font-integral text-xl font-bold uppercase tracking-tight">
              Add New Address
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close address modal"
            className="rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="mt-4 flex items-center gap-2 rounded-[14px] border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black dark:text-white">
              Address Label (e.g. Home, Office)
            </label>
            <Input
              placeholder="e.g. Home"
              className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs"
              {...register('label')}
            />
            {errors.label && (
              <p className="text-[11px] font-medium text-rose-500">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black dark:text-white">
              Street Address
            </label>
            <Input
              placeholder="123 Fashion Street, Apt 4B"
              className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs"
              {...register('street')}
            />
            {errors.street && (
              <p className="text-[11px] font-medium text-rose-500">{errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white">City</label>
              <Input
                placeholder="New York"
                className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs"
                {...register('city')}
              />
              {errors.city && (
                <p className="text-[11px] font-medium text-rose-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white">State / Province</label>
              <Input
                placeholder="NY"
                className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs"
                {...register('state')}
              />
              {errors.state && (
                <p className="text-[11px] font-medium text-rose-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white">Postal Code</label>
              <Input
                placeholder="10001"
                className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs"
                {...register('postalCode')}
              />
              {errors.postalCode && (
                <p className="text-[11px] font-medium text-rose-500">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white">Country</label>
              <Input
                placeholder="United States"
                className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs"
                {...register('country')}
              />
              {errors.country && (
                <p className="text-[11px] font-medium text-rose-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-black dark:accent-white"
              {...register('isDefault')}
            />
            <span className="text-xs font-medium text-black/80 dark:text-zinc-300">
              Set as primary default delivery address
            </span>
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-5 rounded-[62px] border-black/10 dark:border-zinc-700 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 px-6 rounded-[62px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 text-xs font-bold"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Address'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}