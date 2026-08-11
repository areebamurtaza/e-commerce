'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { RatingStars } from '@/components/shared/rating-stars';
import { PriceTag } from '@/components/shared/price-tag';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    <div className="group flex flex-col items-start w-full transition-transform duration-200">
      {/* 
        Figma Frame 32 Specifications:
        Width: 295px | Height: 298px | Background: #F0EEED | Border Radius: 20px
      */}
      <Link
        href={product.href || `#${product.id}`}
        className="relative w-full aspect-square sm:aspect-[295/298] bg-[#F0EEED] rounded-[20px] overflow-hidden flex items-center justify-center p-4 sm:p-6 mb-4"
        aria-label={`View details for ${product.title}`}
      >
        {!imageError ? (
          <Image
            src={product.src}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 295px"
            className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 text-black/40 text-xs font-mono rounded-lg p-2 text-center">
            <span>Asset Not Found</span>
            <span className="text-[10px] text-black/30 mt-1">{product.src}</span>
          </div>
        )}
      </Link>

      {/* Product Title */}
      <Link href={product.href || `#${product.id}`}>
        <h3 className="font-satoshi font-bold text-[16px] sm:text-[18px] xl:text-[20px] leading-[22px] sm:leading-[27px] text-black line-clamp-1 hover:underline decoration-1 underline-offset-4">
          {product.title}
        </h3>
      </Link>

      {/* Star Rating Component */}
      <div className="mt-1.5 sm:mt-2">
        <RatingStars rating={product.rating} />
      </div>

      {/* Price Tag Component */}
      <div className="mt-2 sm:mt-2.5">
        <PriceTag
          price={product.price}
          originalPrice={product.originalPrice}
          discountPercentage={product.discountPercentage}
        />
      </div>
    </div>
  );
}