// app/(store)/page.tsx
import { HeroSection } from '@/components/home/hero-section';
import { BrandBar } from '@/components/home/brand-bar';
import { ProductSection } from '@/components/home/product-section';
import { DressStyleGrid } from '@/components/home/dress-style-grid';
import { ReviewsSection } from '@/components/home/reviews-section';
import { getProducts, ProductWithRelations } from '@/actions/product';
import { Product } from '@/types/product';

export const revalidate = 3600; // ISR cache revalidation every 1 hour

function mapRelationalProductToViewModel(p: ProductWithRelations): Product {
  const primaryImg =
    p.images.find((img) => img.isPrimary)?.url ||
    p.images[0]?.url ||
    '/images/pd1.png';

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.basePrice,
    basePrice: p.basePrice,
    discount: p.discountPercentage,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    reviewCount: p.reviewCount,
    src: primaryImg,
    image: primaryImg,
    category: p.category?.name || 'Apparel',
    dressStyle: p.dressStyle,
    gender: p.gender,
  };
}

export default async function HomePage() {
  const [newArrivalsRes, topSellingRes] = await Promise.all([
    getProducts({ isNewArrival: true, limit: 4, sort: 'newest' }),
    getProducts({ sort: 'popular', limit: 4 }),
  ]);

  const newArrivals: Product[] =
    newArrivalsRes.success && newArrivalsRes.data
      ? newArrivalsRes.data.products.map(mapRelationalProductToViewModel)
      : [];

  const topSelling: Product[] =
    topSellingRes.success && topSellingRes.data
      ? topSellingRes.data.products.map(mapRelationalProductToViewModel)
      : [];

  return (
    <div className="w-full bg-white dark:bg-black transition-colors">
      <HeroSection />
      <BrandBar />
      <div className="space-y-4 sm:space-y-6">
        <ProductSection
          id="new-arrivals"
          title="NEW ARRIVALS"
          products={newArrivals}
          viewAllHref="/shop?sort=newest"
          showDivider={true}
        />
        <ProductSection
          id="top-selling"
          title="TOP SELLING"
          products={topSelling}
          viewAllHref="/shop?sort=popular"
          showDivider={false}
        />
        <DressStyleGrid />
        <ReviewsSection />
      </div>
    </div>
  );
}