'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { RatingStars } from '@/components/shared/rating-stars';
import { WriteReviewModal, UIReview } from '@/components/product/write-review-modal';

interface ProductReviewsProps {
  productId: string;
  totalReviews?: number;
  reviews?: UIReview[];
  onAddReview?: (review: UIReview) => void;
}

export function ProductReviews({
  productId,
  totalReviews = 0,
  reviews = [],
  onAddReview,
}: ProductReviewsProps) {
  const [sortOption, setSortOption] = useState<'latest' | 'highest' | 'lowest'>('latest');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const safeReviews = useMemo(() => {
    return Array.isArray(reviews) ? reviews : [];
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...safeReviews];

    if (starFilter !== 'all') {
      result = result.filter((r) => Math.floor(r.rating) === starFilter);
    }

    if (sortOption === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    } else {
      result.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }

    return result;
  }, [safeReviews, starFilter, sortOption]);

  const displayedReviews = filteredAndSortedReviews.slice(0, visibleCount);
  const reviewCount = safeReviews.length || totalReviews;

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 font-satoshi text-black dark:text-white">
      {/* Reviews Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-satoshi font-bold text-[20px] sm:text-[24px] text-black dark:text-white leading-none">
            All Reviews
          </h2>
          <span className="font-satoshi font-normal text-[14px] sm:text-[16px] text-black/60 dark:text-zinc-400">
            ({reviewCount})
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* Vertical Filter Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer ${
                starFilter !== 'all' || isFilterOpen
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-[#F0F0F0] dark:bg-zinc-900 text-black dark:text-white hover:bg-black/10'
              }`}
              aria-label="Filter reviews"
            >
              <SlidersHorizontal size={18} className="rotate-90" />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[180px] bg-white dark:bg-zinc-900 rounded-[16px] shadow-2xl border border-black/10 dark:border-zinc-800 p-2 z-30 flex flex-col gap-1 animate-in fade-in">
                <span className="font-satoshi font-bold text-[11px] text-black/40 dark:text-zinc-500 uppercase px-3 py-1">
                  Filter by Stars
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter('all');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium cursor-pointer ${
                    starFilter === 'all'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-black dark:text-white hover:bg-[#F0F0F0] dark:hover:bg-zinc-800'
                  }`}
                >
                  All Stars
                </button>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => {
                      setStarFilter(stars);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium cursor-pointer ${
                      starFilter === stars
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-black dark:text-white hover:bg-[#F0F0F0] dark:hover:bg-zinc-800'
                    }`}
                  >
                    {stars} Stars Only
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className="h-10 sm:h-12 px-4 sm:px-5 bg-[#F0F0F0] dark:bg-zinc-900 rounded-[62px] flex items-center gap-2 text-black dark:text-white font-satoshi font-medium text-xs sm:text-sm hover:bg-black/10 dark:hover:bg-zinc-800 transition-colors focus:outline-none cursor-pointer"
            >
              <span className="capitalize">{sortOption}</span>
              <ChevronDown size={16} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-[160px] bg-white dark:bg-zinc-900 rounded-[16px] shadow-2xl border border-black/10 dark:border-zinc-800 p-2 z-30 flex flex-col gap-1 animate-in fade-in">
                {(['latest', 'highest', 'lowest'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSortOption(opt);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-xs font-medium capitalize cursor-pointer ${
                      sortOption === opt
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-black dark:text-white hover:bg-[#F0F0F0] dark:hover:bg-zinc-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 sm:h-12 px-4 sm:px-6 bg-black dark:bg-white text-white dark:text-black rounded-[62px] font-satoshi font-bold text-xs sm:text-sm hover:bg-black/80 dark:hover:bg-white/80 transition-colors active:scale-95 focus:outline-none cursor-pointer"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      {displayedReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 sm:p-8 rounded-[20px] border border-black/10 dark:border-zinc-800 flex flex-col justify-between gap-4 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <RatingStars rating={review.rating} size={18} showScore={false} />
                <button
                  type="button"
                  className="text-black/40 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-1 cursor-pointer"
                  aria-label="Review options"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-satoshi font-bold text-[16px] sm:text-[18px] text-black dark:text-white">
                    {review.author}
                  </span>
                  {review.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white" />
                  )}
                </div>

                <p className="font-satoshi text-xs sm:text-sm leading-relaxed text-black/60 dark:text-zinc-300">
                  {review.content}
                </p>
              </div>

              {review.date && (
                <span className="font-satoshi text-xs text-black/40 dark:text-zinc-500">
                  Posted on {review.date}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-12 text-center text-black/60 dark:text-zinc-400 text-sm">
          No reviews match the selected filter.
        </div>
      )}

      {/* Load More Reviews CTA */}
      {visibleCount < filteredAndSortedReviews.length && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 4)}
            className="h-[48px] px-8 rounded-[62px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white font-satoshi font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
          >
            Load More Reviews
          </button>
        </div>
      )}

      {/* Interactive Review Modal */}
      <WriteReviewModal
        productId={productId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newReview) => {
          onAddReview?.(newReview);
        }}
      />
    </div>
  );
}