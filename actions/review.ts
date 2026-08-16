// actions/review.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma, withDbRetry } from '@/lib/prisma';
import { createReviewSchema, CreateReviewInput } from '@/schemas/review';
import { currentUser } from '@clerk/nextjs/server';

export interface RatingBreakdownItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewAggregateStats {
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdownItem[];
}

export interface ReviewWithUserData {
  id: string;
  productId: string;
  userId: string | null;
  author: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isVerified: boolean;
  user: {
    name: string | null;
    imageUrl: string | null;
  } | null;
}

export interface ProductReviewsResult {
  success: boolean;
  reviews: ReviewWithUserData[];
  stats: ReviewAggregateStats;
  error?: string;
}

export interface ReviewActionResponse {
  success: boolean;
  message?: string;
  data?: ReviewWithUserData;
  error?: string;
}

/**
 * Detects Next.js dynamic server execution errors to avoid swallowing SSR bailouts
 */
function isDynamicServerError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return (
    ('digest' in err && (err as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') ||
    ('message' in err &&
      typeof (err as { message?: string }).message === 'string' &&
      (err as { message: string }).message.includes('Dynamic server usage'))
  );
}

/**
 * Fetches all reviews and computes the statistical breakdown for a product
 */
export async function getProductReviews(productId: string): Promise<ProductReviewsResult> {
  try {
    const cleanProductId = productId.trim();

    return await withDbRetry(async () => {
      // 1. Fetch reviews with user relation
      const [reviewsRaw, productRecord, deliveredOrderCount] = await Promise.all([
        prisma.review.findMany({
          where: { productId: cleanProductId },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        }),
        prisma.product.findUnique({
          where: { id: cleanProductId },
          select: { id: true, slug: true },
        }),
        prisma.orderItem.count({
          where: {
            variant: { productId: cleanProductId },
            order: { status: 'DELIVERED' },
          },
        }),
      ]);

      const totalReviews = reviewsRaw.length;
      const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let ratingSum = 0;

      const formattedReviews: ReviewWithUserData[] = reviewsRaw.map((rev) => {
        const star = Math.min(5, Math.max(1, rev.rating));
        ratingCounts[star] = (ratingCounts[star] || 0) + 1;
        ratingSum += star;

        return {
          id: rev.id,
          productId: rev.productId,
          userId: rev.userId,
          author: rev.author,
          rating: rev.rating,
          comment: rev.comment,
          createdAt: rev.createdAt,
          isVerified: Boolean(rev.userId && deliveredOrderCount > 0),
          user: rev.user,
        };
      });

      const averageRating = totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

      const breakdown: RatingBreakdownItem[] = [5, 4, 3, 2, 1].map((stars) => {
        const count = ratingCounts[stars] || 0;
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        return { stars, count, percentage };
      });

      return {
        success: true,
        reviews: formattedReviews,
        stats: {
          averageRating,
          totalReviews,
          breakdown,
        },
      };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_GET_PRODUCT_REVIEWS_ERROR]:', error);
    return {
      success: false,
      reviews: [],
      stats: {
        averageRating: 0,
        totalReviews: 0,
        breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percentage: 0 })),
      },
      error: 'Failed to load product reviews.',
    };
  }
}

/**
 * Creates a review and atomically recalculates the parent product's rating and review count
 */
export async function createProductReview(input: CreateReviewInput): Promise<ReviewActionResponse> {
  try {
    const validated = createReviewSchema.parse(input);
    const authUser = await currentUser().catch(() => null);

    const verifiedUserId = authUser?.id || validated.userId || null;
    const authorName = authUser
      ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || validated.author
      : validated.author;

    return await withDbRetry(async () => {
      const transactionResult = await prisma.$transaction(async (tx) => {
        // 1. Create the new review entry
        const newReview = await tx.review.create({
          data: {
            productId: validated.productId,
            userId: verifiedUserId,
            author: authorName,
            rating: validated.rating,
            comment: validated.comment,
          },
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        });

        // 2. Aggregate average rating and total review count
        const aggregateStats = await tx.review.aggregate({
          where: { productId: validated.productId },
          _avg: { rating: true },
          _count: { id: true },
        });

        const calculatedAvg = aggregateStats._avg.rating ?? validated.rating;
        const roundedRating = Math.round(calculatedAvg * 10) / 10;
        const totalCount = aggregateStats._count.id ?? 1;

        // 3. Update the parent Product record
        const updatedProduct = await tx.product.update({
          where: { id: validated.productId },
          data: {
            rating: roundedRating,
            reviewCount: totalCount,
          },
          select: {
            id: true,
            slug: true,
          },
        });

        // 4. Check if user has purchased the item for verified badge
        let isVerifiedBuyer = false;
        if (verifiedUserId) {
          const purchaseCount = await tx.orderItem.count({
            where: {
              variant: { productId: validated.productId },
              order: {
                userId: verifiedUserId,
                status: 'DELIVERED',
              },
            },
          });
          isVerifiedBuyer = purchaseCount > 0;
        }

        return {
          review: {
            ...newReview,
            isVerified: isVerifiedBuyer,
          },
          product: updatedProduct,
        };
      });

      // 5. Trigger Next.js on-demand cache revalidation
      revalidatePath(`/product/${transactionResult.product.id}`);
      revalidatePath(`/product/${transactionResult.product.slug}`);
      revalidatePath(`/admin/products/${transactionResult.product.id}`);
      revalidatePath('/shop');
      revalidatePath('/');

      return {
        success: true,
        message: 'Your review has been published successfully.',
        data: transactionResult.review,
      };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_CREATE_PRODUCT_REVIEW_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit review.',
    };
  }
}

/**
 * Deletes a review and updates the product's aggregate metrics atomically
 */
export async function deleteProductReview(
  reviewId: string,
  productId: string
): Promise<ReviewActionResponse> {
  try {
    return await withDbRetry(async () => {
      const targetProduct = await prisma.$transaction(async (tx) => {
        // 1. Delete review record
        await tx.review.delete({
          where: { id: reviewId },
        });

        // 2. Aggregate updated stats
        const aggregateStats = await tx.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { id: true },
        });

        const newRating = aggregateStats._avg.rating
          ? Math.round(aggregateStats._avg.rating * 10) / 10
          : 0;
        const newCount = aggregateStats._count.id ?? 0;

        // 3. Update Product model
        return await tx.product.update({
          where: { id: productId },
          data: {
            rating: newRating,
            reviewCount: newCount,
          },
          select: {
            id: true,
            slug: true,
          },
        });
      });

      revalidatePath(`/product/${targetProduct.id}`);
      revalidatePath(`/product/${targetProduct.slug}`);
      revalidatePath(`/admin/products/${targetProduct.id}`);
      revalidatePath('/shop');
      revalidatePath('/');

      return {
        success: true,
        message: 'Review removed successfully.',
      };
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('[ACTIONS_DELETE_PRODUCT_REVIEW_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete review.',
    };
  }
}