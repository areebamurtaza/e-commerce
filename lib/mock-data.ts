// lib/mock-data.ts
import {
  Product,
  DetailedProduct,
  ProductColor,
  ProductSize,
  Review,
  DressStyleItem,
  FilterParams,
} from '@/types/product';

// ============================================================================
// 1. CATALOG SPECIFICATION CONSTANTS
// ============================================================================

export const CATALOG_COLORS: ProductColor[] = [
  { name: 'Green', hex: '#00C12B' },
  { name: 'Red', hex: '#F50606' },
  { name: 'Yellow', hex: '#F5DD06' },
  { name: 'Orange', hex: '#F57906' },
  { name: 'Cyan', hex: '#06CAF5' },
  { name: 'Blue', hex: '#063AF5' },
  { name: 'Purple', hex: '#7D06F5' },
  { name: 'Pink', hex: '#F506A4' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
];

export const CATALOG_SIZES: ProductSize[] = [
  'XX-Small',
  'X-Small',
  'Small',
  'Medium',
  'Large',
  'X-Large',
  'XX-Large',
  '3X-Large',
  '4X-Large',
];

// ============================================================================
// 2. REVIEWS DATA
// ============================================================================

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Samantha D.',
    isVerified: true,
    rating: 4.5,
    content:
      '"I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As an apparel enthusiast, I appreciate the obvious attention to detail."',
    date: 'August 14, 2024',
  },
  {
    id: 'rev-2',
    author: 'Alex M.',
    isVerified: true,
    rating: 4.0,
    content:
      '"The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I love the minimal aesthetic."',
    date: 'August 15, 2024',
  },
  {
    id: 'rev-3',
    author: 'Ethan R.',
    isVerified: true,
    rating: 3.5,
    content:
      '"This t-shirt is a must-have for anyone who appreciates great design. The fabric is soft, and it fits true to size. I have received plenty of compliments already."',
    date: 'August 16, 2024',
  },
  {
    id: 'rev-4',
    author: 'Olivia P.',
    isVerified: true,
    rating: 4.5,
    content:
      '"As a fashion enthusiast, I am extremely particular about details. This piece exceeded my expectations—the stitching and heavyweight weave are remarkable."',
    date: 'August 17, 2024',
  },
  {
    id: 'rev-5',
    author: 'Liam K.',
    isVerified: true,
    rating: 4.0,
    content:
      '"This t-shirt is a fusion of comfort and street style. The minimal lettering and tailored sleeves make it my go-to choice for casual meetups."',
    date: 'August 18, 2024',
  },
  {
    id: 'rev-6',
    author: 'Ava H.',
    isVerified: true,
    rating: 4.5,
    content:
      '"I am not just wearing a t-shirt; I am wearing a statement. The subtle graphic design speaks volumes without being overly loud. Five stars!"',
    date: 'August 19, 2024',
  },
];

// Alias export for components expecting REVIEWS directly
export const REVIEWS = MOCK_REVIEWS;

// ============================================================================
// 3. PRODUCTS CATALOG DATA
// ============================================================================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 't-shirt-with-tape-details',
    title: 'T-shirt with Tape Details',
    src: '/images/m1.png',
    image: '/images/m1.png',
    rating: 4.5,
    price: 120,
    originalPrice: 120,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [
      { name: 'Olive', hex: '#4F4631' },
      { name: 'Forest Green', hex: '#314F4A' },
      { name: 'Navy', hex: '#31344F' },
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: '2',
    slug: 'skinny-fit-jeans',
    title: 'Skinny Fit Jeans',
    src: '/images/m2.png',
    image: '/images/m2.png',
    rating: 4.8,
    price: 240,
    originalPrice: 260,
    discountPercentage: 20,
    discount: 20,
    category: 'Men',
    subCategory: 'Jeans',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [
      { name: 'Denim Blue', hex: '#1E3A8A' },
      { name: 'Black', hex: '#000000' },
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: '3',
    slug: 'checkered-shirt',
    title: 'Checkered Shirt',
    src: '/images/m3.png',
    image: '/images/m3.png',
    rating: 4.6,
    price: 180,
    originalPrice: 180,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'Shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [
      { name: 'Red Plaid', hex: '#DC2626' },
      { name: 'Blue Plaid', hex: '#2563EB' },
    ],
    sizes: ['Medium', 'Large', 'X-Large', 'XX-Large'],
  },
  {
    id: '4',
    slug: 'sleeve-striped-t-shirt',
    title: 'Sleeve Striped T-shirt',
    src: '/images/m4.png',
    image: '/images/m4.png',
    rating: 4.5,
    price: 130,
    originalPrice: 160,
    discountPercentage: 30,
    discount: 30,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Gym',
    colors: [
      { name: 'Orange', hex: '#F97316' },
      { name: 'Black', hex: '#000000' },
    ],
    sizes: ['Small', 'Medium', 'Large'],
  },
  {
    id: 'n1',
    slug: 'vertical-striped-shirt',
    title: 'Vertical Striped Shirt',
    src: '/images/n1.png',
    image: '/images/n1.png',
    rating: 4.9,
    price: 212,
    originalPrice: 232,
    discountPercentage: 20,
    discount: 20,
    category: 'Men',
    subCategory: 'Shirts',
    gender: 'Men',
    dressStyle: 'Formal',
    colors: [
      { name: 'Green Stripe', hex: '#15803D' },
      { name: 'Navy Stripe', hex: '#1E3A8A' },
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'n2',
    slug: 'courage-graphic-t-shirt',
    title: 'Courage Graphic T-shirt',
    src: '/images/n2.png',
    image: '/images/n2.png',
    rating: 4.7,
    price: 145,
    originalPrice: 145,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [
      { name: 'Burnt Orange', hex: '#EA580C' },
      { name: 'Black', hex: '#000000' },
    ],
    sizes: ['Medium', 'Large', 'X-Large'],
  },
  {
    id: 'n3',
    slug: 'loose-fit-bermuda-shorts',
    title: 'Loose Fit Bermuda Shorts',
    src: '/images/n3.png',
    image: '/images/n3.png',
    rating: 4.3,
    price: 80,
    originalPrice: 80,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'Shorts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [
      { name: 'Denim', hex: '#3B82F6' },
      { name: 'Black', hex: '#000000' },
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'n4',
    slug: 'faded-skinny-jeans',
    title: 'Faded Skinny Jeans',
    src: '/images/n4.png',
    image: '/images/n4.png',
    rating: 4.6,
    price: 210,
    originalPrice: 210,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'Jeans',
    gender: 'Men',
    dressStyle: 'Party',
    colors: [
      { name: 'Washed Black', hex: '#18181B' },
      { name: 'Charcoal', hex: '#27272A' },
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
];

// Alias exports for homepage sections
export const NEW_ARRIVALS: Product[] = MOCK_PRODUCTS.slice(0, 4);
export const TOP_SELLING: Product[] = MOCK_PRODUCTS.slice(4, 8);
export const PRODUCTS: Product[] = MOCK_PRODUCTS;

// ============================================================================
// 4. RELATED PRODUCTS
// ============================================================================

export const MOCK_RELATED_PRODUCTS: Product[] = [
  {
    id: 'rel-1',
    slug: 'polo-with-contrast-trims',
    title: 'Polo with Contrast Trims',
    src: '/images/m1.png',
    image: '/images/m1.png',
    rating: 4.0,
    price: 212,
    originalPrice: 242,
    discountPercentage: 20,
    discount: 20,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [{ name: 'Navy', hex: '#31344F' }],
    sizes: ['Small', 'Medium', 'Large'],
  },
  {
    id: 'rel-2',
    slug: 'gradient-graphic-t-shirt',
    title: 'Gradient Graphic T-shirt',
    src: '/images/m2.png',
    image: '/images/m2.png',
    rating: 3.5,
    price: 145,
    originalPrice: 145,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'rel-3',
    slug: 'polo-with-tipping-details',
    title: 'Polo with Tipping Details',
    src: '/images/m3.png',
    image: '/images/m3.png',
    rating: 4.5,
    price: 180,
    originalPrice: 180,
    discountPercentage: 0,
    discount: 0,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [{ name: 'Pink', hex: '#F506A4' }],
    sizes: ['Medium', 'Large', 'X-Large'],
  },
  {
    id: 'rel-4',
    slug: 'black-striped-t-shirt',
    title: 'Black Striped T-shirt',
    src: '/images/m4.png',
    image: '/images/m4.png',
    rating: 5.0,
    price: 120,
    originalPrice: 150,
    discountPercentage: 30,
    discount: 30,
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [{ name: 'Black/White', hex: '#000000' }],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
];

export const RELATED_PRODUCTS = MOCK_RELATED_PRODUCTS;

// ============================================================================
// 5. DRESS STYLES GRID DATA & ROWS
// ============================================================================

export const DRESS_STYLE_CARDS: DressStyleItem[] = [
  {
    id: 'casual',
    title: 'Casual',
    src: '/images/c1.png',
    href: '/shop?style=casual',
    styleConfig: {
      width: '407px',
      height: '289px',
      left: '0px',
      top: '0px',
    },
    mobileObjectPosition: 'object-right-top',
  },
  {
    id: 'formal',
    title: 'Formal',
    src: '/images/c2.png',
    href: '/shop?style=formal',
    styleConfig: {
      width: '684px',
      height: '289px',
      left: '427px',
      top: '0px',
    },
    mobileObjectPosition: 'object-top',
  },
  {
    id: 'party',
    title: 'Party',
    src: '/images/c3.png',
    href: '/shop?style=party',
    styleConfig: {
      width: '684px',
      height: '289px',
      left: '0px',
      top: '309px',
    },
    mobileObjectPosition: 'object-top',
  },
  {
    id: 'gym',
    title: 'Gym',
    src: '/images/c4.png',
    href: '/shop?style=gym',
    styleConfig: {
      width: '407px',
      height: '289px',
      left: '704px',
      top: '309px',
    },
    mobileObjectPosition: 'object-right-top',
  },
];

// Row-wise exports for components rendering the split grid layout
export const DRESS_STYLES_ROW_1: DressStyleItem[] = [
  DRESS_STYLE_CARDS[0]!,
  DRESS_STYLE_CARDS[1]!,
];

export const DRESS_STYLES_ROW_2: DressStyleItem[] = [
  DRESS_STYLE_CARDS[2]!,
  DRESS_STYLE_CARDS[3]!,
];

// ============================================================================
// 6. QUERY & FILTER HELPER FUNCTIONS
// ============================================================================

export function getNewArrivals(): Product[] {
  return NEW_ARRIVALS;
}

export function getTopSelling(): Product[] {
  return TOP_SELLING;
}

export function getProductById(id: string): DetailedProduct | undefined {
  const product = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
  if (!product) return undefined;

  const resolvedCategory = product.category || 'Men';
  const resolvedSubCategory = product.subCategory || 'T-shirts';
  const heroImg = product.src || product.image || '/images/pd1.png';

  return {
    ...product,
    category: resolvedCategory,
    subCategory: resolvedSubCategory,
    totalReviews: 451,
    description:
      'This graphic t-shirt is perfect for any occasion. Crafted from a soft and breathable heavyweight cotton fabric, it offers superior comfort and durability with a modern relaxed fit.',
    images: {
      hero: heroImg,
      thumbnails: ['/images/pd1.png', '/images/pd2.png', '/images/pd3.png'],
    },
    reviews: MOCK_REVIEWS,
  };
}

export function getProductBySlug(slug: string): DetailedProduct | undefined {
  return getProductById(slug);
}

export function getFilteredProducts(filters: FilterParams): Product[] {
  let filtered = [...MOCK_PRODUCTS];

  // 1. Text Search Filter
  if (filters.search) {
    const query = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.category?.toLowerCase().includes(query) ?? false) ||
        (p.subCategory?.toLowerCase().includes(query) ?? false)
    );
  }

  // 2. Discount Filter
  if (filters.discount) {
    filtered = filtered.filter(
      (p) => (p.discountPercentage ?? 0) > 0 || (p.discount ?? 0) > 0
    );
  }

  // 3. Gender Filter
  if (filters.gender) {
    const g = filters.gender.toLowerCase().trim();
    filtered = filtered.filter(
      (p) => p.gender?.toLowerCase() === g
    );
  }

  // 4. Category Filter
  if (filters.category) {
    const c = filters.category.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.category?.toLowerCase() === c ||
        p.subCategory?.toLowerCase() === c
    );
  }

  // 5. Dress Style Filter
  if (filters.style) {
    const s = filters.style.toLowerCase().trim();
    filtered = filtered.filter(
      (p) => p.dressStyle?.toLowerCase() === s
    );
  }

  // 6. Price Range Filters
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  // 7. Color Swatch Filter
  if (filters.color) {
    const targetColor = filters.color.toLowerCase().trim();
    filtered = filtered.filter(
      (p) => p.colors?.some((col) => col.name.toLowerCase() === targetColor) ?? false
    );
  }

  // 8. Size Filter
  if (filters.size) {
    const targetSize = filters.size.toLowerCase().trim();
    filtered = filtered.filter(
      (p) => p.sizes?.some((sz) => sz.toLowerCase() === targetSize) ?? false
    );
  }

  // 9. Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }
  }

  return filtered;
}