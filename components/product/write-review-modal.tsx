'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Review } from '@/types/product';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Review) => void;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  onSubmitReview,
}: WriteReviewModalProps) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const newReview: Review = {
      id: `review-${Date.now()}`,
      author: author.trim(),
      isVerified: true,
      rating,
      content: `"${content.trim()}"`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onSubmitReview(newReview);
    setAuthor('');
    setContent('');
    setRating(5);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[540px] bg-white rounded-[20px] p-6 sm:p-8 shadow-2xl border border-black/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6">
          <h3 className="font-integral font-bold text-[22px] sm:text-[26px] text-black uppercase">
            Write a Review
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-black/60 hover:text-black hover:bg-[#F0F0F0] rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-[#FF3333]/10 text-[#FF3333] rounded-[12px] font-satoshi text-[14px] font-medium">
              {error}
            </div>
          )}

          {/* Rating Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-satoshi font-medium text-[14px] sm:text-[16px] text-black">
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
                    size={28}
                    className={`transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-[#FFC633] text-[#FFC633]'
                        : 'text-black/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="review-author"
              className="font-satoshi font-medium text-[14px] sm:text-[16px] text-black"
            >
              Your Name *
            </label>
            <input
              id="review-author"
              type="text"
              placeholder="e.g. Samantha D."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full h-[48px] bg-[#F0F0F0] rounded-[12px] px-4 font-satoshi text-[15px] text-black placeholder:text-black/40 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Review Content */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="review-content"
              className="font-satoshi font-medium text-[14px] sm:text-[16px] text-black"
            >
              Your Review *
            </label>
            <textarea
              id="review-content"
              rows={4}
              placeholder="Write your detailed feedback here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#F0F0F0] rounded-[12px] p-4 font-satoshi text-[15px] text-black placeholder:text-black/40 focus:outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="h-[46px] px-6 rounded-[62px] border border-black/10 font-satoshi font-medium text-[15px] text-black hover:bg-[#F0F0F0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[46px] px-8 rounded-[62px] bg-black text-white font-satoshi font-medium text-[15px] hover:bg-black/80 transition-colors cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}