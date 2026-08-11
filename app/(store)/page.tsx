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
      
      {/* Brand Bar section contains id="brands" internally */}
      <BrandBar />

      {/* New Arrivals Section with smooth scroll anchor target */}
      <ProductSection
        id="new-arrivals"
        title="NEW ARRIVALS"
        products={NEW_ARRIVALS}
        viewAllHref="/shop?sort=new-arrivals"
        showDivider={true}
      />

      {/* Top Selling Section with smooth scroll anchor target */}
      <ProductSection
        id="top-selling"
        title="TOP SELLING"
        products={TOP_SELLING}
        viewAllHref="/shop?sort=top-selling"
        showDivider={false}
      />

      <DressStyleGrid />
      <ReviewsSection />
    </div>
  );
}