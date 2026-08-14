// actions/review.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  userId: z.string().optional(),
  author: z.string().min(2, 'Name must be at least 2 characters'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export interface ReviewResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

/**
 * Fetch all reviews for a specific product
 */
export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    console.error('[ACTIONS_GET_REVIEWS_ERROR]:', error);
    return {
      success: false,
      error: 'Failed to retrieve customer reviews.',
    };
  }
}

/**
 * Creates a review and atomically updates the product's overall rating
 */
export async function createProductReview(input: CreateReviewInput): Promise<ReviewResponse> {
  try {
    const validated = createReviewSchema.parse(input);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Insert review
      const review = await tx.review.create({
        data: {
          productId: validated.productId,
          userId: validated.userId || null,
          author: validated.author.trim(),
          rating: validated.rating,
          comment: validated.comment.trim(),
        },
      });

      // 2. Recalculate average rating & review count for the product
      const reviewStats = await tx.review.aggregate({
        where: { productId: validated.productId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const updatedRating = Math.round((reviewStats._avg.rating || validated.rating) * 10) / 10;
      const updatedCount = reviewStats._count.id || 1;

      // 3. Update the Product model
      await tx.product.update({
        where: { id: validated.productId },
        data: {
          rating: updatedRating,
          reviewCount: updatedCount,
        },
      });

      return review;
    });

    // 4. Revalidate cache on affected routes
    revalidatePath(`/product/${validated.productId}`);
    revalidatePath(`/admin/products/${validated.productId}`);
    revalidatePath('/shop');
    revalidatePath('/');

    return {
      success: true,
      message: 'Review submitted successfully.',
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }

    console.error('[ACTIONS_CREATE_REVIEW_ERROR]:', error);
    return {
      success: false,
      error: 'Failed to submit review. Please try again.',
    };
  }
}

/**
 * Deletes a review and updates product metrics
 */
export async function deleteProductReview(reviewId: string, productId: string): Promise<ReviewResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      const reviewStats = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : 0,
          reviewCount: reviewStats._count.id || 0,
        },
      });
    });

    revalidatePath(`/product/${productId}`);
    revalidatePath(`/admin/products/${productId}`);

    return {
      success: true,
      message: 'Review deleted successfully.',
    };
  } catch (error) {
    console.error('[ACTIONS_DELETE_REVIEW_ERROR]:', error);
    return {
      success: false,
      error: 'Failed to delete review.',
    };
  }
}