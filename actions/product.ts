// actions/product.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { productFormSchema, ProductFormValues } from '@/schemas/product';
import { DressStyle, Prisma } from '@prisma/client';

export interface GetProductsParams {
  query?: string;
  category?: string;
  gender?: string;
  dressStyle?: DressStyle;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'popular' | 'newest';
  page?: number;
  limit?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
  };
}>;

export interface GetProductsResult {
  success: boolean;
  data?: {
    products: ProductWithRelations[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface AdminProductsFilterParams {
  search?: string;
  status?: 'All' | 'Active' | 'Out Of Stock';
  category?: string;
  page?: number;
  limit?: number;
}

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  categoryId: string;
  dressStyle: DressStyle;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  status: 'Active' | 'Out Of Stock';
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: Date;
}

export interface AdminProductsResult {
  success: boolean;
  products: AdminProductItem[];
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
  error?: string;
}

/**
 * Resilient Database retry wrapper for serverless cold starts
 */
async function withDbRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) throw error;
      console.warn(`[DB_RETRY]: Connection attempt ${attempts} failed. Retrying in 1.5s...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw new Error('Database operation exceeded maximum retry attempts.');
}

/* ==========================================================================
   STOREFRONT READ QUERIES
   ========================================================================== */

export async function getProducts(params: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    const {
      query,
      category,
      gender,
      dressStyle,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      isFeatured,
      isNewArrival,
    } = params;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ProductWhereInput = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    if (query && query.trim() !== '') {
      const cleanQuery = query.trim();
      where.OR = [
        { title: { contains: cleanQuery, mode: 'insensitive' } },
        { description: { contains: cleanQuery, mode: 'insensitive' } },
      ];
    }

    const targetCategory = category || gender;
    if (targetCategory && targetCategory.trim() !== '') {
      const cleanCategory = targetCategory.trim().toLowerCase();
      where.category = {
        OR: [
          { slug: { equals: cleanCategory, mode: 'insensitive' } },
          { name: { equals: cleanCategory, mode: 'insensitive' } },
        ],
      };
    }

    if (dressStyle) {
      where.dressStyle = dressStyle;
    }

    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
    if (sort === 'price-desc') orderBy = { basePrice: 'desc' };
    if (sort === 'popular') orderBy = { rating: 'desc' };

    const [products, total] = await withDbRetry(async () => {
      return await Promise.all([
        prisma.product.findMany({
          where,
          take: safeLimit,
          skip,
          orderBy,
          include: {
            category: true,
            images: { orderBy: { isPrimary: 'desc' } },
            variants: { orderBy: { size: 'asc' } },
          },
        }),
        prisma.product.count({ where }),
      ]);
    });

    return {
      success: true,
      data: {
        products,
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        },
      },
    };
  } catch (error) {
    console.error('[ACTIONS_GET_PRODUCTS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed.',
    };
  }
}

export async function getProductBySlugOrId(identifier: string) {
  try {
    const cleanId = identifier.trim();

    const product = await withDbRetry(async () => {
      return await prisma.product.findFirst({
        where: {
          OR: [{ id: cleanId }, { slug: cleanId }],
        },
        include: {
          category: true,
          images: { orderBy: { isPrimary: 'desc' } },
          variants: { orderBy: { size: 'asc' } },
          reviews: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error('[ACTIONS_GET_PRODUCT_DETAIL_ERROR]:', error);
    return { success: false, error: 'Failed to load product details.' };
  }
}

/* ==========================================================================
   ADMIN MANAGEMENT ACTIONS
   ========================================================================== */

/**
 * Fetches all categories for admin forms and filter controls
 */
export async function getAdminCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
    return { success: true, categories };
  } catch (error) {
    console.error('[ACTIONS_GET_CATEGORIES_ERROR]:', error);
    return { success: false, categories: [] };
  }
}

/**
 * Retrieves paginated products with variant inventory aggregations and KPIs
 */
export async function getAdminProducts(
  params: AdminProductsFilterParams = {}
): Promise<AdminProductsResult> {
  try {
    await verifyAdmin();

    const {
      search = '',
      status = 'All',
      category = 'All',
      page = 1,
      limit = 10,
    } = params;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ProductWhereInput = {
      AND: [
        category !== 'All'
          ? {
              category: {
                OR: [{ id: category }, { name: category }, { slug: category }],
              },
            }
          : {},
        search.trim()
          ? {
              OR: [
                { title: { contains: search.trim(), mode: 'insensitive' } },
                { slug: { contains: search.trim(), mode: 'insensitive' } },
                {
                  variants: {
                    some: {
                      sku: { contains: search.trim(), mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [allProductsRaw, categoriesCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { isPrimary: 'desc' } },
          variants: true,
        },
      }),
      prisma.category.count(),
    ]);

    // Map and calculate aggregated stock quantities
    let totalStockUnits = 0;
    let outOfStockCount = 0;

    const mappedProducts: AdminProductItem[] = allProductsRaw.map((p) => {
      const stockSum = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
      const isOutOfStock = stockSum <= 0;
      const primaryImage = p.images[0]?.url || '/images/hero1.png';
      const defaultSku = p.variants[0]?.sku || 'NO-SKU';

      totalStockUnits += stockSum;
      if (isOutOfStock) outOfStockCount++;

      return {
        id: p.id,
        name: p.title,
        slug: p.slug,
        price: p.basePrice,
        category: p.category.name,
        categoryId: p.category.id,
        dressStyle: p.dressStyle,
        stock: stockSum,
        sku: defaultSku,
        rating: p.rating,
        reviewCount: p.reviewCount,
        imageUrl: primaryImage,
        status: isOutOfStock ? 'Out Of Stock' : 'Active',
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        createdAt: p.createdAt,
      };
    });

    // Apply client status filter on computed variant stock sums
    const filteredProducts =
      status === 'All'
        ? mappedProducts
        : mappedProducts.filter((p) => p.status === status);

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(skip, skip + safeLimit);

    return {
      success: true,
      products: paginatedProducts,
      kpi: {
        totalProducts: mappedProducts.length,
        totalStockUnits,
        outOfStockCount,
        totalCategories: categoriesCount,
      },
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  } catch (error) {
    console.error('[ACTIONS_GET_ADMIN_PRODUCTS_ERROR]:', error);
    return {
      success: false,
      products: [],
      kpi: { totalProducts: 0, totalStockUnits: 0, outOfStockCount: 0, totalCategories: 0 },
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      error: error instanceof Error ? error.message : 'Failed to retrieve products.',
    };
  }
}

/**
 * Creates a new product with full variant matrix & image associations
 */
export async function createProduct(rawData: ProductFormValues) {
  try {
    await verifyAdmin();

    const validated = productFormSchema.parse(rawData);

    // Verify slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return { success: false, error: 'A product with this URL slug already exists.' };
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      return await tx.product.create({
        data: {
          title: validated.title,
          slug: validated.slug,
          description: validated.description,
          basePrice: validated.basePrice,
          discountPercentage: validated.discountPercentage,
          dressStyle: validated.dressStyle,
          isFeatured: validated.isFeatured,
          isNewArrival: validated.isNewArrival,
          categoryId: validated.categoryId,
          images: {
            create: validated.images.map((img) => ({
              url: img.url,
              isPrimary: img.isPrimary,
            })),
          },
          variants: {
            create: validated.variants.map((v) => ({
              sku: v.sku,
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              priceOffset: v.priceOffset,
              stockQuantity: v.stockQuantity,
            })),
          },
        },
      });
    });

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');

    return { success: true, data: newProduct };
  } catch (error) {
    console.error('[ACTIONS_CREATE_PRODUCT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product.',
    };
  }
}

/**
 * Safely deletes a product and prevents deleting if associated with past customer orders
 */
export async function deleteProduct(id: string) {
  try {
    await verifyAdmin();

    // Check if any variant is referenced in order items
    const orderItemCount = await prisma.orderItem.count({
      where: { variant: { productId: id } },
    });

    if (orderItemCount > 0) {
      return {
        success: false,
        error: 'Cannot delete this product because it is linked to existing customer orders.',
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');

    return { success: true, message: 'Product deleted successfully.' };
  } catch (error) {
    console.error('[ACTIONS_DELETE_PRODUCT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product.',
    };
  }
}