// app/(store)/product/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getProductBySlugOrId, getProducts, ProductWithRelations } from '@/actions/product';
import { getProductReviews, ReviewWithUserData, ReviewAggregateStats } from '@/actions/review';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductTabs } from '@/components/product/product-tabs';
import { RelatedProducts } from '@/components/product/related-products';
import { ProductCardData } from '@/types/product';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Dynamically generates SEO, OpenGraph, and Twitter card metadata
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getProductBySlugOrId(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Product Not Found | SHOP.CO',
      description: 'The requested fashion apparel could not be found.',
    };
  }

  const product = result.data;
  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    '/images/hero1.png';

  return {
    title: `${product.title} | SHOP.CO`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} | SHOP.CO`,
      description: product.description.slice(0, 160),
      url: `/product/${product.slug}`,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | SHOP.CO`,
      description: product.description.slice(0, 160),
      images: [primaryImage],
    },
  };
}

/**
 * Maps relational Prisma product entities to UI card models for related products
 */
function mapToCardData(p: ProductWithRelations): ProductCardData {
  const image =
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
    src: image,
    image,
    category: p.category?.name || 'Apparel',
    dressStyle: p.dressStyle,
    gender: p.gender,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const productResult = await getProductBySlugOrId(resolvedParams.id);

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  const product = productResult.data;

  // Parallel execution: fetch related items and review aggregation concurrently
  const [relatedResult, reviewsResult] = await Promise.all([
    getProducts({
      category: product.category?.slug,
      limit: 5,
    }),
    getProductReviews(product.id),
  ]);

  // Filter out current active product from related carousel
  const relatedProducts: ProductCardData[] = (
    relatedResult.success && relatedResult.data ? relatedResult.data.products : []
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map(mapToCardData);

  // Parse review data and statistical breakdown
  const initialReviews: ReviewWithUserData[] = reviewsResult.success
    ? reviewsResult.reviews
    : [];

  const initialStats: ReviewAggregateStats = reviewsResult.success
    ? reviewsResult.stats
    : {
        averageRating: product.rating,
        totalReviews: product.reviewCount,
        breakdown: [5, 4, 3, 2, 1].map((stars) => ({
          stars,
          count: 0,
          percentage: 0,
        })),
      };

  // Gallery processing: extract primary hero image and secondary thumbnails
  const primaryImgRecord = product.images.find((img) => img.isPrimary);
  const heroImage = primaryImgRecord
    ? primaryImgRecord.url
    : product.images[0]?.url || '/images/pd1.png';

  const thumbnails = product.images
    .filter((img) => img.url !== heroImage)
    .map((img) => img.url);

  // Fallback thumbnails if single image exists
  const allGalleryThumbnails =
    thumbnails.length > 0 ? thumbnails : [heroImage];

  // Distinct variant matrix parsing
  const colorMap = new Map<string, { name: string; hex: string }>();
  const sizeSet = new Set<string>();

  product.variants.forEach((v) => {
    if (!colorMap.has(v.colorHex)) {
      colorMap.set(v.colorHex, { name: v.colorName, hex: v.colorHex });
    }
    sizeSet.add(v.size);
  });

  const availableColors = Array.from(colorMap.values());
  const availableSizes = Array.from(sizeSet);

  return (
    <div className="w-full bg-white dark:bg-black pb-20 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-3 py-5 sm:py-6 text-black/60 dark:text-zinc-400 font-satoshi text-[14px] sm:text-[16px] overflow-x-auto no-scrollbar"
        >
          <Link
            href="/"
            className="hover:text-black dark:hover:text-white transition-colors shrink-0"
          >
            Home
          </Link>
          <ChevronRight size={16} className="text-black/40 dark:text-zinc-600 shrink-0" />
          <Link
            href="/shop"
            className="hover:text-black dark:hover:text-white transition-colors shrink-0"
          >
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight size={16} className="text-black/40 dark:text-zinc-600 shrink-0" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-black dark:hover:text-white transition-colors shrink-0 capitalize"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={16} className="text-black/40 dark:text-zinc-600 shrink-0" />
          <span className="text-black dark:text-white font-medium truncate">
            {product.title}
          </span>
        </nav>

        {/* Gallery & Product Information Split Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 items-start justify-between">
          <ProductGallery
            heroImage={heroImage}
            thumbnails={allGalleryThumbnails}
            title={product.title}
          />

          <ProductInfo
            productId={product.id}
            title={product.title}
            rating={initialStats.averageRating || product.rating}
            price={product.basePrice}
            discountPercentage={product.discountPercentage}
            description={product.description}
            colors={availableColors}
            sizes={availableSizes}
            variants={product.variants}
            heroImage={heroImage}
          />
        </div>

        {/* Dynamic Aggregated Reviews, Details & FAQs Tabs */}
        <ProductTabs
          productId={product.id}
          totalReviews={initialStats.totalReviews}
          initialReviews={initialReviews}
          initialStats={initialStats}
          detailsText={product.description}
        />

        {/* Related Products Recommendations */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </div>
  );
}