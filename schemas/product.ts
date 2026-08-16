// schemas/product.ts
import { z } from 'zod';
import { DressStyle, Gender } from '@prisma/client';

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Please enter a valid image URL').min(1, 'Image URL is required'),
  isPrimary: z.boolean(),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  size: z.string().min(1, 'Size is required'),
  colorName: z.string().min(1, 'Color name is required'),
  colorHex: z.string().min(4, 'Color hex is required'),
  priceOffset: z.number(),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
});

export const productFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.number().positive('Price must be greater than 0'),
  discountPercentage: z.number().min(0).max(100),
  gender: z.nativeEnum(Gender),
  dressStyle: z.nativeEnum(DressStyle),
  categoryId: z.string().min(1, 'Please select a category'),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductImageFormValues = z.infer<typeof productImageSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;