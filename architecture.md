shop-co/
├── app/
│   ├── (store)/
│   │   ├── layout.tsx                  # Root storefront layout (Navbar + Footer)
│   │   ├── page.tsx                    # Homepage
│   │   ├── shop/
│   │   │   ├── page.tsx                # All products / Catalog with searchParams
│   │   │   └── [category]/
│   │   │       └── page.tsx            # Category-specific catalog page
│   │   ├── product/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Product detail view
│   │   └── cart/
│   │       └── page.tsx                # Shopping cart page
│   ├── api/
│   │   └── checkout/
│   │       └── route.ts                # Stripe / Payment gateway initialization
│   ├── favicon.ico
│   ├── globals.css                     # Design tokens & CSS variables
│   ├── layout.tsx                      # Root HTML shell & Font setup
│   ├── loading.tsx                     # Global page loader skeleton
│   └── not-found.tsx                   # 404 screen
│
├── components/
│   ├── ui/                             # Primitive components
│   ├── shared/                         # Layout components
│   ├── product/                        # Product domain
│   ├── filters/                        # Filter domain
│   ├── reviews/                        # Review domain
│   └── cart/                           # Cart domain
│
├── lib/
│   ├── utils.ts                        # Tailwind merge & currency formatters
│   ├── constants.ts                    # Navigation links, Dress styles, Brand list
│   ├── mock-data.ts                    # Structured static data for products & reviews
│   └── fonts.ts                        # Font configurations (Integral CF / Satoshis)
│
├── hooks/
│   ├── use-cart.ts                     # Wrapper hook around Zustand cart store
│   ├── use-media-query.ts              # Breakpoint detector for responsive rendering
│   └── use-product-filters.ts          # Encapsulated SearchParams mutation hook
│
├── store/
│   ├── use-cart-store.ts               # Zustand persistent store
│   └── use-filter-store.ts             # Mobile filter modal state
│
├── types/
│   └── index.ts                        # TypeScript interfaces
│
├── schemas/
│   ├── newsletter.schema.ts            # Zod validation for newsletter
│   └── review.schema.ts                # Zod validation for customer review form
│
├── public/
│   ├── images/                         # Product & Category images
│   ├── icons/                          # SVG brand logos (Versace, Zara, etc.)
│   └── fonts/                          # Local custom fonts if needed
│
├── .env.example
├── components.json                     # shadcn configuration
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json