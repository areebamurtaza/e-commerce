// components/shared/price-tag.tsx
import { cn } from '@/lib/utils';

export interface PriceTagProps {
  price: number;
  discount?: number;
  discountPercentage?: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceTag({
  price,
  discount,
  discountPercentage,
  originalPrice,
  className,
  size = 'md',
}: PriceTagProps) {
  const activeDiscount = discount ?? discountPercentage ?? 0;
  const hasDiscount = activeDiscount > 0 || (originalPrice !== undefined && originalPrice > price);

  let currentPrice = price;
  let strikethroughPrice = originalPrice;

  if (hasDiscount && !strikethroughPrice && activeDiscount > 0) {
    strikethroughPrice = price;
    currentPrice = Number((price * (1 - activeDiscount / 100)).toFixed(2));
  }

  const sizeClasses = {
    sm: {
      current: 'text-sm sm:text-base font-bold',
      original: 'text-xs sm:text-sm',
      badge: 'text-[10px] sm:text-xs px-1.5 py-0.5',
    },
    md: {
      current: 'text-base sm:text-xl md:text-2xl font-bold',
      original: 'text-sm sm:text-base md:text-xl',
      badge: 'text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1',
    },
    lg: {
      current: 'text-2xl sm:text-3xl md:text-4xl font-bold',
      original: 'text-lg sm:text-2xl md:text-3xl',
      badge: 'text-xs sm:text-sm px-2.5 sm:px-3 py-1',
    },
  };

  return (
    <div
      className={cn('flex items-center gap-2 sm:gap-2.5 font-satoshi flex-wrap', className)}
      aria-label={`Price: $${currentPrice.toFixed(2)}`}
    >
      <span className={cn('text-black dark:text-white tracking-tight', sizeClasses[size].current)}>
        ${currentPrice.toFixed(2)}
      </span>

      {hasDiscount && strikethroughPrice && (
        <>
          <del className={cn('text-black/40 dark:text-zinc-500 line-through font-bold', sizeClasses[size].original)}>
            ${strikethroughPrice.toFixed(2)}
          </del>

          {activeDiscount > 0 && (
            <span className={cn('rounded-full bg-[#FF3333]/10 text-[#FF3333] font-medium', sizeClasses[size].badge)}>
              -{Math.round(activeDiscount)}%
            </span>
          )}
        </>
      )}
    </div>
  );
}