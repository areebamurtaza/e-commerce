// lib/admin-auth.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { Role } from '@prisma/client';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isWhitelistedAdminEmail(email: string): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.length === 0) return true; // Fallback if no whitelist is configured
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export interface AuthenticatedAdmin {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
}

export async function verifyAdmin(): Promise<AuthenticatedAdmin> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('Unauthorized: Unable to verify session identity.');
  }

  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() ?? '';
  const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Admin User';
  const isWhitelisted = isWhitelistedAdminEmail(primaryEmail);

  const dbUser = await withDbRetry(async () => {
    return await prisma.user.upsert({
      where: { email: primaryEmail },
      update: {
        id: userId,
        name: fullName,
        imageUrl: clerkUser.imageUrl || null,
        ...(isWhitelisted ? { role: Role.ADMIN } : {}),
      },
      create: {
        id: userId,
        email: primaryEmail,
        name: fullName,
        imageUrl: clerkUser.imageUrl || null,
        role: isWhitelisted ? Role.ADMIN : Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  });

  if (dbUser.role !== Role.ADMIN && !isWhitelisted) {
    throw new Error('Forbidden: Administrative privileges required.');
  }

  return {
    id: dbUser.id,
    clerkId: userId,
    email: dbUser.email,
    name: dbUser.name ?? fullName,
    role: dbUser.role,
  };
}