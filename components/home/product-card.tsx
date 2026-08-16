// components/home/product-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ProductCardData } from '@/types/product';
import { RatingStars } from '@/components/shared/rating-stars';
import { PriceTag } from '@/components/shared/price-tag';

export type { ProductCardData };

export interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.price ?? product.basePrice ?? 0;
  const discount = product.discount ?? product.discountPercentage ?? 0;
  const imageUrl = product.src || product.image || '/images/pd1.png';

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group flex flex-col w-full focus:outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[13.42px] sm:rounded-[20px] bg-[#F0EEED] dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 transition-transform duration-200 group-hover:scale-[1.02]">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center"
        />
      </div>

      <div className="mt-2.5 sm:mt-4 flex flex-col gap-1 sm:gap-1.5 font-satoshi">
        <h3 className="font-bold text-[14px] sm:text-[18px] text-black dark:text-white line-clamp-1 group-hover:underline">
          {product.title}
        </h3>

        {/* Fixed: Render RatingStars only once (it already outputs the numeric score internally) */}
        <div className="flex items-center gap-2">
          <RatingStars rating={product.rating} />
        </div>

        <PriceTag price={displayPrice} discount={discount} />
      </div>
    </Link>
  );
}