// schemas/account.ts
import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters'),
  phone: z.string().trim().optional(),
});

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(30, 'Label cannot exceed 30 characters'),
  street: z
    .string()
    .trim()
    .min(5, 'Street address must be at least 5 characters'),
  city: z
    .string()
    .trim()
    .min(2, 'City is required'),
  state: z
    .string()
    .trim()
    .min(2, 'State / Province is required'),
  postalCode: z
    .string()
    .trim()
    .min(3, 'Postal code is required'),
  country: z
    .string()
    .trim()
    .min(2, 'Country is required'),
  isDefault: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;