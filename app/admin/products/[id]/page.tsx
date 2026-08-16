// app/admin/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlugOrId } from '@/actions/product';
import { ProductDetailView } from '@/components/admin/product-detail-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await verifyAdmin();
  const { id } = await params;
  const result = await getProductBySlugOrId(id);

  if (!result.success || !result.data) {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-4">
        <Button asChild variant="outline" size="sm" className="rounded-[62px] text-xs">
          <Link href="/admin/products">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Catalog
          </Link>
        </Button>

        <Button asChild size="sm" className="rounded-[62px] text-xs bg-black text-white dark:bg-white dark:text-black">
          <Link href={`/admin/products/${result.data.id}/edit`}>
            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit Product
          </Link>
        </Button>
      </div>

      <ProductDetailView product={result.data} />
    </div>
  );
}