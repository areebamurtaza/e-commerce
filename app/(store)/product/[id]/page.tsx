import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProductById, MOCK_RELATED_PRODUCTS } from '@/lib/mock-data';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductTabs } from '@/components/product/product-tabs';
import { RelatedProducts } from '@/components/product/related-products';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = getProductById(resolvedParams.id);

  return {
    title: `${product?.title || 'Product Detail'} - SHOP.CO`,
    description: product?.description || 'Browse high quality products on SHOP.CO',
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const product = getProductById(resolvedParams.id);

  return (
    <div className="w-full bg-white pb-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-3 py-5 sm:py-6 text-black/60 font-satoshi text-[14px] sm:text-[16px]"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="text-black/40" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          <ChevronRight size={16} className="text-black/40" />
          <Link
            href={`/shop?gender=${product?.category?.toLowerCase() || 'men'}`}
            className="hover:text-black transition-colors"
          >
            {product?.category || 'Men'}
          </Link>
          <ChevronRight size={16} className="text-black/40" />
          <span className="text-black font-medium truncate">
            {product?.subCategory || 'T-shirts'}
          </span>
        </nav>

        {/* Gallery & Specs Split Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 items-start justify-between">
          <ProductGallery
            heroImage={product?.images?.hero || '/images/pd1.png'}
            thumbnails={product?.images?.thumbnails || []}
            title={product?.title || 'Product'}
          />
          <ProductInfo
            productId={product?.id || resolvedParams.id}
            title={product?.title || 'Product'}
            rating={product?.rating || 5}
            price={product?.price || 0}
            originalPrice={product?.originalPrice}
            discountPercentage={product?.discountPercentage}
            description={product?.description || ''}
            colors={product?.colors || []}
            sizes={product?.sizes || []}
            heroImage={product?.images?.hero || '/images/pd1.png'}
          />
        </div>

        {/* Tabs: Details / Reviews / FAQs */}
        <ProductTabs
          totalReviews={product?.totalReviews || 0}
          reviews={product?.reviews || []}
          detailsText={product?.description || ''}
        />

        {/* You Might Also Like */}
        <RelatedProducts products={MOCK_RELATED_PRODUCTS} />
      </div>
    </div>
  );
}