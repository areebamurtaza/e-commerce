// components/account/address-modal.tsx
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addressSchema, AddressFormValues } from '@/schemas/account';
import { createUserAddress } from '@/actions/user';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddressModal({ isOpen, onClose, onSuccess }: AddressModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
    mode: 'onTouched',
  });

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<AddressFormValues> = async (values) => {
    setServerError(null);

    const result = await createUserAddress(values);

    if (result.success) {
      reset();
      onSuccess();
      onClose();
    } else {
      setServerError(result.error || 'Failed to save address.');
    }
  };

  const handleModalClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-5 font-satoshi text-black dark:text-white transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-black dark:text-white" />
            <h3 className="font-integral font-bold text-lg uppercase tracking-tight text-black dark:text-white">
              Add New Address
            </h3>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {serverError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-[12px] text-xs font-medium text-rose-600 dark:text-rose-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Label */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-black dark:text-white">Address Label</label>
            <input
              type="text"
              placeholder="e.g. Home, Office, Studio"
              className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              {...register('label')}
            />
            {errors.label && <p className="text-[11px] text-rose-500 px-3">{errors.label.message}</p>}
          </div>

          {/* Street */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-black dark:text-white">Street Address</label>
            <input
              type="text"
              placeholder="123 Fashion Ave, Suite 400"
              className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              {...register('street')}
            />
            {errors.street && <p className="text-[11px] text-rose-500 px-3">{errors.street.message}</p>}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black dark:text-white">City</label>
              <input
                type="text"
                placeholder="New York"
                className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                {...register('city')}
              />
              {errors.city && <p className="text-[11px] text-rose-500 px-3">{errors.city.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black dark:text-white">State / Province</label>
              <input
                type="text"
                placeholder="NY"
                className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                {...register('state')}
              />
              {errors.state && <p className="text-[11px] text-rose-500 px-3">{errors.state.message}</p>}
            </div>
          </div>

          {/* Postal Code & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black dark:text-white">Postal Code</label>
              <input
                type="text"
                placeholder="10001"
                className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                {...register('postalCode')}
              />
              {errors.postalCode && (
                <p className="text-[11px] text-rose-500 px-3">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black dark:text-white">Country</label>
              <input
                type="text"
                placeholder="United States"
                className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                {...register('country')}
              />
              {errors.country && <p className="text-[11px] text-rose-500 px-3">{errors.country.message}</p>}
            </div>
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultCheckbox"
              className="h-4 w-4 rounded border-black/20 dark:border-zinc-700 accent-black dark:accent-white cursor-pointer"
              {...register('isDefault')}
            />
            <label
              htmlFor="isDefaultCheckbox"
              className="text-xs font-medium text-black dark:text-white cursor-pointer select-none"
            >
              Set as default shipping address
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="h-[48px] px-6 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-bold text-black dark:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[48px] px-8 rounded-[62px] bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-black/80 dark:hover:bg-white/80 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Address</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}