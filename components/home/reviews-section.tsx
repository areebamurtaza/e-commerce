'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { REVIEWS } from '@/lib/mock-data';
import { RatingStars } from '@/components/shared/rating-stars';
import { ScrollReveal } from '@/components/shared/scroll-reveal';

export function ReviewsSection() {
  // Mobile index shifts 1 card at a time across all reviews (0 to REVIEWS.length - 1)
  const [mobileIndex, setMobileIndex] = useState<number>(1);

  // Desktop index shifts 1 card at a time in the 3-spotlight track
  const [desktopIndex, setDesktopIndex] = useState<number>(1);

  const handlePrev = () => {
    setMobileIndex((prev) => (prev > 0 ? prev - 1 : REVIEWS.length - 1));
    setDesktopIndex((prev) => (prev > 1 ? prev - 1 : REVIEWS.length - 3));
  };

  const handleNext = () => {
    setMobileIndex((prev) => (prev < REVIEWS.length - 1 ? prev + 1 : 0));
    setDesktopIndex((prev) => (prev < REVIEWS.length - 3 ? prev + 1 : 1));
  };

  return (
    <section className="w-full bg-white pb-12 sm:pb-20 xl:pb-24 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] relative">
        <ScrollReveal direction="up" delay={50} distance={20}>
          {/* Header Section: Title & Controls */}
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <h2 className="font-integral font-bold text-[32px] sm:text-[40px] xl:text-[48px] leading-[36px] sm:leading-[48px] xl:leading-[58px] text-black uppercase tracking-tight">
              OUR HAPPY CUSTOMERS
            </h2>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 sm:p-2 text-black hover:opacity-60 transition-opacity active:scale-95 focus:outline-none"
              aria-label="Previous Reviews"
            >
              <ArrowLeft className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 sm:p-2 text-black hover:opacity-60 transition-opacity active:scale-95 focus:outline-none"
              aria-label="Next Reviews"
            >
              <ArrowRight className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px]" />
            </button>
          </div>
        </div>

        {/* 
          1. Mobile View (< sm) - Exact Match for image_267e5b.png:
          Renders 1 single review card at 100% container width.
        */}
        <div className="block sm:hidden w-full overflow-hidden">
          <div
            className="flex items-center transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${mobileIndex * 100}%)`,
            }}
          >
            {REVIEWS.map((review) => (
              <div
                key={`mobile-${review.id}`}
                className="w-full min-w-full max-w-full h-auto min-h-[200px] border border-black/10 rounded-[20px] p-6 flex flex-col justify-between bg-white shrink-0 box-border"
              >
                <div className="flex flex-col gap-3">
                  <RatingStars rating={review.rating} showScore={false} />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-satoshi font-bold text-[18px] leading-[22px] text-black">
                        {review.author}
                      </span>
                      {review.isVerified && (
                        <div
                          className="w-[19px] h-[19px] rounded-full bg-[#01AB31] flex items-center justify-center shrink-0"
                          aria-label="Verified Customer"
                        >
                          <Check size={12} className="text-white stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="font-satoshi font-normal text-[14px] leading-[20px] text-black/60">
                      {review.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          2. Desktop / Tablet View (>= sm):
          Renders 3 spotlight cards with overflow edge blur cards.
        */}
        <div className="hidden sm:block relative w-full overflow-visible">
          <div
            className="flex items-center gap-[12px] sm:gap-[16px] xl:gap-[20px] transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(calc(-1 * ${desktopIndex} * ((100% + 20px) / 3)))`,
            }}
          >
            {REVIEWS.map((review, index) => {
              const isInSpotlight =
                index >= desktopIndex && index < desktopIndex + 3;

              return (
                <div
                  key={`desktop-${review.id}`}
                  style={{
                    width: 'calc((100% - 40px) / 3)',
                    minWidth: 'calc((100% - 40px) / 3)',
                    maxWidth: 'calc((100% - 40px) / 3)',
                  }}
                  className={`h-[240px] shrink-0 border border-black/10 rounded-[20px] px-[24px] xl:px-[32px] py-[28px] flex flex-col justify-between bg-white transition-all duration-500 ease-in-out ${
                    isInSpotlight
                      ? 'blur-none opacity-100 scale-100 z-10 shadow-xs'
                      : 'blur-[2px] opacity-40 scale-[0.98] pointer-events-none z-0'
                  }`}
                >
                  <div className="flex flex-col gap-[15px]">
                    <RatingStars rating={review.rating} showScore={false} />

                    <div className="flex flex-col gap-[12px]">
                      <div className="flex items-center gap-[4px]">
                        <span className="font-satoshi font-bold text-[18px] sm:text-[20px] leading-[22px] text-black">
                          {review.author}
                        </span>
                        {review.isVerified && (
                          <div
                            className="w-[24px] h-[24px] rounded-full bg-[#01AB31] flex items-center justify-center shrink-0"
                            aria-label="Verified Customer"
                          >
                            <Check size={14} className="text-white stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="font-satoshi font-normal text-[14px] sm:text-[16px] leading-[22px] text-black/60 line-clamp-3">
                        {review.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </ScrollReveal>

      </div>
    </section>
  );
}