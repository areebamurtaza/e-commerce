// app/admin/products/page.tsx
import { Suspense } from 'react';
import { getAdminProducts, getAdminCategories } from '@/actions/product';
import { ProductsTable } from '@/components/admin/products-table';

export const dynamic = 'force-dynamic';

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: 'All' | 'Active' | 'Out Of Stock';
    category?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search ?? '';
  const status = resolvedParams.status ?? 'All';
  const category = resolvedParams.category ?? 'All';
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const [productsResult, categoriesResult] = await Promise.all([
    getAdminProducts({
      search,
      status,
      category,
      page,
      limit: 10,
    }),
    getAdminCategories(),
  ]);

  const products = productsResult.success ? productsResult.products : [];
  const kpi = productsResult.kpi;
  const pagination = productsResult.pagination;
  const categories = categoriesResult.categories;

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center font-satoshi text-xs text-black/40 dark:text-zinc-500">
          Loading product inventory...
        </div>
      }
    >
      <ProductsTable
        initialProducts={products}
        kpi={kpi}
        pagination={pagination}
        categories={categories}
        currentSearch={search}
        currentStatus={status}
        currentCategory={category}
      />
    </Suspense>
  );
}