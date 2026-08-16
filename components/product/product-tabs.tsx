// components/product/product-tabs.tsx
'use client';

import { useState } from 'react';
import { ProductReviews } from '@/components/product/product-reviews';
import { ReviewWithUserData, ReviewAggregateStats } from '@/actions/review';

export type { ReviewWithUserData as UIReview };

export interface ProductTabsProps {
  productId: string;
  totalReviews?: number;
  reviews?: ReviewWithUserData[];
  initialReviews?: ReviewWithUserData[];
  stats?: ReviewAggregateStats;
  initialStats?: ReviewAggregateStats;
  detailsText?: string;
}

type TabType = 'details' | 'reviews' | 'faqs';

export function ProductTabs({
  productId,
  totalReviews = 0,
  reviews = [],
  initialReviews,
  stats,
  initialStats,
  detailsText = 'Experience unmatched comfort and style with our precision-tailored garments.',
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

  const resolvedReviews: ReviewWithUserData[] = initialReviews ?? reviews;

  // Compute stats dynamically if not pre-rendered by server component
  const computedStats: ReviewAggregateStats = initialStats ?? stats ?? {
    averageRating:
      resolvedReviews.length > 0
        ? Math.round(
            (resolvedReviews.reduce((acc, r) => acc + r.rating, 0) / resolvedReviews.length) * 10
          ) / 10
        : 0,
    totalReviews: totalReviews || resolvedReviews.length,
    breakdown: [5, 4, 3, 2, 1].map((stars) => {
      const count = resolvedReviews.filter((r) => r.rating === stars).length;
      const percentage =
        resolvedReviews.length > 0 ? Math.round((count / resolvedReviews.length) * 100) : 0;
      return { stars, count, percentage };
    }),
  };

  return (
    <div className="w-full mt-10 sm:mt-16 font-satoshi text-black dark:text-white">
      {/* Tab Navigation Header */}
      <div
        role="tablist"
        aria-label="Product Information Tabs"
        className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 w-full"
      >
        {(
          [
            { id: 'details', label: 'Product Details' },
            { id: 'reviews', label: `Rating & Reviews (${computedStats.totalReviews})` },
            { id: 'faqs', label: 'FAQs' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-4 sm:pb-6 text-center font-satoshi text-[15px] sm:text-[18px] transition-colors relative focus:outline-none cursor-pointer ${
                isActive
                  ? 'font-bold text-black dark:text-white'
                  : 'font-medium text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white rounded-full transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-6 sm:pt-8">
        {/* Product Details Panel */}
        {activeTab === 'details' && (
          <div
            role="tabpanel"
            id="panel-details"
            aria-labelledby="tab-details"
            className="max-w-[800px] text-black/70 dark:text-zinc-300 font-satoshi text-sm sm:text-base leading-relaxed space-y-4 animate-in fade-in duration-200"
          >
            <h3 className="font-bold text-base sm:text-lg text-black dark:text-white">
              Product Overview
            </h3>
            <p>{detailsText}</p>
            <ul className="list-disc pl-5 space-y-2 text-black/70 dark:text-zinc-400 text-xs sm:text-sm">
              <li>100% Premium Breathable Heavyweight Cotton</li>
              <li>Pre-shrunk fabric to preserve structural fit post-wash</li>
              <li>Double-needle reinforced stitching on hem and cuffs</li>
              <li>Machine wash cold with like colors</li>
            </ul>
          </div>
        )}

        {/* Reviews Panel */}
        {activeTab === 'reviews' && (
          <div
            role="tabpanel"
            id="panel-reviews"
            aria-labelledby="tab-reviews"
            className="w-full animate-in fade-in duration-200"
          >
            <ProductReviews
              productId={productId}
              initialReviews={resolvedReviews}
              initialStats={computedStats}
            />
          </div>
        )}

        {/* FAQs Panel */}
        {activeTab === 'faqs' && (
          <div
            role="tabpanel"
            id="panel-faqs"
            aria-labelledby="tab-faqs"
            className="max-w-[800px] space-y-4 font-satoshi text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <div className="p-5 rounded-[16px] bg-[#F0F0F0]/60 dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 space-y-1.5">
              <h4 className="font-bold text-black dark:text-white">What is the return policy?</h4>
              <p className="text-black/70 dark:text-zinc-400">
                We offer a 30-day hassle-free return policy. Items must be unworn with original tags attached.
              </p>
            </div>
            <div className="p-5 rounded-[16px] bg-[#F0F0F0]/60 dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 space-y-1.5">
              <h4 className="font-bold text-black dark:text-white">How do I choose my size?</h4>
              <p className="text-black/70 dark:text-zinc-400">
                Our shirts and hoodies fit true to size. For an oversized fit, we recommend ordering one size up.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}