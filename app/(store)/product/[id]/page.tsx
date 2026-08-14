import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getProductBySlugOrId, getProducts } from '@/actions/product';
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
  const result = await getProductBySlugOrId(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Product Not Found - SHOP.CO',
      description: 'The requested product could not be found.',
    };
  }

  const product = result.data;
  return {
    title: `${product.title} - SHOP.CO`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} | SHOP.CO`,
      description: product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const result = await getProductBySlugOrId(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  // Fetch real related products from the same category
  const relatedResult = await getProducts({
    category: product.category?.slug,
    limit: 4,
  });

  const relatedProducts = (relatedResult.data?.products || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      title: p.title,
      price: p.basePrice,
      discount: p.discountPercentage,
      rating: p.rating,
      image: p.images[0]?.url || '/images/m1.png',
      src: p.images[0]?.url || '/images/m1.png',
      slug: p.slug,
      category: p.category?.name,
    }));

  // Extract gallery images
  const heroImage = product.images[0]?.url || '/images/pd1.png';
  const thumbnails = product.images.slice(1).map((img) => img.url);

  // Extract distinct colors and sizes from DB variants
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

  // Format reviews for UI tabs
  const formattedReviews = product.reviews.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    content: r.comment,
    isVerified: true,
    date: new Date(r.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  return (
    <div className="w-full bg-white dark:bg-black pb-20 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-3 py-5 sm:py-6 text-black/60 dark:text-zinc-400 font-satoshi text-[14px] sm:text-[16px] overflow-x-auto no-scrollbar"
        >
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight size={16} className="text-black/40 dark:text-zinc-600 shrink-0" />
          <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors shrink-0">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight size={16} className="text-black/40 dark:text-zinc-600 shrink-0" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-black dark:hover:text-white transition-colors shrink-0"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={16} className="text-black/40 dark:text-zinc-600 shrink-0" />
          <span className="text-black dark:text-white font-medium truncate">{product.title}</span>
        </nav>

        {/* Gallery & Product Info Split Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 items-start justify-between">
          <ProductGallery heroImage={heroImage} thumbnails={thumbnails} title={product.title} />

          <ProductInfo
            productId={product.id}
            title={product.title}
            rating={product.rating}
            price={product.basePrice}
            discountPercentage={product.discountPercentage}
            description={product.description}
            colors={availableColors}
            sizes={availableSizes}
            variants={product.variants}
            heroImage={heroImage}
          />
        </div>

        {/* Tabs: Details / Reviews / FAQs */}
        <ProductTabs
          productId={product.id}
          totalReviews={product.reviewCount}
          reviews={formattedReviews}
          detailsText={product.description}
        />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      </div>
    </div>
  );
}