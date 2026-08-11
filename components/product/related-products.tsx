'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { RatingStars } from '@/components/shared/rating-stars';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="w-full mt-16 sm:mt-24 pt-10 sm:pt-16">
      <h2 className="font-integral font-bold text-[32px] sm:text-[48px] leading-[38px] sm:leading-[58px] text-black uppercase text-center mb-8 sm:mb-14">
        YOU MIGHT ALSO LIKE
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="group flex flex-col focus:outline-none"
          >
            <div className="relative w-full aspect-square rounded-[20px] bg-[#F0EEED] overflow-hidden mb-4">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 295px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="font-satoshi font-bold text-[16px] sm:text-[20px] leading-[22px] sm:leading-[27px] text-black truncate mb-2 group-hover:text-black/70 transition-colors">
              {item.title}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <RatingStars rating={item.rating} size={16} />
              <span className="font-satoshi font-normal text-[12px] sm:text-[14px] text-black">
                {item.rating.toFixed(1)}/<span className="text-black/60">5</span>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-satoshi font-bold text-[20px] sm:text-[24px] leading-[27px] sm:leading-[32px] text-black">
                ${item.price}
              </span>
              {item.originalPrice && (
                <span className="font-satoshi font-bold text-[20px] sm:text-[24px] leading-[27px] sm:leading-[32px] text-black/40 line-through">
                  ${item.originalPrice}
                </span>
              )}
              {item.discountPercentage && (
                <span className="bg-[#FF3333]/10 text-[#FF3333] font-satoshi font-medium text-[10px] sm:text-[12px] leading-[14px] px-2.5 py-1 rounded-[62px]">
                  -{item.discountPercentage}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}