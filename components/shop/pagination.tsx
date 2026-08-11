'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="w-full pt-8 sm:pt-10 border-t border-black/10 mt-8 sm:mt-10 flex items-center justify-between">
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="h-[36px] sm:h-[40px] px-3.5 sm:px-4 rounded-[8px] border border-black/10 font-satoshi font-medium text-[12px] sm:text-[14px] text-black flex items-center gap-2 disabled:opacity-40 cursor-not-allowed hover:bg-black hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-2 font-satoshi font-medium text-[12px] sm:text-[14px]">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`w-8 sm:w-10 h-8 sm:h-10 rounded-[8px] transition-colors cursor-pointer ${
              currentPage === page
                ? 'bg-black/10 text-black font-bold'
                : 'text-black/60 hover:bg-[#F0F0F0]'
            }`}
          >
            {page}
          </button>
        ))}

        <span className="text-black/40 px-1">...</span>

        {[8, 9, 10].map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`w-8 sm:w-10 h-8 sm:h-10 rounded-[8px] transition-colors cursor-pointer ${
              currentPage === page
                ? 'bg-black/10 text-black font-bold'
                : 'text-black/60 hover:bg-[#F0F0F0]'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="h-[36px] sm:h-[40px] px-3.5 sm:px-4 rounded-[8px] border border-black/10 font-satoshi font-medium text-[12px] sm:text-[14px] text-black flex items-center gap-2 hover:bg-black hover:text-white transition-colors cursor-pointer"
      >
        <span>Next</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}