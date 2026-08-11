import { Suspense } from 'react';
import Metadata from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getFilteredProducts } from '@/lib/mock-data';
import { ProductCard } from '@/components/home/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { ShopHeaderSort } from '@/components/shop/shop-header-sort';
import { Pagination } from '@/components/shop/pagination';

export const metadata = {
  title: 'Catalog Shop - SHOP.CO',
  description: 'Browse through our full collection of high-quality fashion apparel.',
};

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    discount?: string;
    gender?: string;
    category?: string;
    style?: string;
    minPrice?: string;
    maxPrice?: string;
    color?: string;
    size?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;

  const searchQuery = resolvedSearchParams.search || '';
  const isDiscount = resolvedSearchParams.discount === 'true';
  const genderQuery = resolvedSearchParams.gender || '';
  const categoryQuery = resolvedSearchParams.category || '';
  const styleQuery = resolvedSearchParams.style || '';
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
  const colorQuery = resolvedSearchParams.color || '';
  const sizeQuery = resolvedSearchParams.size || '';
  const sortQuery = resolvedSearchParams.sort || 'newest';

  const products = getFilteredProducts({
    search: searchQuery,
    discount: isDiscount,
    gender: genderQuery,
    category: categoryQuery,
    style: styleQuery,
    minPrice,
    maxPrice,
    color: colorQuery,
    size: sizeQuery,
    sort: sortQuery,
  });

  let pageTitle = 'Casual';
  if (styleQuery) pageTitle = styleQuery;
  else if (categoryQuery) pageTitle = categoryQuery;
  else if (genderQuery) pageTitle = `${genderQuery}'s Clothing`;
  else if (isDiscount) pageTitle = 'On Sale Discount Offers';
  else if (searchQuery) pageTitle = `Results for "${searchQuery}"`;

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
          <span className="text-black font-medium">{pageTitle}</span>
        </nav>

        {/* 2-Column Catalog Layout */}
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start">
          {/* Left Column: Fixed 295px Sidebar (Desktop) */}
          <div className="hidden lg:block w-[295px] shrink-0 sticky top-28">
            <ShopFilters />
          </div>

          {/* Right Column: Catalog Grid */}
          <div className="flex-1 w-full min-w-0">
            {/* Header Title & Sorting Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="font-satoshi font-bold text-[28px] sm:text-[32px] text-black capitalize leading-none">
                  {pageTitle}
                </h1>
                <span className="font-satoshi font-normal text-[14px] sm:text-[16px] text-black/60 self-end mb-0.5">
                  Showing 1-{products.length} of {products.length} Products
                </span>
              </div>

              <Suspense fallback={<div className="h-10 w-32 bg-[#F0F0F0] rounded-[62px]" />}>
                <ShopHeaderSort currentSort={sortQuery} />
              </Suspense>
            </div>

            {/* Product Cards Grid (3 Columns Desktop, 2 Columns Mobile) */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* No Search Results View */
              <div className="w-full bg-[#F0F0F0]/50 rounded-[20px] border border-black/10 py-16 px-6 flex flex-col items-center justify-center text-center gap-4 my-4">
                <h2 className="font-integral font-bold text-[24px] text-black uppercase">
                  No Products Found
                </h2>
                <p className="font-satoshi text-[15px] text-black/60 max-w-[420px]">
                  We couldn&apos;t find any items matching your selected criteria. Try adjusting your filters or search terms.
                </p>
                <Link
                  href="/shop"
                  className="mt-2 h-[48px] px-8 rounded-[62px] bg-black text-white font-satoshi font-medium text-[15px] flex items-center justify-center hover:bg-black/80 transition-all active:scale-95"
                >
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && <Pagination currentPage={1} totalPages={10} />}
          </div>
        </div>
      </div>
    </div>
  );
}