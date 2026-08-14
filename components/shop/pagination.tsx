'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;

    if (onPageChange) {
      onPageChange(pageNumber);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`/shop?${params.toString()}`);
  };

  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="w-full pt-8 sm:pt-10 border-t border-black/10 mt-8 sm:mt-10 flex items-center justify-between font-satoshi">
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => handlePageClick(currentPage - 1)}
        className="h-[36px] sm:h-[40px] px-3.5 sm:px-4 rounded-[8px] border border-black/10 font-satoshi font-medium text-[12px] sm:text-[14px] text-black flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-2 font-satoshi font-medium text-[12px] sm:text-[14px]">
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="text-black/40 px-1">
                ...
              </span>
            );
          }

          const pageNum = Number(page);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => handlePageClick(pageNum)}
              className={`w-8 sm:w-10 h-8 sm:h-10 rounded-[8px] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-black text-white font-bold'
                  : 'text-black/60 hover:bg-[#F0F0F0]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        className="h-[36px] sm:h-[40px] px-3.5 sm:px-4 rounded-[8px] border border-black/10 font-satoshi font-medium text-[12px] sm:text-[14px] text-black flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors cursor-pointer"
      >
        <span>Next</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}