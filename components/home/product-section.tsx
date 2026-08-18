import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/home/product-card';
import { ScrollReveal } from '@/components/shared/scroll-reveal';

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
  const headingId = id ? `${id}-heading` : `${title.toLowerCase().replace(/\s+/g, '-')}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="w-full bg-white dark:bg-black py-8 sm:py-16 xl:py-18 scroll-mt-16 lg:scroll-mt-24 transition-colors"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Section Heading */}
        <ScrollReveal direction="up" delay={0} distance={20}>
          <h2
            id={headingId}
            className="font-integral font-bold text-[32px] sm:text-[40px] xl:text-[48px] leading-[38px] sm:leading-[48px] xl:leading-[58px] text-black dark:text-white text-center uppercase tracking-tight mb-8 sm:mb-12 xl:mb-14"
          >
            {title}
          </h2>
        </ScrollReveal>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 xl:gap-[20px]">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={index >= 2 ? 'hidden md:block w-full' : 'w-full'}
              >
                <ScrollReveal direction="up" delay={index * 130} distance={30}>
                  <ProductCard product={product} />
                </ScrollReveal>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm font-satoshi text-black/50 dark:text-zinc-500">
            No products available in this collection.
          </div>
        )}

        {/* View All CTA Button */}
        {products.length > 0 && viewAllHref && (
          <ScrollReveal direction="up" delay={200} distance={15}>
            <div className="flex justify-center mt-6 sm:mt-12">
              <Link
                href={viewAllHref}
                className="w-full sm:w-[218px] h-[46px] sm:h-[52px] border border-black/10 dark:border-zinc-800 rounded-[62px] font-satoshi font-medium text-[14px] sm:text-[16px] leading-[22px] text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs"
              >
                View All
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* Section Divider */}
        {showDivider && (
          <div className="w-full h-[1px] bg-black/10 dark:bg-zinc-800 mt-8 sm:mt-16 xl:mt-20" />
        )}
      </div>
    </section>
  );
}