// actions/product.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma, withDbRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import {
  productFormSchema,
  ProductFormValues,
  ProductImageFormValues,
  ProductVariantFormValues,
} from '@/schemas/product';
import { DressStyle, Gender, Prisma } from '@prisma/client';
import { ALL_TAXONOMY_CATEGORIES } from '@/constants/shop';
import { DB_TIMEOUT_CONFIG, PRISMA_TX_OPTIONS } from '@/lib/constants';

// ============================================================================
// DOMAIN TYPES & INTERFACES
// ============================================================================

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
  };
}>;

export type ProductDetailWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
    reviews: true;
  };
}>;

export interface GetProductsParams {
  query?: string;
  category?: string;
  type?: string;
  gender?: string | Gender;
  dressStyle?: DressStyle;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'popular' | 'newest';
  page?: number;
  limit?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  hasDiscount?: boolean;
  discount?: boolean | string;
}

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
  gender: Gender;
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

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function isDynamicServerError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return (
    ('digest' in err && (err as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') ||
    ('message' in err &&
      typeof (err as { message?: string }).message === 'string' &&
      (err as { message: string }).message.includes('Dynamic server usage'))
  );
}

// ============================================================================
// PUBLIC STOREFRONT QUERIES
// ============================================================================

export async function getProducts(params: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    const {
      query,
      category,
      type,
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

    const andConditions: Prisma.ProductWhereInput[] = [];

    if (minPrice !== undefined || maxPrice !== undefined) {
      andConditions.push({
        basePrice: {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        },
      });
    }

    if (query && query.trim() !== '') {
      const cleanQuery = query.trim();
      andConditions.push({
        OR: [
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { description: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      });
    }

    if (gender && String(gender).trim() !== '') {
      const rawGender = String(gender).trim().toUpperCase();
      if (['MEN', 'WOMEN', 'KIDS', 'UNISEX'].includes(rawGender)) {
        andConditions.push({
          OR: [{ gender: rawGender as Gender }, { gender: Gender.UNISEX }],
        });
      }
    }

    const targetCategory = category || type;
    if (targetCategory && targetCategory.trim() !== '') {
      const cleanCategory = targetCategory.trim().toLowerCase();
      if (['men', 'women', 'kids'].includes(cleanCategory) && !gender) {
        const gEnum = cleanCategory.toUpperCase() as Gender;
        andConditions.push({
          OR: [{ gender: gEnum }, { gender: Gender.UNISEX }],
        });
      } else {
        andConditions.push({
          category: {
            OR: [
              { slug: { equals: cleanCategory, mode: 'insensitive' } },
              { name: { equals: cleanCategory, mode: 'insensitive' } },
              { slug: { contains: cleanCategory, mode: 'insensitive' } },
              { name: { contains: cleanCategory, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    if (dressStyle) {
      andConditions.push({ dressStyle });
    }

    if (isFeatured !== undefined) andConditions.push({ isFeatured });
    if (isNewArrival !== undefined) andConditions.push({ isNewArrival });
    if (
      params.hasDiscount === true ||
      params.discount === true ||
      params.discount === 'true' ||
      params.discount === '1'
    ) {
      andConditions.push({ discountPercentage: { gt: 0 } });
    }

    const where: Prisma.ProductWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

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
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_GET_PRODUCTS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed.',
    };
  }
}

export async function getProductBySlugOrId(
  identifier: string
): Promise<ActionResponse<ProductDetailWithRelations>> {
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

    if (!product) return { success: false, error: 'Product not found.' };
    return { success: true, data: product };
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_GET_PRODUCT_DETAIL_ERROR]:', error);
    return { success: false, error: 'Failed to load product details.' };
  }
}

// ============================================================================
// ADMIN INVENTORY & TAXONOMY QUERIES
// ============================================================================

export async function getAdminCategories() {
  try {
    return await withDbRetry(async () => {
      await Promise.all(
        ALL_TAXONOMY_CATEGORIES.map(async (cat) => {
          return prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: { name: cat.name, slug: cat.slug },
          });
        })
      );

      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      });

      return { success: true, categories };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_GET_CATEGORIES_ERROR]:', error);
    return { success: false, categories: [] };
  }
}

export async function getAdminProducts(
  params: AdminProductsFilterParams = {}
): Promise<AdminProductsResult> {
  try {
    await verifyAdmin();

    const { search = '', status = 'All', category = 'All', page = 1, limit = 10 } = params;
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    return await withDbRetry(async () => {
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
          gender: p.gender,
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
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
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

// ============================================================================
// ADMIN PRODUCT MUTATIONS (OPTIMIZED CONCURRENT TRANSACTIONS)
// ============================================================================

export async function createProduct(
  rawData: ProductFormValues
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    await verifyAdmin();

    const validated = productFormSchema.parse(rawData);

    return await withDbRetry(async () => {
      const existing = await prisma.product.findUnique({
        where: { slug: validated.slug },
      });

      if (existing) {
        return { success: false, error: 'A product with this URL slug already exists.' };
      }

      const newProduct = await prisma.$transaction(
        async (tx) => {
          return await tx.product.create({
            data: {
              title: validated.title,
              slug: validated.slug,
              description: validated.description,
              basePrice: validated.basePrice,
              discountPercentage: validated.discountPercentage,
              gender: validated.gender as Gender,
              dressStyle: validated.dressStyle,
              isFeatured: validated.isFeatured,
              isNewArrival: validated.isNewArrival,
              categoryId: validated.categoryId,
              images: {
                create: validated.images.map((img: ProductImageFormValues) => ({
                  url: img.url,
                  isPrimary: img.isPrimary,
                })),
              },
              variants: {
                create: validated.variants.map((v: ProductVariantFormValues) => ({
                  sku: v.sku,
                  size: v.size,
                  colorName: v.colorName,
                  colorHex: v.colorHex,
                  priceOffset: v.priceOffset,
                  stockQuantity: v.stockQuantity,
                })),
              },
            },
            include: {
              category: true,
              images: { orderBy: { isPrimary: 'desc' } },
              variants: { orderBy: { size: 'asc' } },
            },
          });
        },
        PRISMA_TX_OPTIONS
      );

      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/');

      return { success: true, data: newProduct, message: 'Product created successfully.' };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_CREATE_PRODUCT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product.',
    };
  }
}

export async function updateProduct(
  productId: string,
  rawData: ProductFormValues
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    await verifyAdmin();

    const validated = productFormSchema.parse(rawData);

    return await withDbRetry(async () => {
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true, images: true },
      });

      if (!existingProduct) {
        return { success: false, error: `Product with ID ${productId} not found.` };
      }

      if (validated.slug !== existingProduct.slug) {
        const slugCollision = await prisma.product.findFirst({
          where: {
            slug: validated.slug,
            NOT: { id: productId },
          },
        });

        if (slugCollision) {
          return {
            success: false,
            error: `The URL slug "${validated.slug}" is already used by another product.`,
          };
        }
      }

      // Execute transaction with 20-second timeout to handle latency
      const updatedProduct = await prisma.$transaction(
        async (tx) => {
          // 1. Update Product Scalar Fields
          await tx.product.update({
            where: { id: productId },
            data: {
              title: validated.title,
              slug: validated.slug,
              description: validated.description,
              basePrice: validated.basePrice,
              discountPercentage: validated.discountPercentage,
              gender: validated.gender as Gender,
              dressStyle: validated.dressStyle,
              isFeatured: validated.isFeatured,
              isNewArrival: validated.isNewArrival,
              categoryId: validated.categoryId,
            },
          });

          // 2. Reconcile Gallery Images
          await tx.productImage.deleteMany({
            where: { productId },
          });

          await tx.productImage.createMany({
            data: validated.images.map((img) => ({
              productId,
              url: img.url,
              isPrimary: img.isPrimary,
            })),
          });

          // 3. Reconcile Variants
          const incomingVariantIds = validated.variants
            .map((v) => v.id)
            .filter((id): id is string => Boolean(id));

          // Prune removed variants safely
          await Promise.all([
            tx.productVariant.deleteMany({
              where: {
                productId,
                id: { notIn: incomingVariantIds },
                orderItems: { none: {} },
              },
            }),
            tx.productVariant.updateMany({
              where: {
                productId,
                id: { notIn: incomingVariantIds },
                orderItems: { some: {} },
              },
              data: {
                stockQuantity: 0,
              },
            }),
          ]);

          // Concurrently upsert/create all variants in parallel
          await Promise.all(
            validated.variants.map((variant) => {
              if (variant.id) {
                return tx.productVariant.update({
                  where: { id: variant.id },
                  data: {
                    sku: variant.sku,
                    size: variant.size,
                    colorName: variant.colorName,
                    colorHex: variant.colorHex,
                    priceOffset: variant.priceOffset,
                    stockQuantity: variant.stockQuantity,
                  },
                });
              } else {
                return tx.productVariant.create({
                  data: {
                    productId,
                    sku: variant.sku,
                    size: variant.size,
                    colorName: variant.colorName,
                    colorHex: variant.colorHex,
                    priceOffset: variant.priceOffset,
                    stockQuantity: variant.stockQuantity,
                  },
                });
              }
            })
          );

          // 4. Return refreshed relational product
          return await tx.product.findUniqueOrThrow({
            where: { id: productId },
            include: {
              category: true,
              images: { orderBy: { isPrimary: 'desc' } },
              variants: { orderBy: { size: 'asc' } },
            },
          });
        },
        PRISMA_TX_OPTIONS
      );

      revalidatePath('/admin/products');
      revalidatePath(`/admin/products/${productId}`);
      revalidatePath(`/admin/products/${productId}/edit`);
      revalidatePath(`/product/${productId}`);
      revalidatePath(`/product/${existingProduct.slug}`);
      revalidatePath(`/product/${validated.slug}`);
      revalidatePath('/shop');
      revalidatePath('/');

      return {
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully.',
      };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_UPDATE_PRODUCT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product.',
    };
  }
}

export interface DeleteProductOptions {
  force?: boolean;
}

export async function deleteProduct(
  id: string,
  options: DeleteProductOptions = {}
): Promise<ActionResponse<{ linkedOrders?: boolean; orderCount?: number }>> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      const orderItemCount = await prisma.orderItem.count({
        where: { variant: { productId: id } },
      });

      if (orderItemCount > 0 && !options.force) {
        return {
          success: false,
          data: { linkedOrders: true, orderCount: orderItemCount },
          error: `Cannot delete directly because this product is referenced in ${orderItemCount} customer order record(s). Choose "Archive & Hide" to preserve history, or "Force Delete" to remove all test records.`,
        };
      }

      if (options.force) {
        await prisma.$transaction(
          async (tx) => {
            // 1. Delete reviews
            await tx.review.deleteMany({ where: { productId: id } });

            // 2. Query variants
            const variants = await tx.productVariant.findMany({
              where: { productId: id },
              select: { id: true },
            });
            const variantIds = variants.map((v) => v.id);

            if (variantIds.length > 0) {
              // 3. Delete order items referencing variants
              await tx.orderItem.deleteMany({
                where: { variantId: { in: variantIds } },
              });

              // 4. Delete variants
              await tx.productVariant.deleteMany({
                where: { productId: id },
              });
            }

            // 5. Delete product images
            await tx.productImage.deleteMany({
              where: { productId: id },
            });

            // 6. Delete product
            await tx.product.delete({
              where: { id },
            });
          },
          PRISMA_TX_OPTIONS
        );
      } else {
        await prisma.product.delete({
          where: { id },
        });
      }

      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/');

      return { success: true, message: 'Product deleted successfully.' };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_DELETE_PRODUCT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product.',
    };
  }
}

export async function archiveProduct(id: string): Promise<ActionResponse> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      await prisma.$transaction(
        async (tx) => {
          // Zero all variant stocks and update product flags
          await tx.productVariant.updateMany({
            where: { productId: id },
            data: { stockQuantity: 0 },
          });

          await tx.product.update({
            where: { id },
            data: {
              isFeatured: false,
              isNewArrival: false,
            },
          });
        },
        PRISMA_TX_OPTIONS
      );

      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/');

      return {
        success: true,
        message: 'Product archived successfully. Stock set to 0 and hidden from featured shop shelves.',
      };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_ARCHIVE_PRODUCT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive product.',
    };
  }
}

export interface AutocompleteProductItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountPercentage: number;
  categoryName: string;
  imageUrl: string;
}

/**
 * Fast predictive search autocomplete for navbar
 */
export async function searchProductsAutocomplete(
  query: string
): Promise<AutocompleteProductItem[]> {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { description: { contains: cleanQuery, mode: 'insensitive' } },
          { category: { name: { contains: cleanQuery, mode: 'insensitive' } } },
        ],
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        discountPercentage: true,
        category: {
          select: { name: true },
        },
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      basePrice: p.basePrice,
      discountPercentage: p.discountPercentage,
      categoryName: p.category.name,
      imageUrl: p.images[0]?.url || '/images/pd1.png',
    }));
  } catch (error) {
    console.error('[AUTOCOMPLETE_SEARCH_ERROR]:', error);
    return [];
  }
}

export interface LowStockVariantItem {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  size: string;
  colorName: string;
  stockQuantity: number;
  imageUrl: string;
}

/**
 * Admin: Fetch variants with low stock (<= threshold)
 */
export async function getLowStockVariants(
  threshold = 5
): Promise<{ success: boolean; variants: LowStockVariantItem[]; error?: string }> {
  try {
    await verifyAdmin();

    const variants = await prisma.productVariant.findMany({
      where: {
        stockQuantity: { lte: threshold },
      },
      orderBy: { stockQuantity: 'asc' },
      take: 8,
      include: {
        product: {
          select: {
            title: true,
            images: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    const formatted: LowStockVariantItem[] = variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      productTitle: v.product.title,
      sku: v.sku,
      size: v.size,
      colorName: v.colorName,
      stockQuantity: v.stockQuantity,
      imageUrl: v.product.images[0]?.url || '/images/pd1.png',
    }));

    return { success: true, variants: formatted };
  } catch (error) {
    return {
      success: false,
      variants: [],
      error: error instanceof Error ? error.message : 'Failed to fetch low stock variants.',
    };
  }
}

/**
 * Admin: Quick restock variant
 */
export async function quickRestockVariant(
  variantId: string,
  quantityToAdd = 20
): Promise<{ success: boolean; message?: string; newStock?: number; error?: string }> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      const updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: { increment: quantityToAdd },
        },
      });

      revalidatePath('/admin');
      revalidatePath('/admin/products');
      revalidatePath('/shop');

      return {
        success: true,
        message: `Restocked ${quantityToAdd} units. Current stock: ${updated.stockQuantity}.`,
        newStock: updated.stockQuantity,
      };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restock variant.',
    };
  }
}