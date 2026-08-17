// components/admin/products-table.tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { deleteProduct, AdminProductItem } from '@/actions/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  ProductDeleteDialog,
  ProductToDelete,
} from '@/components/admin/product-delete-dialog';
import { AdminToast, AdminToastState } from '@/components/admin/admin-toast';
import {
  Plus,
  Search,
  Star,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Layers,
  AlertCircle,
  FolderTree,
} from 'lucide-react';

interface ProductsTableProps {
  initialProducts: AdminProductItem[];
  kpi: {
    totalProducts: number;
    totalStockUnits: number;
    outOfStockCount: number;
    totalCategories: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
  currentSearch: string;
  currentStatus: string;
  currentCategory: string;
}

export function ProductsTable({
  initialProducts,
  kpi,
  pagination,
  categories,
  currentSearch,
  currentStatus,
  currentCategory,
}: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<ProductToDelete | null>(null);
  const [toastState, setToastState] = useState<AdminToastState | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', search);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(initialProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openDeleteDialog = (product: AdminProductItem) => {
    setProductToDelete({
      id: product.id,
      name: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
      price: product.price,
    });
  };

  const handleDeleteSuccess = (msg: string) => {
    setToastState({
      type: 'success',
      message: msg,
    });
    router.refresh();
  };

  return (
    <div className="space-y-6 font-admin text-black dark:text-white transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-admin uppercase tracking-tight text-black dark:text-white">
            PRODUCTS CATALOG
          </h1>
          <p className="text-xs text-black/60 dark:text-zinc-400 mt-1">
            Manage inventory, update stock levels, and organize store categories.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 gap-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-[62px] text-xs font-semibold px-5"
        >
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-black/60 dark:text-zinc-400">Total Products</span>
              <p className="text-2xl font-extrabold text-black dark:text-white">{kpi.totalProducts}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-zinc-800 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-black dark:text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-black/60 dark:text-zinc-400">Total In-Stock Units</span>
              <p className="text-2xl font-extrabold text-black dark:text-white">{kpi.totalStockUnits.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-zinc-800 flex items-center justify-center">
              <Layers className="h-5 w-5 text-black dark:text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-black/60 dark:text-zinc-400">Out of Stock Alert</span>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{kpi.outOfStockCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-black/60 dark:text-zinc-400">Categories</span>
              <p className="text-2xl font-extrabold text-black dark:text-white">{kpi.totalCategories}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#F0F0F0] dark:bg-zinc-800 flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-black dark:text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-[20px] border border-black/10 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <form onSubmit={handleSearchSubmit} className="relative w-64">
            <Input
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 pl-8 pr-4"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40 dark:text-zinc-500" />
          </form>

          <select
            value={currentStatus}
            onChange={(e) => updateFilters('status', e.target.value)}
            className="h-8.5 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-black dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Out Of Stock">Out Of Stock</option>
          </select>

          <select
            value={currentCategory}
            onChange={(e) => updateFilters('category', e.target.value)}
            className="h-8.5 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-black dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-black/60 dark:text-zinc-400 font-semibold">
          Showing {initialProducts.length} of {pagination.total} products
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F0F0]/60 dark:bg-black border-b border-black/10 dark:border-zinc-800 text-black dark:text-white font-bold">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === initialProducts.length && initialProducts.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded accent-black dark:accent-white cursor-pointer"
                  />
                </th>
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3">Total Stock</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
              {initialProducts.length > 0 ? (
                initialProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-black/5 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod.id)}
                        onChange={() => handleToggleSelect(prod.id)}
                        className="rounded accent-black dark:accent-white cursor-pointer"
                      />
                    </td>
                    <td className="p-3 flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-[10px] overflow-hidden bg-[#F0F0F0] dark:bg-black shrink-0 border border-black/10 dark:border-zinc-800">
                        <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-black dark:text-white block">{prod.name}</span>
                        <span className="text-[10px] text-black/40 dark:text-zinc-500 font-mono">
                          /{prod.slug}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-black dark:text-white">
                      ${prod.price.toFixed(2)}
                    </td>
                    <td className="p-3 text-black/60 dark:text-zinc-400">{prod.category}</td>
                    <td className="p-3 font-medium text-black dark:text-white">{prod.stock}</td>
                    <td className="p-3 font-mono text-black/40 dark:text-zinc-500">{prod.sku}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 font-bold text-black dark:text-white">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                        {prod.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      {prod.status === 'Active' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60">
                          Out Of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          title="View Details"
                        >
                          <Link href={`/admin/products/${prod.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => openDeleteDialog(prod)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-black/40 dark:text-zinc-500">
                    No products match your active search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-black/50 dark:text-zinc-400">
            Page <span className="font-bold text-black dark:text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-black dark:text-white">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isPending}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="h-8 w-8 p-0 rounded-lg border-black/10 dark:border-zinc-800 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isPending}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="h-8 w-8 p-0 rounded-lg border-black/10 dark:border-zinc-800 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* On-Screen Product Deletion & Archive Modal */}
      <ProductDeleteDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        product={productToDelete}
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