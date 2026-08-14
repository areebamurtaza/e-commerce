'use client';

import { useState, useEffect } from 'react';
import { ProductReviews } from '@/components/product/product-reviews';
import { UIReview } from '@/components/product/write-review-modal';

interface ProductTabsProps {
  productId: string;
  totalReviews?: number;
  reviews?: UIReview[];
  detailsText?: string;
}

type TabType = 'details' | 'reviews' | 'faqs';

export function ProductTabs({
  productId,
  totalReviews = 0,
  reviews = [],
  detailsText = '',
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [reviewsList, setReviewsList] = useState<UIReview[]>(() =>
    Array.isArray(reviews) ? reviews : []
  );

  useEffect(() => {
    setReviewsList(Array.isArray(reviews) ? reviews : []);
  }, [reviews]);

  const handleAddReview = (newReview: UIReview) => {
    setReviewsList((prev) => [newReview, ...prev]);
  };

  return (
    <div className="w-full mt-10 sm:mt-16 font-satoshi text-black dark:text-white">
      {/* Header Line Tabs */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 w-full">
        {(
          [
            { id: 'details', label: 'Product Details' },
            { id: 'reviews', label: 'Rating & Reviews' },
            { id: 'faqs', label: 'FAQs' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
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
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-6 sm:pt-8">
        {activeTab === 'details' && (
          <div className="max-w-[800px] text-black/70 dark:text-zinc-300 font-satoshi text-sm sm:text-base leading-relaxed space-y-4">
            <h3 className="font-bold text-base sm:text-lg text-black dark:text-white">
              Product Overview
            </h3>
            <p>{detailsText}</p>
            <ul className="list-disc pl-5 space-y-2 text-black/70 dark:text-zinc-400 text-xs sm:text-sm">
              <li>100% Premium Breathable Heavyweight Cotton</li>
              <li>Pre-shrunk fabric to preserve fit post-wash</li>
              <li>Double-needle reinforced stitching on hem and cuffs</li>
              <li>Machine wash cold with like colors</li>
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews
            productId={productId}
            totalReviews={totalReviews}
            reviews={reviewsList}
            onAddReview={handleAddReview}
          />
        )}

        {activeTab === 'faqs' && (
          <div className="max-w-[800px] space-y-4 font-satoshi text-xs sm:text-sm">
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