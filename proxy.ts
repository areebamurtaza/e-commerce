// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Define Public Webhook & Callback Routes (Must bypass auth validation completely)
const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)',
  '/api/webhooks/stripe(.*)',
  '/api/checkout/intent(.*)',
]);

// 2. Define Admin-only Routes (Requires Authentication + Role: ADMIN)
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// 3. Define Customer Protected Routes (Requires Authentication)
const isCustomerProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/account(.*)',
  '/orders(.*)',
]);

// 4. Validate Clerk Environment Configuration
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  typeof publishableKey === 'string' &&
  publishableKey.startsWith('pk_') &&
  publishableKey.length > 20;

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // If Clerk is not configured (e.g. initial setup / CI tests), proceed cleanly
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // A. Immediately bypass all Webhook routes for Svix & Stripe signature handlers
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  // B. Enforce RBAC for Admin Routes
  if (isAdminRoute(req)) {
    const session = await auth();

    // If not authenticated, redirect to sign-in with return URL
    if (!session.userId) {
      return session.redirectToSignIn({ returnBackUrl: req.url });
    }

    // Extract role from Clerk Public Metadata session claims
    const userRole = (session.sessionClaims?.metadata as { role?: string } | undefined)?.role ||
      (session.sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;

    if (userRole !== 'ADMIN') {
      // Redirect unauthorized customers to root homepage
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // C. Enforce Authentication for Customer Account & Orders
  if (isCustomerProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude Next.js internals, static files, and images
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webkit|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always execute for API & TRPC routes
    '/(api|trpc)(.*)',
  ],
};