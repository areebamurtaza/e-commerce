// app/admin/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlugOrId } from '@/actions/product';
import { ProductDetailView } from '@/components/admin/product-detail-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const result = await getProductBySlugOrId(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-4 p-8 text-center font-satoshi">
        <h2 className="text-xl font-bold font-integral uppercase text-black dark:text-white">Product Not Found</h2>
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

  return <ProductDetailView product={result.data} />;
}