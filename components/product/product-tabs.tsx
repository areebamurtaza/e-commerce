'use client';

import { useState } from 'react';
import { ProductReviews } from '@/components/product/product-reviews';
import { ReviewWithUserData, ReviewAggregateStats } from '@/actions/review';
import { ChevronDown } from 'lucide-react';

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

const PRODUCT_FAQS = [
  {
    q: 'What is the return & exchange policy?',
    a: 'We offer a 30-day hassle-free return and exchange policy. Items must be unworn, in original condition, and with all tags attached.',
  },
  {
    q: 'How do I choose the correct size?',
    a: 'Our garments fit true to standard US/EU sizing. If you prefer a relaxed or streetwear oversized fit, we suggest selecting one size up.',
  },
  {
    q: 'What are the care and washing instructions?',
    a: 'Machine wash cold with like colors inside out. Tumble dry low or hang dry to preserve garment shape and longevity.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Orders are processed within 24-48 hours. Standard domestic delivery takes 3-5 business days with live shipment tracking.',
  },
];

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white rounded-full transition-all duration-300 animate-in fade-in zoom-in-95" />
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
            className="max-w-[800px] text-black/70 dark:text-zinc-300 font-satoshi text-sm sm:text-base leading-relaxed space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
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
            className="w-full animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <ProductReviews
              productId={productId}
              initialReviews={resolvedReviews}
              initialStats={computedStats}
            />
          </div>
        )}

        {/* FAQs Accordion Panel */}
        {activeTab === 'faqs' && (
          <div
            role="tabpanel"
            id="panel-faqs"
            aria-labelledby="tab-faqs"
            className="max-w-[800px] space-y-3 font-satoshi text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200"
          >
            {PRODUCT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[18px] bg-[#F0F0F0]/60 dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 overflow-hidden transition-all duration-200 hover:border-black/20 dark:hover:border-zinc-700"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-black dark:text-white focus:outline-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-black/60 dark:text-zinc-400 transition-transform duration-300 ease-out ${
                        isOpen ? 'rotate-180 text-black dark:text-white' : 'rotate-0'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-black/70 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed border-t border-black/5 dark:border-zinc-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}