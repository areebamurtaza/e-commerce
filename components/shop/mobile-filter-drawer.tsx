'use client';

import { X } from 'lucide-react';
import { ShopFilters } from '@/components/shop/shop-filters';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilterDrawer({ isOpen, onClose }: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[340px] bg-white h-full overflow-y-auto p-4 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-black/10">
          <h2 className="font-satoshi font-bold text-[20px] text-black">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-black/60 hover:text-black rounded-full focus:outline-none cursor-pointer"
            aria-label="Close filters"
          >
            <X size={24} />
          </button>
        </div>

        <ShopFilters onApplyMobileClose={onClose} />
      </div>
    </div>
  );
}