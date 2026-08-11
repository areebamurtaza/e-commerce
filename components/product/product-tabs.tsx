'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/types/product';
import { ProductReviews } from '@/components/product/product-reviews';

interface ProductTabsProps {
  totalReviews?: number;
  reviews?: Review[];
  detailsText?: string;
}

type TabType = 'details' | 'reviews' | 'faqs';

export function ProductTabs({
  totalReviews = 0,
  reviews = [],
  detailsText = '',
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [reviewsList, setReviewsList] = useState<Review[]>(() =>
    Array.isArray(reviews) ? reviews : []
  );

  // Keep state in sync when switching between different products
  useEffect(() => {
    setReviewsList(Array.isArray(reviews) ? reviews : []);
  }, [reviews]);

  const handleAddReview = (newReview: Review) => {
    setReviewsList((prev) => [newReview, ...prev]);
  };

  return (
    <div className="w-full mt-10 sm:mt-16">
      {/* Header Line Tabs */}
      <div className="flex items-center justify-between border-b border-black/10 w-full">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex-1 pb-4 sm:pb-6 text-center font-satoshi text-[16px] sm:text-[20px] transition-colors relative focus:outline-none cursor-pointer ${
            activeTab === 'details'
              ? 'font-medium text-black'
              : 'font-normal text-black/60 hover:text-black'
          }`}
        >
          Product Details
          {activeTab === 'details' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 pb-4 sm:pb-6 text-center font-satoshi text-[16px] sm:text-[20px] transition-colors relative focus:outline-none cursor-pointer ${
            activeTab === 'reviews'
              ? 'font-medium text-black'
              : 'font-normal text-black/60 hover:text-black'
          }`}
        >
          Rating & Reviews
          {activeTab === 'reviews' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 pb-4 sm:pb-6 text-center font-satoshi text-[16px] sm:text-[20px] transition-colors relative focus:outline-none cursor-pointer ${
            activeTab === 'faqs'
              ? 'font-medium text-black'
              : 'font-normal text-black/60 hover:text-black'
          }`}
        >
          FAQs
          {activeTab === 'faqs' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-6 sm:pt-8">
        {activeTab === 'details' && (
          <div className="max-w-[800px] text-black/70 font-satoshi text-[15px] sm:text-[16px] leading-[24px] sm:leading-[28px] space-y-4">
            <h3 className="font-satoshi font-bold text-[18px] sm:text-[20px] text-black">
              Product Overview
            </h3>
            <p>{detailsText}</p>
            <ul className="list-disc pl-5 space-y-2 text-black/70">
              <li>100% Premium Breathable Cotton</li>
              <li>Pre-shrunk fabric to preserve fit post-wash</li>
              <li>Double-needle stitching on hem and sleeves</li>
              <li>Machine wash cold with like colors</li>
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews
            totalReviews={totalReviews}
            reviews={reviewsList}
            onAddReview={handleAddReview}
          />
        )}

        {activeTab === 'faqs' && (
          <div className="max-w-[800px] space-y-6 font-satoshi text-[15px] sm:text-[16px]">
            <div className="p-5 rounded-[16px] bg-[#F0F0F0]/60 space-y-2">
              <h4 className="font-bold text-black">What is the return policy?</h4>
              <p className="text-black/70">
                We offer a 30-day hassle-free return policy. Items must be unworn with original tags attached.
              </p>
            </div>
            <div className="p-5 rounded-[16px] bg-[#F0F0F0]/60 space-y-2">
              <h4 className="font-bold text-black">How do I choose my size?</h4>
              <p className="text-black/70">
                Our t-shirts fit true to size. If you prefer a loose oversized fit, we recommend ordering one size up.
              </p>
            </div>
            <div className="p-5 rounded-[16px] bg-[#F0F0F0]/60 space-y-2">
              <h4 className="font-bold text-black">What are the delivery timelines?</h4>
              <p className="text-black/70">
                Standard shipping takes 3-5 business days. Express options are available at checkout.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}