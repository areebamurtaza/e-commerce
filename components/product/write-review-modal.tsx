// components/product/write-review-modal.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/nextjs';
import { createProductReview, ReviewWithUserData } from '@/actions/review';
import { createReviewSchema, CreateReviewInput } from '@/schemas/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Star, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export type UIReview = ReviewWithUserData;

export interface WriteReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReview: ReviewWithUserData) => void;
}

export function WriteReviewModal({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const { user, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const defaultAuthorName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || ''
    : '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      productId,
      userId: user?.id || null,
      author: defaultAuthorName,
      rating: 5,
      comment: '',
    },
  });

  const selectedRating = watch('rating');
  const watchedComment = watch('comment') || '';

  useEffect(() => {
    if (isLoaded && user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '';
      setValue('author', name);
      setValue('userId', user.id);
    }
  }, [isLoaded, user, setValue]);

  if (!isOpen) return null;

  const handleRatingSelect = (starValue: number) => {
    setValue('rating', starValue, { shouldValidate: true });
  };

  const onSubmit = (values: CreateReviewInput) => {
    setServerError(null);

    startTransition(async () => {
      const result = await createProductReview({
        ...values,
        productId,
        userId: user?.id || null,
      });

      if (!result.success || !result.data) {
        setServerError(result.error || 'Failed to submit your review.');
        return;
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(result.data);
      }

      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onClose();
      }, 1000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-satoshi text-black dark:text-white animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[540px] rounded-[24px] bg-white p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-zinc-800">
          <div>
            <h2
              id="write-review-title"
              className="font-integral text-xl sm:text-2xl font-bold uppercase tracking-tight text-black dark:text-white"
            >
              Write A Review
            </h2>
            <p className="mt-0.5 text-xs text-black/60 dark:text-zinc-400">
              Share your thoughts and sizing experience with our community.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review modal"
            className="rounded-full p-2 text-black/50 transition-colors hover:bg-black/5 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white focus:outline-none cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Thank you! Your review has been published.</span>
          </div>
        )}

        {/* Server Error Banner */}
        {serverError && (
          <div className="mt-4 flex items-center gap-2 rounded-[16px] border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black dark:text-white">
              Overall Rating <span className="text-rose-500">*</span>
            </label>
            <div
              className="flex items-center gap-1.5 pt-0.5"
              role="radiogroup"
              aria-label="Product rating selection"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={selectedRating === star}
                    aria-label={`${star} Star${star > 1 ? 's' : ''}`}
                    onClick={() => handleRatingSelect(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        isActive
                          ? 'fill-[#FFC633] text-[#FFC633]'
                          : 'text-black/20 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-black/70 dark:text-zinc-300">
                {hoverRating || selectedRating} / 5
              </span>
            </div>
            {errors.rating && (
              <p className="text-[11px] font-medium text-rose-500">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-author-input" className="text-xs font-bold text-black dark:text-white">
              Your Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="review-author-input"
              placeholder="e.g. Samantha D."
              disabled={isPending || (isLoaded && Boolean(user?.fullName))}
              className="h-10 rounded-[12px] bg-[#F0F0F0] dark:bg-black border-none text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
              {...register('author')}
            />
            {errors.author && (
              <p className="text-[11px] font-medium text-rose-500">{errors.author.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="review-comment-input" className="text-xs font-bold text-black dark:text-white">
                Detailed Feedback <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-black/40 dark:text-zinc-500 font-mono">
                {watchedComment.length} / 1000
              </span>
            </div>
            <textarea
              id="review-comment-input"
              rows={4}
              disabled={isPending}
              placeholder="How did the garment fit? What was your impression of the fabric weight, stitching, and color accuracy?"
              className="w-full rounded-[14px] bg-[#F0F0F0] dark:bg-black border-none p-3.5 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-[11px] font-medium text-rose-500">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-6 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-semibold hover:bg-black/5 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSuccess}
              className="h-10 px-8 rounded-[62px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Post Review'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}