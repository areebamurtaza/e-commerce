// schemas/checkout.ts
import { z } from 'zod';

export const checkoutFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  phone: z.string().min(7, 'Please enter a valid contact number'),
  paymentMethod: z.enum(['CARD', 'PAYPAL', 'COD']),
  saveInfo: z.boolean(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;