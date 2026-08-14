// lib/admin-auth.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export interface AdminAuthSession {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: Role;
}

/**
 * Checks if an email is in the admin whitelist environment variable
 */
function isWhitelistedAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase());
}

/**
 * Validates the current Clerk session against the PostgreSQL database.
 * Auto-promotes whitelisted admin emails.
 * Throws an error if unauthenticated or not an ADMIN.
 */
export async function verifyAdmin(): Promise<AdminAuthSession> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error('UNAUTHORIZED: User session not found.');
  }

  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const isWhitelisted = isWhitelistedAdminEmail(primaryEmail);

  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: primaryEmail,
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        imageUrl: clerkUser.imageUrl,
        role: isWhitelisted ? Role.ADMIN : Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  } else if (isWhitelisted && dbUser.role !== Role.ADMIN) {
    // Automatically elevate if email is added to whitelist
    dbUser = await prisma.user.update({
      where: { id: userId },
      data: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  if (dbUser.role !== Role.ADMIN) {
    throw new Error('FORBIDDEN: Admin privileges required.');
  }

  return {
    id: dbUser.id,
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  };
}

/**
 * Non-throwing boolean check for conditional UI rendering
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    await verifyAdmin();
    return true;
  } catch {
    return false;
  }
}