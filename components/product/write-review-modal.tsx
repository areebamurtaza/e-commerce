'use client';

import { useState, useTransition } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { createProductReview } from '@/actions/review';
import { useUser } from '@clerk/nextjs';

export interface UIReview {
  id: string;
  author: string;
  rating: number;
  content: string;
  isVerified: boolean;
  date: string;
}

interface WriteReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReview: UIReview) => void;
}

export function WriteReviewModal({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const [author, setAuthor] = useState(user?.fullName || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      setErrorMessage('');
      const response = await createProductReview({
        productId,
        userId: user?.id,
        author: author.trim(),
        rating,
        comment: content.trim(),
      });

      if (!response.success) {
        setErrorMessage(response.error || 'Failed to submit review.');
        return;
      }

      onSuccess({
        id: `rev-${Date.now()}`,
        author: author.trim(),
        rating,
        content: `"${content.trim()}"`,
        isVerified: true,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      });

      setContent('');
      setRating(5);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-satoshi text-black dark:text-white">
      <div className="relative w-full max-w-[540px] bg-white dark:bg-zinc-900 rounded-[20px] p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-zinc-800 mb-6">
          <h3 className="font-integral font-bold text-[20px] sm:text-[24px] text-black dark:text-white uppercase tracking-tight">
            Write a Review
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-[12px] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Rating Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-satoshi font-medium text-xs text-black/60 dark:text-zinc-400">
              Your Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={24}
                    className={`transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-black/20 dark:text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="review-author" className="font-satoshi font-medium text-xs text-black/60 dark:text-zinc-400">
              Your Name *
            </label>
            <input
              id="review-author"
              type="text"
              required
              placeholder="e.g. Samantha D."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full h-[44px] bg-[#F0F0F0] dark:bg-black rounded-[12px] px-4 font-satoshi text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Review Content */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="review-content" className="font-satoshi font-medium text-xs text-black/60 dark:text-zinc-400">
              Your Feedback *
            </label>
            <textarea
              id="review-content"
              required
              rows={4}
              placeholder="Share details about the fabric, sizing, and styling..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#F0F0F0] dark:bg-black rounded-[12px] p-4 font-satoshi text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] px-6 rounded-[62px] border border-black/10 dark:border-zinc-800 font-satoshi font-medium text-xs text-black dark:text-white hover:bg-[#F0F0F0] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-[42px] px-8 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-bold text-xs hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              <span>{isPending ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}