import { z } from 'zod';

export const CreateReviewSchema = z.object({
  productId: z.string().cuid('Invalid product identifier'),
  rating: z.number().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  content: z
    .string()
    .min(10, 'Review content must be at least 10 characters long')
    .max(1000, 'Review content cannot exceed 1000 characters'),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;