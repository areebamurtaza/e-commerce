// app/(store)/page.tsx
import { HeroSection } from '@/components/home/hero-section';
import { BrandBar } from '@/components/home/brand-bar';
import { ProductSection } from '@/components/home/product-section';
import { DressStyleGrid } from '@/components/home/dress-style-grid';
import { ReviewsSection } from '@/components/home/reviews-section';
import { NEW_ARRIVALS, TOP_SELLING } from '@/lib/mock-data';

export default function StoreHomePage() {
  return (
    <div className="w-full bg-white overflow-hidden">
      <HeroSection />
      <BrandBar />
      <ProductSection title="NEW ARRIVALS" products={NEW_ARRIVALS} showDivider={true} />
      <ProductSection title="TOP SELLING" products={TOP_SELLING} showDivider={false} />
      <DressStyleGrid />
      <ReviewsSection />
    </div>
  );
}