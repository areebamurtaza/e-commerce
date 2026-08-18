// components/shared/predictive-search.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, ArrowRight, Tag } from 'lucide-react';
import { searchProductsAutocomplete, AutocompleteProductItem } from '@/actions/product';

interface PredictiveSearchProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function PredictiveSearch({ isMobile = false, onCloseMobile }: PredictiveSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timeout = setTimeout(async () => {
      try {
        const items = await searchProductsAutocomplete(trimmed);
        setResults(items);
      } catch (err) {
        console.error('Search autocomplete error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      if (onCloseMobile) onCloseMobile();
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
    router.push(`/product/${slug}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isMobile ? 'max-w-full' : 'max-w-[577px]'}`}>
      <form
        onSubmit={handleSubmit}
        className="flex w-full h-[48px] bg-[#F0EEED] dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-[62px] px-4 items-center gap-3 focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all shadow-xs"
      >
        <button
          type="submit"
          className="text-black/40 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-0.5 focus:outline-none cursor-pointer"
          aria-label="Submit search"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-black/60 dark:text-zinc-400" />
          ) : (
            <Search size={19} className="shrink-0" />
          )}
        </button>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search for products, styles, collections..."
          className="w-full bg-transparent font-satoshi font-normal text-[15px] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none"
          aria-label="Search products"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-1 text-black/40 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown Preview */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 rounded-[20px] border border-black/10 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-satoshi text-black dark:text-white">
          <div className="p-3 border-b border-black/5 dark:border-zinc-800 flex items-center justify-between text-xs text-black/50 dark:text-zinc-400">
            <span>{isLoading ? 'Searching...' : `Found ${results.length} item(s)`}</span>
            <span className="text-[11px] font-medium">Press Enter for all results</span>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-black/5 dark:divide-zinc-800/60">
            {results.length > 0 ? (
              results.map((product) => {
                const discountedPrice =
                  product.discountPercentage > 0
                    ? Number((product.basePrice * (1 - product.discountPercentage / 100)).toFixed(2))
                    : product.basePrice;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product.slug)}
                    className="w-full p-3 flex items-center gap-3.5 hover:bg-black/5 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F0F0F0] dark:bg-zinc-800 shrink-0 border border-black/5 dark:border-zinc-700">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-sm font-bold truncate text-black dark:text-white">
                        {product.title}
                      </p>
                      <p className="text-[11px] text-black/50 dark:text-zinc-400">
                        {product.categoryName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-black dark:text-white">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <div className="flex items-center gap-1 justify-end text-[10px]">
                          <span className="line-through text-black/40 dark:text-zinc-500">
                            ${product.basePrice.toFixed(2)}
                          </span>
                          <span className="text-rose-600 font-bold">
                            -{product.discountPercentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : !isLoading ? (
              <div className="p-6 text-center text-xs text-black/40 dark:text-zinc-500">
                No matching products found for &quot;{query}&quot;.
              </div>
            ) : null}
          </div>

          {/* Footer view all link */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full p-3 bg-black/[0.02] dark:bg-zinc-800/40 hover:bg-black/[0.05] dark:hover:bg-zinc-800/80 border-t border-black/5 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-xs font-bold text-black dark:text-white transition-colors cursor-pointer"
          >
            <span>See all results for &quot;{query}&quot;</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
