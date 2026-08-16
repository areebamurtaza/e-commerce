// app/admin/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlugOrId, getAdminCategories } from '@/actions/product';
import { ProductForm } from '@/components/admin/product-form';
import { verifyAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  await verifyAdmin();
  const { id } = await params;

  const [productRes, categoriesRes] = await Promise.all([
    getProductBySlugOrId(id),
    getAdminCategories(),
  ]);

  if (!productRes.success || !productRes.data) {
    return (
      <div className="space-y-4 p-8 text-center font-satoshi">
        <h2 className="text-xl font-bold font-integral uppercase text-black dark:text-white">
          Product Not Found
        </h2>
        <p className="text-xs text-black/60 dark:text-zinc-400">
          The requested product ID does not exist in the database.
        </p>
        <Button asChild variant="outline" className="rounded-[62px] text-xs">
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ProductForm
      categories={categoriesRes.categories || []}
      initialData={productRes.data}
    />
  );
}