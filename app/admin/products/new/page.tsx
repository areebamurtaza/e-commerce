// app/admin/products/new/page.tsx
import { getAdminCategories } from '@/actions/product';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  const result = await getAdminCategories();
  const categories = result.success ? result.categories : [];

  return <ProductForm categories={categories} />;
}