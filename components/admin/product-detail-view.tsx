// components/admin/product-detail-view.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteProduct, ProductWithRelations } from '@/actions/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ProductDeleteDialog,
  ProductToDelete,
} from '@/components/admin/product-delete-dialog';
import { AdminToast, AdminToastState } from '@/components/admin/admin-toast';
import {
  Trash2,
  Star,
  DollarSign,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Tag,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: ProductWithRelations & {
    reviews: Array<{
      id: string;
      author: string;
      rating: number;
      comment: string;
      createdAt: Date;
    }>;
  };
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const images = product.images.length > 0
    ? product.images.map((img) => img.url)
    : ['/images/hero1.png'];

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toastState, setToastState] = useState<AdminToastState | null>(null);

  const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

  const handleDeleteSuccess = (msg: string) => {
    setToastState({
      type: 'success',
      message: msg,
    });
    setTimeout(() => {
      router.push('/admin/products');
      router.refresh();
    }, 1200);
  };

  return (
    <div className="space-y-6 font-admin text-black dark:text-white transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/products')}
            className="h-8 w-8 rounded-lg border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold font-admin uppercase tracking-tight text-black dark:text-white">
              {product.title}
            </h1>
            <p className="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
              Category: <span className="font-semibold text-black dark:text-white">{product.category.name}</span> •
              Dress Style: <span className="font-semibold text-black dark:text-white">{product.dressStyle}</span> • Slug:{' '}
              <span className="font-mono text-black dark:text-white">/{product.slug}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            size="sm"
            disabled={isPending}
            variant="outline"
            className="h-8.5 gap-1.5 text-xs font-semibold rounded-[62px] border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-5 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Product
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-black flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-xs text-black/40 dark:text-zinc-500 font-semibold">Base Price</p>
              <p className="text-xl font-extrabold text-black dark:text-white">${product.basePrice.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-black flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-xs text-black/40 dark:text-zinc-500 font-semibold">Total Stock</p>
              <p className="text-xl font-extrabold text-black dark:text-white">{totalStock.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-black flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-xs text-black/40 dark:text-zinc-500 font-semibold">Variants Active</p>
              <p className="text-xl font-extrabold text-black dark:text-white">{product.variants.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-black flex items-center justify-center shrink-0">
              <Tag className="h-5 w-5 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-xs text-black/40 dark:text-zinc-500 font-semibold">Discount</p>
              <p className="text-xl font-extrabold text-black dark:text-white">{product.discountPercentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Gallery & Specification Details */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative h-80 w-full overflow-hidden rounded-[20px] bg-[#F0F0F0] dark:bg-black border border-black/10 dark:border-zinc-800">
            <Image
              src={images[activeImgIndex]}
              alt={product.title}
              fill
              className="object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur flex items-center justify-center shadow-md text-black dark:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur flex items-center justify-center shadow-md text-black dark:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative h-16 w-16 overflow-hidden rounded-[12px] border shrink-0 transition-all ${
                  activeImgIndex === idx
                    ? 'border-black dark:border-white ring-2 ring-black dark:ring-white'
                    : 'border-black/10 dark:border-zinc-800 opacity-60'
                }`}
              >
                <Image src={img} alt="Thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Specifications & Variants Matrix */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-black dark:text-white pb-2 border-b border-black/10 dark:border-zinc-800">
              Product Description
            </h2>
            <p className="text-xs text-black/70 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </Card>

          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white">Active Variants ({product.variants.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/10 dark:border-zinc-800 text-black/40 dark:text-zinc-500 font-semibold">
                  <tr>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Color</th>
                    <th className="pb-2">Price Offset</th>
                    <th className="pb-2 text-right">In Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
                  {product.variants.map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 font-mono text-black dark:text-white font-bold">{v.sku}</td>
                      <td className="py-2.5 font-medium">{v.size}</td>
                      <td className="py-2.5 flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/20 dark:border-zinc-700 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span>{v.colorName}</span>
                      </td>
                      <td className="py-2.5">${v.priceOffset.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-black dark:text-white">{v.stockQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Customer Reviews */}
      <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-zinc-800">
          <h2 className="font-bold text-base text-black dark:text-white">Customer Reviews ({product.reviews.length})</h2>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
            <Star className="h-4 w-4 fill-current" />
            <span>{product.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-xs text-black/40 dark:text-zinc-500 text-center py-6">
            No customer reviews submitted yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-black/50 space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-black dark:text-white">{rev.author}</span>
                  <span className="text-[10px] text-black/40 dark:text-zinc-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-black/70 dark:text-zinc-300">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* On-Screen Product Deletion & Archive Modal */}
      <ProductDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        product={{
          id: product.id,
          name: product.title,
          sku: product.variants[0]?.sku,
          imageUrl: images[0],
          price: product.basePrice,
        }}
        onDeleted={handleDeleteSuccess}
      />

      {/* On-Screen Toast Notifications */}
      <AdminToast
        toast={toastState}
        onDismiss={() => setToastState(null)}
      />
    </div>
  );
}