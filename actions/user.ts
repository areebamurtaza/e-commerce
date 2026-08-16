// actions/user.ts
'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Address } from '@prisma/client';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const addressSchema = z.object({
  label: z.string().trim().min(1, 'Address label is required (e.g. Home, Office)'),
  street: z.string().trim().min(5, 'Street address must be at least 5 characters'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State / Province is required'),
  postalCode: z.string().trim().min(2, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * Retrieves all saved shipping addresses for the authenticated user
 */
export async function getUserAddresses(): Promise<ActionResponse<Address[]>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, data: [], error: 'Authentication required.' };
    }

    return await withDbRetry(async () => {
      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      return { success: true, data: addresses };
    });
  } catch (error) {
    console.error('[ACTIONS_GET_USER_ADDRESSES_ERROR]:', error);
    return { success: false, data: [], error: 'Failed to retrieve saved addresses.' };
  }
}

/**
 * Adds a new address to the user's account
 */
export async function addUserAddress(input: AddressFormValues): Promise<ActionResponse<Address>> {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    const validated = addressSchema.parse(input);

    return await withDbRetry(async () => {
      const userRecord = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: clerkUser?.primaryEmailAddress?.emailAddress || `${userId}@clerk.user`,
          name: clerkUser?.fullName || clerkUser?.firstName || 'Customer',
        },
      });

      const newAddress = await prisma.$transaction(async (tx) => {
        if (validated.isDefault) {
          await tx.address.updateMany({
            where: { userId: userRecord.id },
            data: { isDefault: false },
          });
        }

        const count = await tx.address.count({ where: { userId: userRecord.id } });
        const shouldBeDefault = validated.isDefault || count === 0;

        return await tx.address.create({
          data: {
            userId: userRecord.id,
            label: validated.label,
            street: validated.street,
            city: validated.city,
            state: validated.state,
            postalCode: validated.postalCode,
            country: validated.country,
            isDefault: shouldBeDefault,
          },
        });
      });

      revalidatePath('/account');
      return { success: true, data: newAddress, message: 'Address saved successfully.' };
    });
  } catch (error) {
    console.error('[ACTIONS_ADD_USER_ADDRESS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add address.',
    };
  }
}

/**
 * Sets a specific address as the primary default
 */
export async function setDefaultUserAddress(addressId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    return await withDbRetry(async () => {
      await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        }),
        prisma.address.update({
          where: { id: addressId, userId },
          data: { isDefault: true },
        }),
      ]);

      revalidatePath('/account');
      return { success: true, message: 'Default address updated.' };
    });
  } catch (error) {
    console.error('[ACTIONS_SET_DEFAULT_ADDRESS_ERROR]:', error);
    return { success: false, error: 'Failed to set default address.' };
  }
}

/**
 * Removes a saved address
 */
export async function deleteUserAddress(addressId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    return await withDbRetry(async () => {
      await prisma.address.delete({
        where: { id: addressId, userId },
      });

      revalidatePath('/account');
      return { success: true, message: 'Address deleted.' };
    });
  } catch (error) {
    console.error('[ACTIONS_DELETE_USER_ADDRESS_ERROR]:', error);
    return { success: false, error: 'Failed to delete address.' };
  }
}

/**
 * Updates user profile name
 */
export async function updateUserProfile({
  fullName,
}: {
  fullName: string;
}): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    const cleanName = fullName.trim();
    if (cleanName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }

    return await withDbRetry(async () => {
      await prisma.user.upsert({
        where: { id: userId },
        update: { name: cleanName },
        create: {
          id: userId,
          email: clerkUser?.primaryEmailAddress?.emailAddress || `${userId}@clerk.user`,
          name: cleanName,
        },
      });

      revalidatePath('/account');
      return { success: true, message: 'Profile updated successfully.' };
    });
  } catch (error) {
    console.error('[ACTIONS_UPDATE_USER_PROFILE_ERROR]:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}