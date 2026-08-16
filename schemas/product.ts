// schemas/product.ts
import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  size: z.enum(['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'], {
    message: 'Please select a valid size',
  }),
  colorName: z.string().min(1, 'Color name is required'),
  colorHex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code (e.g. #000000)'),
  priceOffset: z.number({ message: 'Price offset must be a valid number' }),
  stockQuantity: z
    .number({ message: 'Stock quantity must be a valid number' })
    .int('Stock quantity must be a whole integer')
    .min(0, 'Stock cannot be negative'),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z
    .string()
    .min(1, 'Image URL or file is required')
    .refine(
      (val) =>
        val.startsWith('/') ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('data:image/'),
      {
        message: 'Must be a valid URL, local path (/images/...) or uploaded image file',
      }
    ),
  isPrimary: z.boolean(),
});

export const productFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(120, 'Title cannot exceed 120 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters long for storefront display'),
  basePrice: z
    .number({ message: 'Base price must be a valid number' })
    .positive('Base price must be greater than 0'),
  discountPercentage: z
    .number({ message: 'Discount percentage must be a valid number' })
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%'),
  categoryId: z.string().min(1, 'Please select a category'),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX'], {
    message: 'Please select a target department (Men, Women, Kids, Unisex)',
  }),
  dressStyle: z.enum(['CASUAL', 'FORMAL', 'PARTY', 'GYM'], {
    message: 'Please select a dress style',
  }),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  images: z
    .array(productImageSchema)
    .min(1, 'At least one product image is required'),
  variants: z
    .array(productVariantSchema)
    .min(1, 'At least one product variant (size/color) is required'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
export type ProductImageValues = z.infer<typeof productImageSchema>;