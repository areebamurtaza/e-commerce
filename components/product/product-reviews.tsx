'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Review } from '@/types/product';
import { RatingStars } from '@/components/shared/rating-stars';
import { WriteReviewModal } from '@/components/product/write-review-modal';

interface ProductReviewsProps {
  totalReviews?: number;
  reviews?: Review[];
  onAddReview?: (review: Review) => void;
}

export function ProductReviews({
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

  // Fallback array guard to prevent runtime errors
  const safeReviews = useMemo(() => {
    return Array.isArray(reviews) ? reviews : [];
  }, [reviews]);

  // Filter & Sort Computation
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
    <div className="w-full flex flex-col gap-6 sm:gap-8">
      {/* Reviews Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-satoshi font-bold text-[20px] sm:text-[24px] text-black leading-none">
            All Reviews
          </h2>
          <span className="font-satoshi font-normal text-[14px] sm:text-[16px] text-black/60">
            ({reviewCount})
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* Vertical Sliders Filter Button & Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer ${
                starFilter !== 'all' || isFilterOpen
                  ? 'bg-black text-white'
                  : 'bg-[#F0F0F0] text-black hover:bg-black/10'
              }`}
              aria-label="Filter reviews"
              aria-expanded={isFilterOpen}
            >
              {/* rotate-90 turns standard horizontal slider icon into exact vertical sliders */}
              <SlidersHorizontal size={20} className="rotate-90 transition-transform duration-200" />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[180px] bg-white rounded-[16px] shadow-2xl border border-black/10 p-3 z-30 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                <span className="font-satoshi font-bold text-[12px] text-black/40 uppercase px-3 py-1">
                  Filter by Stars
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter('all');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                    starFilter === 'all'
                      ? 'bg-black text-white font-medium'
                      : 'text-black hover:bg-[#F0F0F0]'
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
                    className={`w-full text-left px-3 py-1.5 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                      starFilter === stars
                        ? 'bg-black text-white font-medium'
                        : 'text-black hover:bg-[#F0F0F0]'
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
              className="h-10 sm:h-12 px-4 sm:px-5 bg-[#F0F0F0] rounded-[62px] flex items-center gap-2 text-black font-satoshi font-medium text-[14px] sm:text-[16px] hover:bg-black/10 transition-colors focus:outline-none cursor-pointer"
              aria-expanded={isSortOpen}
            >
              <span className="capitalize">{sortOption}</span>
              <ChevronDown size={16} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-[160px] bg-white rounded-[16px] shadow-2xl border border-black/10 p-2 z-30 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => {
                    setSortOption('latest');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                    sortOption === 'latest'
                      ? 'bg-black text-white font-medium'
                      : 'text-black hover:bg-[#F0F0F0]'
                  }`}
                >
                  Latest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOption('highest');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                    sortOption === 'highest'
                      ? 'bg-black text-white font-medium'
                      : 'text-black hover:bg-[#F0F0F0]'
                  }`}
                >
                  Highest Rating
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOption('lowest');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                    sortOption === 'lowest'
                      ? 'bg-black text-white font-medium'
                      : 'text-black hover:bg-[#F0F0F0]'
                  }`}
                >
                  Lowest Rating
                </button>
              </div>
            )}
          </div>

          {/* Write a Review Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 sm:h-12 px-4 sm:px-6 bg-black text-white rounded-[62px] font-satoshi font-medium text-[14px] sm:text-[16px] hover:bg-black/80 transition-colors active:scale-95 focus:outline-none cursor-pointer"
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
              className="p-6 sm:p-8 rounded-[20px] border border-black/10 flex flex-col justify-between gap-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <RatingStars rating={review.rating} size={20} showScore={false} />
                <button
                  type="button"
                  className="text-black/40 hover:text-black transition-colors p-1 cursor-pointer"
                  aria-label="Review options"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-satoshi font-bold text-[18px] sm:text-[20px] text-black">
                    {review.author}
                  </span>
                  {review.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-[#01AB31] fill-[#01AB31] text-white stroke-[2.5]" />
                  )}
                </div>

                <p className="font-satoshi font-normal text-[14px] sm:text-[16px] leading-[20px] sm:leading-[22px] text-black/60">
                  {review.content}
                </p>
              </div>

              {review.date && (
                <span className="font-satoshi font-medium text-[14px] sm:text-[16px] text-black/60">
                  Posted on {review.date}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-12 text-center text-black/60 font-satoshi text-[16px]">
          No reviews match the selected filter.
        </div>
      )}

      {/* Load More Reviews CTA */}
      {visibleCount < filteredAndSortedReviews.length && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 4)}
            className="h-[52px] px-10 rounded-[62px] border border-black/10 bg-white text-black font-satoshi font-medium text-[16px] hover:bg-black hover:text-white transition-all duration-200 focus:outline-none active:scale-95 cursor-pointer"
          >
            Load More Reviews
          </button>
        </div>
      )}

      {/* Interactive Review Modal */}
      {onAddReview && (
        <WriteReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitReview={onAddReview}
        />
      )}
    </div>
  );
}