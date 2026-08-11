'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/home/product-card';

interface ProductSectionProps {
  id?: string;
  title: string;
  products: Product[];
  viewAllHref?: string;
  showDivider?: boolean;
}

export function ProductSection({
  id,
  title,
  products,
  viewAllHref = '/shop',
  showDivider = true,
}: ProductSectionProps) {
  return (
    <section
      id={id}
      className="w-full bg-white py-8 sm:py-16 xl:py-18 scroll-mt-16 lg:scroll-mt-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Section Heading */}
        <h2 className="font-integral font-bold text-[32px] sm:text-[40px] xl:text-[48px] leading-[38px] sm:leading-[48px] xl:leading-[58px] text-black text-center uppercase tracking-tight mb-8 sm:mb-12 xl:mb-14">
          {title}
        </h2>

        {/* 
          Mobile vs Desktop Grid:
          Mobile (< md): Exactly 2 items loaded in a single 2-column row.
          Desktop (>= md): All items loaded in a 4-column grid.
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 xl:gap-[20px]">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={index >= 2 ? 'hidden md:block w-full' : 'w-full'}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All CTA Button */}
        <div className="flex justify-center mt-6 sm:mt-12">
          <Link
            href={viewAllHref}
            className="w-full sm:w-[218px] h-[46px] sm:h-[52px] border border-black/10 rounded-[62px] font-satoshi font-medium text-[14px] sm:text-[16px] leading-[22px] text-black flex items-center justify-center hover:bg-black hover:text-white transition-all duration-200 active:scale-95"
          >
            View All
          </Link>
        </div>

        {/* Section Divider */}
        {showDivider && (
          <div className="w-full h-[1px] bg-black/10 mt-8 sm:mt-16 xl:mt-20" />
        )}
      </div>
    </section>
  );
}