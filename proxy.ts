import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/account(.*)',
  '/orders(.*)',
]);

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  typeof publishableKey === 'string' &&
  publishableKey.startsWith('pk_') &&
  publishableKey.length > 20;

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  if (isAdminRoute(req)) {
    await auth.protect();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webkit|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};