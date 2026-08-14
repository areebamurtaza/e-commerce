# SHOP.CO E-Commerce Platform — Project Handover & Context Document
**Document Version:** 1.0.0  
**Target Next Session Goal:** Implement Admin Dashboard UI, Customer Checkout UI, and Backend API Engine  
**Primary Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, React Hook Form, Zod, Prisma ORM, PostgreSQL, Redis, Stripe, Clerk / Auth.js

---

## 1. Executive Project Summary

**SHOP.CO** is a high-performance, production-grade e-commerce application. The customer-facing storefront UI is completely engineered and matches the Figma design system across viewports ($360\text{px}$ mobile to $1440\text{px}$ wide desktop).

The project is currently transitioning from static frontend prototypes to full interactive pages and REST API backend integrations.

---

## 2. Key Architectural Decisions & Mentor Guidelines

1. **Direct REST API Architecture (`app/api/*` over Server Actions for Data Fetching):**
   * *Decision:* Following senior mentor guidance, all data interactions between the frontend UI and backend services will use **Explicit REST API Route Handlers (`app/api/...`)** rather than pure internal Server Actions for catalog/cart data.
   * *Benefits:* Decouples frontend and backend, allows independent API testing via Postman/cURL, provides clear HTTP status codes (`200`, `400`, `401`, `404`, `500`), and enables future native mobile or third-party client integrations.

2. **Tailwind CSS v4 & Typographic Engine:**
   * Utilizes `@import "tailwindcss";` in `globals.css` with `@theme` token bindings.
   * Brands headers using local font `IntegralCF-Bold.woff2` (`font-integral`) and body typography with Montserrat/Satoshi (`font-satoshi`).

3. **Client State & Hydration Safety:**
   * Local cart state and persistent storage are managed via Zustand (`lib/cart-store.ts`) with `persist` middleware.
   * Mounted state guards (`isMounted`) are used on components reading cart state (e.g., Navbar badge) to prevent Server-Side Rendering (SSR) vs. Client-Side Rendering (CSR) hydration mismatches.

4. **Strict Type Safety & Dual Validation:**
   * Zero use of `any` types in TypeScript.
   * Shared Zod schemas strictly validate form inputs on the client (React Hook Form) and payload boundaries inside API Route Handlers.

---

## 3. Codebase File Tree & Placeholder Status Audit

Below is the exact audit of existing files versus empty placeholder files awaiting implementation.

### Completed Customer Storefront Files
* `app/(store)/page.tsx` — Homepage (Hero, BrandBar, Product Rails, Review Slider)
* `app/(store)/shop/page.tsx` — Catalog Page (Faceted Filters, Sort Dropdown, Pagination)
* `app/(store)/product/[id]/page.tsx` — Product Detail Page (Image Viewer, Variant Pickers, Tabs)
* `app/(store)/cart/page.tsx` — Cart Summary & Items Management Page
* `lib/cart-store.ts` — Zustand Cart State Store
* `lib/mock-data.ts` — Mock Catalog Dataset (To be replaced with API calls)

### Empty Files / Placeholders Awaiting Development (Current Focus)
```text
Empty File      .\middleware.ts
Empty File      .\actions\analytics.ts
Empty File      .\actions\order.ts
Empty File      .\actions\product.ts
Empty File      .\actions\review.ts
Empty Directory .\app\(auth)\sign-in\[[...sign-in]]
Empty Directory .\app\(auth)\sign-up\[[...sign-up]]
Empty File      .\app\(store)\account\page.tsx
Empty Directory .\app\(store)\orders\[id]
Empty File      .\app\(store)\orders\[id]\page.tsx
Empty File      .\app\admin\layout.tsx
Empty File      .\app\admin\page.tsx
Empty Directory .\app\admin\orders\[id]
Empty File      .\app\admin\orders\page.tsx
Empty File      .\app\admin\orders\[id]\page.tsx
Empty File      .\app\admin\products\page.tsx
Empty File      .\app\admin\products\new\page.tsx
Empty File      .\app\admin\transactions\page.tsx
Empty File      .\app\api\webhooks\clerk\route.ts
Empty File      .\components\admin\admin-header.tsx
Empty File      .\components\admin\admin-sidebar.tsx
Empty File      .\components\admin\analytics-charts.tsx
Empty File      .\components\admin\product-form.tsx
Empty File      .\components\admin\recent-orders-table.tsx
Empty File      .\lib\prisma.ts
Empty File      .\prisma\seed.ts
Empty File      .\schemas\product.ts
Empty File      .\types\admin.ts

4. Immediate Next Action Plan (Execution Order for Next Chat)In the next chat session, implementation will proceed in the following structured sequence:PHASE 1: Admin Dashboard UI ImplementationTypes & Schemas: Populate types/admin.ts and schemas/product.ts.Admin Layout & Navigation: Implement app/admin/layout.tsx, components/admin/admin-sidebar.tsx, and components/admin/admin-header.tsx.Dashboard Overview (app/admin/page.tsx): Build KPI summary cards (Revenue, Orders, Customers, Low Stock Alerts), Recharts area/bar charts (analytics-charts.tsx), and recent order tables (recent-orders-table.tsx).Product Management (app/admin/products/page.tsx & new/page.tsx): Implement the product catalog data table and the multi-step product authoring form (product-form.tsx) supporting live variant matrix generation (Size $\times$ Color).Order & Transaction Management (app/admin/orders/page.tsx & transactions/page.tsx): Build order fulfillment pipelines and financial transaction logs using shadcn/ui primitives (Table, Badge, DropdownMenu, Dialog).PHASE 2: Customer Checkout Page UI ImplementationCheckout Page (app/(store)/checkout/page.tsx):2-Column layout: Shipping/Billing address form on the left, sticky order breakdown on the right.Integration with React Hook Form + Zod for shipping details validation.Payment method selector (Credit Card via Stripe Elements, Cash on Delivery, PayPal).Direct trigger to checkout API intent endpoint.PHASE 3: Backend REST API & Data Layer ImplementationPrisma Singleton & Schemas: Write lib/prisma.ts and database seeding script (prisma/seed.ts).REST Route Handlers (app/api/...):GET /api/products — Filtered catalog with server pagination.GET /api/products/featured — Featured homepage product rails.GET /api/products/[id] — Detailed product views with variants.POST /api/cart/sync — Live price and stock rehydration for cart items.POST /api/checkout/intent — Transactional order creation and stock reservation.POST /api/webhooks/clerk — Clerk user synchronization.Security & Auth Guards: Configure middleware.ts for route protection (/admin/*, /checkout).

5. Database ERD Reference:
USER (id, email, passwordHash, role, name)
  ├── ACCOUNT (id, userId, provider)
  ├── SESSION (id, userId, token)
  ├── ADDRESS (id, userId, street, city, postalCode)
  ├── WISHLIST (id, userId)
  ├── CART (id, userId) ──> CART_ITEM (id, cartId, variantId, quantity)
  └── ORDER (id, orderNumber, userId, addressId, status, totalAmount)
        ├── ORDER_ITEM (id, orderId, variantId, unitPrice, quantity)
        └── PAYMENT (id, orderId, provider, transactionId, status)

CATEGORY (id, name, slug, parentId)
  └── PRODUCT (id, title, slug, basePrice, categoryId, dressStyle)
        ├── PRODUCT_IMAGE (id, productId, url, isPrimary)
        ├── PRODUCT_VARIANT (id, productId, sku, size, colorHex, stockQuantity)
        └── REVIEW (id, userId, productId, rating, comment)

        