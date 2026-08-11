import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;