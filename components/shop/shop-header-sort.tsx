'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { MobileFilterDrawer } from '@/components/shop/mobile-filter-drawer';

interface ShopHeaderSortProps {
  currentSort: string;
}

export function ShopHeaderSort({ currentSort }: ShopHeaderSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const handleSortChange = (sortKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortKey);
    router.push(`/shop?${params.toString()}`);
    setIsSortOpen(false);
  };

  const getSortLabel = (key: string) => {
    switch (key) {
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'rating':
        return 'Highest Rating';
      case 'newest':
      default:
        return 'Most Popular';
    }
  };

  return (
    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
      {/* Mobile Filter Trigger Button */}
      <button
        type="button"
        onClick={() => setIsMobileDrawerOpen(true)}
        className="lg:hidden w-10 h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
        aria-label="Open mobile filters"
      >
        <SlidersHorizontal size={20} className="rotate-90" />
      </button>

      {/* Sorting Dropdown */}
      <div className="relative">
        <div className="flex items-center gap-1.5 font-satoshi text-[14px] text-black/60">
          <span className="hidden sm:inline">Sort by:</span>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1 font-bold text-black hover:text-black/70 focus:outline-none cursor-pointer"
          >
            <span>{getSortLabel(currentSort)}</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {isSortOpen && (
          <div className="absolute top-full right-0 mt-2 w-[180px] bg-white rounded-[16px] shadow-2xl border border-black/10 p-2 z-30 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={() => handleSortChange('newest')}
              className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                currentSort === 'newest'
                  ? 'bg-black text-white font-medium'
                  : 'text-black hover:bg-[#F0F0F0]'
              }`}
            >
              Most Popular
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('price-low')}
              className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                currentSort === 'price-low'
                  ? 'bg-black text-white font-medium'
                  : 'text-black hover:bg-[#F0F0F0]'
              }`}
            >
              Price: Low to High
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('price-high')}
              className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                currentSort === 'price-high'
                  ? 'bg-black text-white font-medium'
                  : 'text-black hover:bg-[#F0F0F0]'
              }`}
            >
              Price: High to Low
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('rating')}
              className={`w-full text-left px-3 py-2 rounded-[8px] font-satoshi text-[14px] cursor-pointer ${
                currentSort === 'rating'
                  ? 'bg-black text-white font-medium'
                  : 'text-black hover:bg-[#F0F0F0]'
              }`}
            >
              Highest Rating
            </button>
          </div>
        )}
      </div>

      {/* Slide-over Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </div>
  );
}