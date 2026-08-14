// actions/user.ts
'use server';

import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { Address, User } from '@prisma/client';
import {
  addressSchema,
  profileSchema,
  AddressFormValues,
  ProfileFormValues,
} from '@/schemas/account';

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Validates the active Clerk authentication session and synchronizes
 * the user record with Neon PostgreSQL, explicitly providing the required `id`.
 */
async function getOrCreateDbUser(): Promise<User> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error('Unauthorized: Active authentication session required.');
  }

  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) {
    throw new Error('Unauthorized: User account has no verified email address.');
  }

  const fullName =
    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
    clerkUser.username ||
    'Valued Customer';

  const dbUser = await prisma.user.upsert({
    where: { email: primaryEmail },
    update: {
      name: fullName,
    },
    create: {
      id: clerkUser.id,
      email: primaryEmail,
      name: fullName,
    },
  });

  return dbUser;
}

/**
 * Updates the authenticated user's profile information.
 */
export async function updateUserProfile(
  data: ProfileFormValues
): Promise<ActionResponse<User>> {
  try {
    const validated = profileSchema.parse(data);
    const dbUser = await getOrCreateDbUser();

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: validated.fullName,
      },
    });

    revalidatePath('/account');
    return {
      success: true,
      data: updatedUser,
      message: 'Profile details updated successfully.',
    };
  } catch (error) {
    console.error('[ACTIONS_UPDATE_PROFILE_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile.',
    };
  }
}

/**
 * Retrieves all saved shipping addresses for the authenticated user.
 */
export async function getUserAddresses(): Promise<ActionResponse<Address[]>> {
  try {
    const dbUser = await getOrCreateDbUser();

    const addresses = await prisma.address.findMany({
      where: { userId: dbUser.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      success: true,
      data: addresses,
    };
  } catch (error) {
    console.error('[ACTIONS_GET_USER_ADDRESSES_ERROR]:', error);
    return {
      success: false,
      error: 'Failed to retrieve saved addresses from the database.',
    };
  }
}

/**
 * Atomically creates a new address record.
 * Unsets any prior default flag if the new address is marked as default.
 */
export async function createUserAddress(
  data: AddressFormValues
): Promise<ActionResponse<Address>> {
  try {
    const validated = addressSchema.parse(data);
    const dbUser = await getOrCreateDbUser();

    const newAddress = await prisma.$transaction(async (tx) => {
      const existingAddressCount = await tx.address.count({
        where: { userId: dbUser.id },
      });

      const isFirstAddress = existingAddressCount === 0;
      const shouldBeDefault = validated.isDefault || isFirstAddress;

      if (shouldBeDefault && !isFirstAddress) {
        await tx.address.updateMany({
          where: { userId: dbUser.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.address.create({
        data: {
          userId: dbUser.id,
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
    revalidatePath('/checkout');

    return {
      success: true,
      data: newAddress,
      message: 'Shipping address added successfully.',
    };
  } catch (error) {
    console.error('[ACTIONS_CREATE_ADDRESS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save address.',
    };
  }
}

/**
 * Sets an address as the default shipping location.
 */
export async function setDefaultUserAddress(
  addressId: string
): Promise<ActionResponse<void>> {
  try {
    const dbUser = await getOrCreateDbUser();

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: dbUser.id, isDefault: true },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: addressId, userId: dbUser.id },
        data: { isDefault: true },
      });
    });

    revalidatePath('/account');
    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Default address updated.',
    };
  } catch (error) {
    console.error('[ACTIONS_SET_DEFAULT_ADDRESS_ERROR]:', error);
    return {
      success: false,
      error: 'Failed to update default address.',
    };
  }
}

/**
 * Deletes an address record belonging to the authenticated user.
 */
export async function deleteUserAddress(
  addressId: string
): Promise<ActionResponse<void>> {
  try {
    const dbUser = await getOrCreateDbUser();

    await prisma.address.delete({
      where: {
        id: addressId,
        userId: dbUser.id,
      },
    });

    revalidatePath('/account');
    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Address removed successfully.',
    };
  } catch (error) {
    console.error('[ACTIONS_DELETE_ADDRESS_ERROR]:', error);
    return {
      success: false,
      error: 'Failed to delete address.',
    };
  }
}