// components/product/related-products.tsx
import { ProductCard, ProductCardData } from '@/components/home/product-card';

export interface RelatedProductsProps {
  products: ProductCardData[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full mt-14 sm:mt-20 font-satoshi text-black dark:text-white">
      <h2 className="font-integral font-bold text-[28px] sm:text-[36px] xl:text-[48px] text-center text-black dark:text-white uppercase mb-8 sm:mb-12 tracking-tight">
        You Might Also Like
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}