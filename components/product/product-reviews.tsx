// components/product/product-reviews.tsx
'use client';

import { useState, useMemo } from 'react';
import { ReviewWithUserData, ReviewAggregateStats } from '@/actions/review';
import { WriteReviewModal } from '@/components/product/write-review-modal';
import { RatingStars } from '@/components/shared/rating-stars';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Star,
  MessageSquareOff,
} from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  initialReviews: ReviewWithUserData[];
  initialStats: ReviewAggregateStats;
}

type SortOption = 'latest' | 'highest' | 'lowest';

export function ProductReviews({
  productId,
  initialReviews,
  initialStats,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithUserData[]>(initialReviews);
  const [stats, setStats] = useState<ReviewAggregateStats>(initialStats);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Optimistic handler invoked immediately when a review is submitted
  const handleReviewCreated = (newReview: ReviewWithUserData) => {
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate breakdown statistics in local state
    setStats((prev) => {
      const updatedTotal = prev.totalReviews + 1;
      const updatedSum =
        prev.averageRating * prev.totalReviews + newReview.rating;
      const updatedAverage =
        Math.round((updatedSum / updatedTotal) * 10) / 10;

      const updatedBreakdown = prev.breakdown.map((item) => {
        const isTargetStar = item.stars === newReview.rating;
        const newCount = isTargetStar ? item.count + 1 : item.count;
        return {
          ...item,
          count: newCount,
          percentage: Math.round((newCount / updatedTotal) * 100),
        };
      });

      return {
        averageRating: updatedAverage,
        totalReviews: updatedTotal,
        breakdown: updatedBreakdown,
      };
    });
  };

  // Client-side filtering and sorting
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    if (filterRating !== null) {
      result = result.filter((r) => r.rating === filterRating);
    }

    result.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [reviews, filterRating, sortBy]);

  return (
    <section
      aria-label="Customer Reviews Section"
      className="w-full space-y-8 font-satoshi text-black dark:text-white"
    >
      {/* 1. Rating Summary and Breakdown Distribution */}
      <div className="grid gap-6 rounded-[20px] border border-black/10 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60 lg:grid-cols-12">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center justify-center border-b border-black/10 pb-6 dark:border-zinc-800 lg:col-span-4 lg:border-b-0 lg:border-r lg:pr-8">
          <span className="font-integral text-5xl sm:text-6xl font-extrabold tracking-tight">
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="mt-2.5 flex items-center gap-1.5">
            <RatingStars rating={stats.averageRating} />
          </div>
          <p className="mt-2 text-xs font-medium text-black/60 dark:text-zinc-400">
            Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Right: Star Breakdown Progress Bars */}
        <div className="flex flex-col justify-center space-y-2.5 lg:col-span-8 lg:pl-4">
          {stats.breakdown.map((tier) => (
            <button
              key={tier.stars}
              type="button"
              onClick={() =>
                setFilterRating(filterRating === tier.stars ? null : tier.stars)
              }
              className={`group flex items-center gap-3 text-xs transition-opacity cursor-pointer ${
                filterRating !== null && filterRating !== tier.stars
                  ? 'opacity-40 hover:opacity-80'
                  : 'opacity-100'
              }`}
            >
              <span className="flex w-12 items-center gap-1 font-bold">
                {tier.stars} <Star className="h-3.5 w-3.5 fill-[#FFC633] text-[#FFC633]" />
              </span>

              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0F0F0] dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#FFC633] transition-all duration-500"
                  style={{ width: `${tier.percentage}%` }}
                />
              </div>

              <span className="w-10 text-right font-mono text-[11px] text-black/50 dark:text-zinc-400">
                {tier.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Control Bar (Filters, Sorter & Write Review Button) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-integral text-xl font-bold uppercase tracking-tight">
            All Reviews
          </h3>
          <span className="text-sm font-normal text-black/50 dark:text-zinc-400">
            ({processedReviews.length})
          </span>
          {filterRating !== null && (
            <button
              type="button"
              onClick={() => setFilterRating(null)}
              className="ml-2 rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold text-black/70 hover:bg-black/10 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Filter: {filterRating}★ ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 rounded-[62px] border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
            <SlidersHorizontal className="h-3.5 w-3.5 text-black/50 dark:text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="latest" className="dark:bg-zinc-900">Latest</option>
              <option value="highest" className="dark:bg-zinc-900">Highest Rating</option>
              <option value="lowest" className="dark:bg-zinc-900">Lowest Rating</option>
            </select>
          </div>

          {/* Write Review Modal Trigger */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 gap-1.5 rounded-[62px] bg-black px-5 text-xs font-bold text-white shadow-xs hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Write a Review
          </Button>
        </div>
      </div>

      {/* 3. Review Cards Grid */}
      {processedReviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {processedReviews.map((review) => {
            const formattedDate = new Date(review.createdAt).toLocaleDateString(
              'en-US',
              {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }
            );

            return (
              <article
                key={review.id}
                className="flex flex-col justify-between rounded-[20px] border border-black/10 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <RatingStars rating={review.rating} />
                    <time
                      dateTime={new Date(review.createdAt).toISOString()}
                      className="text-[11px] text-black/40 dark:text-zinc-500 font-medium"
                    >
                      {formattedDate}
                    </time>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-black dark:text-white">
                      {review.author}
                    </h4>
                    {review.isVerified && (
                      <span
                        title="Verified Buyer"
                        className="inline-flex items-center text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4 fill-emerald-600 text-white dark:fill-emerald-400 dark:text-black" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-black/60 dark:text-zinc-300">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-black/10 py-16 text-center dark:border-zinc-800">
          <MessageSquareOff className="h-10 w-10 text-black/30 dark:text-zinc-600" />
          <h4 className="mt-3 font-integral text-base font-bold uppercase">
            No Reviews Found
          </h4>
          <p className="mt-1 max-w-sm text-xs text-black/50 dark:text-zinc-400">
            {filterRating !== null
              ? `There are no ${filterRating}-star reviews for this product.`
              : 'Be the first to review this item and help others in their shopping journey.'}
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="mt-4 h-9 rounded-[62px] border-black/10 text-xs font-semibold dark:border-zinc-800 cursor-pointer"
          >
            Write the First Review
          </Button>
        </div>
      )}

      {/* Modal Integration */}
      <WriteReviewModal
        productId={productId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReviewCreated}
      />
    </section>
  );
}