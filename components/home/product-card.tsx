// components/home/product-card.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, StarHalf } from 'lucide-react';

export interface ProductCardData {
  id: string;
  title: string;
  slug?: string;
  price: number;
  basePrice?: number;
  discount?: number;
  discountPercentage?: number;
  rating?: number;
  image?: string;
  src?: string;
  imageUrl?: string;
  images?: Array<{ url: string; isPrimary?: boolean }> | string[];
  category?: string;
}

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // 1. Safe Image Resolution with Non-Empty Fallback
  const resolvedImageSrc = React.useMemo(() => {
    if (imageError) return '/images/m1.png';

    if (typeof product.src === 'string' && product.src.trim() !== '') {
      return product.src.trim();
    }
    if (typeof product.image === 'string' && product.image.trim() !== '') {
      return product.image.trim();
    }
    if (typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
      return product.imageUrl.trim();
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0];
      if (typeof first === 'string' && first.trim() !== '') return first.trim();
      if (typeof first === 'object' && first?.url && first.url.trim() !== '') return first.url.trim();
    }

    return '/images/m1.png';
  }, [product, imageError]);

  // 2. Financial Pricing Normalization
  const basePrice = product.price ?? product.basePrice ?? 0;
  const discount = product.discount ?? product.discountPercentage ?? 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? basePrice * (1 - discount / 100) : basePrice;

  // 3. Navigation Target (slug preferred, fallback to id)
  const productHref = `/product/${product.slug || product.id}`;
  const ratingValue = product.rating ?? 4.5;

  return (
    <Link
      href={productHref}
      className="group flex flex-col gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-[20px]"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#F0F0F0] dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 transition-transform duration-300 group-hover:scale-[1.02]">
        {resolvedImageSrc ? (
          <Image
            src={resolvedImageSrc}
            alt={product.title || 'Product Image'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-opacity duration-300"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-black/40 dark:text-zinc-500 font-satoshi font-medium">
            No Image Available
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-satoshi font-bold text-[16px] sm:text-[18px] text-black dark:text-white capitalize truncate leading-tight group-hover:underline underline-offset-4">
          {product.title}
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 text-amber-400">
          <div className="flex items-center">
            {[...Array(Math.floor(ratingValue))].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            {ratingValue % 1 >= 0.5 && (
              <StarHalf className="h-3.5 w-3.5 fill-current" />
            )}
          </div>
          <span className="font-satoshi text-xs text-black/60 dark:text-zinc-400 font-medium">
            {ratingValue.toFixed(1)}/5
          </span>
        </div>

        {/* Price Ledger */}
        <div className="flex items-center gap-2.5 font-satoshi">
          <span className="font-bold text-[20px] sm:text-[22px] text-black dark:text-white">
            ${finalPrice.toFixed(2)}
          </span>

          {hasDiscount && (
            <>
              <span className="font-bold text-[20px] sm:text-[22px] text-black/40 dark:text-zinc-600 line-through">
                ${basePrice.toFixed(2)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}