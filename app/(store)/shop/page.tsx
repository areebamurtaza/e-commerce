// app/(store)/shop/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { getProducts } from '@/actions/product';
import { DressStyle, Gender } from '@prisma/client';
import { ProductCard, ProductCardData } from '@/components/home/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { ShopHeaderSort } from '@/components/shop/shop-header-sort';
import { Pagination } from '@/components/shop/pagination';

export const metadata: Metadata = {
  title: 'Catalog Shop - SHOP.CO',
  description: 'Browse through our full collection of high-quality fashion apparel.',
};

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    discount?: string;
    gender?: string;
    category?: string;
    type?: string;
    style?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;

  const searchQuery = resolvedSearchParams.search || '';
  const categoryQuery = resolvedSearchParams.category || resolvedSearchParams.type || '';
  const genderQuery = resolvedSearchParams.gender || '';
  const styleQuery = resolvedSearchParams.style || '';
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
  const sortQuery = resolvedSearchParams.sort || 'newest';
  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);

  // 1. Map DressStyle Enum safely
  let dressStyleEnum: DressStyle | undefined = undefined;
  if (styleQuery) {
    const normalized = styleQuery.toUpperCase();
    if (['CASUAL', 'FORMAL', 'PARTY', 'GYM'].includes(normalized)) {
      dressStyleEnum = normalized as DressStyle;
    }
  }

  // 2. Map Sorting Keys
  let mappedSort: 'price-asc' | 'price-desc' | 'popular' | 'newest' = 'newest';
  if (sortQuery === 'price-low') mappedSort = 'price-asc';
  else if (sortQuery === 'price-high') mappedSort = 'price-desc';
  else if (sortQuery === 'rating') mappedSort = 'popular';
  else if (sortQuery === 'newest') mappedSort = 'newest';

  // 3. Query Database
  const result = await getProducts({
    query: searchQuery || undefined,
    category: categoryQuery || undefined,
    gender: genderQuery || undefined,
    dressStyle: dressStyleEnum,
    minPrice,
    maxPrice,
    sort: mappedSort,
    page: currentPage,
    limit: 9,
  });

  const products = result.success && result.data ? result.data.products : [];
  const meta = result.data?.meta || { total: 0, page: 1, limit: 9, totalPages: 1 };

  // 4. Derive Page Heading
  let pageTitle = 'All Products';
  if (genderQuery && categoryQuery) {
    const gFormatted = genderQuery.charAt(0).toUpperCase() + genderQuery.slice(1).toLowerCase();
    pageTitle = `${gFormatted}'s ${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)}`;
  } else if (genderQuery) {
    const gFormatted = genderQuery.charAt(0).toUpperCase() + genderQuery.slice(1).toLowerCase();
    pageTitle = `${gFormatted}'s Collection`;
  } else if (categoryQuery) {
    pageTitle = categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1);
  } else if (styleQuery) {
    pageTitle = `${styleQuery.charAt(0).toUpperCase() + styleQuery.slice(1).toLowerCase()} Style`;
  } else if (searchQuery) {
    pageTitle = `Results for "${searchQuery}"`;
  }

  const startIndex = meta.total > 0 ? (currentPage - 1) * meta.limit + 1 : 0;
  const endIndex = Math.min(currentPage * meta.limit, meta.total);

  return (
    <div className="w-full bg-white dark:bg-black pb-20 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-3 py-5 sm:py-6 text-black/60 dark:text-zinc-400 font-satoshi text-[14px] sm:text-[16px]"
        >
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="text-black/40 dark:text-zinc-600" />
          <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">
            Shop
          </Link>
          {genderQuery && (
            <>
              <ChevronRight size={16} className="text-black/40 dark:text-zinc-600" />
              <Link
                href={`/shop?gender=${genderQuery}`}
                className="hover:text-black dark:hover:text-white transition-colors capitalize"
              >
                {genderQuery}
              </Link>
            </>
          )}
          <ChevronRight size={16} className="text-black/40 dark:text-zinc-600" />
          <span className="text-black dark:text-white font-medium">{pageTitle}</span>
        </nav>

        {/* Database Diagnostic Banner */}
        {!result.success && (
          <div className="mb-6 p-4 rounded-[16px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Database Connection Error: {result.error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start">
          {/* Left Column: Filters */}
          <div className="hidden lg:block w-[295px] shrink-0 sticky top-28">
            <ShopFilters />
          </div>

          {/* Right Column: Catalog Grid */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="font-satoshi font-bold text-[28px] sm:text-[32px] capitalize leading-none">
                  {pageTitle}
                </h1>
                <span className="font-satoshi font-normal text-[14px] sm:text-[16px] text-black/60 dark:text-zinc-400 self-end mb-0.5">
                  {meta.total > 0
                    ? `Showing ${startIndex}-${endIndex} of ${meta.total} Products`
                    : 'Showing 0 Products'}
                </span>
              </div>

              <Suspense fallback={<div className="h-10 w-32 bg-[#F0F0F0] dark:bg-zinc-800 rounded-[62px]" />}>
                <ShopHeaderSort currentSort={sortQuery} />
              </Suspense>
            </div>

            {/* Product Cards Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {products.map((product) => {
                  const cardData: ProductCardData = {
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    price: product.basePrice,
                    discount: product.discountPercentage,
                    rating: product.rating,
                    src: product.images[0]?.url || '/images/m1.png',
                    image: product.images[0]?.url || '/images/m1.png',
                    category: product.category?.name,
                  };

                  return <ProductCard key={product.id} product={cardData} />;
                })}
              </div>
            ) : (
              <div className="w-full bg-[#F0F0F0]/50 dark:bg-zinc-900/50 rounded-[20px] border border-black/10 dark:border-zinc-800 py-16 px-6 flex flex-col items-center justify-center text-center gap-4 my-4">
                <h2 className="font-integral font-bold text-[24px] uppercase">
                  No Products Found
                </h2>
                <p className="font-satoshi text-[15px] text-black/60 dark:text-zinc-400 max-w-[420px]">
                  We couldn&apos;t find any items matching your selected criteria. Try clearing your filters.
                </p>
                <Link
                  href="/shop"
                  className="mt-2 h-[48px] px-8 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-medium text-[15px] flex items-center justify-center hover:bg-black/80 dark:hover:bg-white/80 transition-all active:scale-95"
                >
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={meta.totalPages} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}