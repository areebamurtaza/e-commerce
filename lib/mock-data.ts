import { Product, DetailedProduct, DressStyleItem, Review, FilterParams, ProductSize } from '@/types/product';

// Figma Exact Color Swatches Palette
export const CATALOG_COLORS = [
  { name: 'Green', hex: '#00C12B' },
  { name: 'Red', hex: '#F50606' },
  { name: 'Yellow', hex: '#F5DD06' },
  { name: 'Orange', hex: '#F57906' },
  { name: 'Light Blue', hex: '#06CAF5' },
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

export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'one-life-graphic-tshirt',
    title: 'ONE LIFE GRAPHIC T-SHIRT',
    src: '/images/pd1.png',
    rating: 4.5,
    price: 260,
    originalPrice: 300,
    discountPercentage: 40,
    href: '/product/1',
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[0], CATALOG_COLORS[5], CATALOG_COLORS[9]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'n1',
    title: 'T-shirt with Tape Details',
    src: '/images/n1.png',
    rating: 4.5,
    price: 120,
    href: '/product/n1',
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[9], CATALOG_COLORS[8], CATALOG_COLORS[5]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'n2',
    title: 'Skinny Fit Jeans',
    src: '/images/n2.png',
    rating: 3.5,
    price: 240,
    originalPrice: 260,
    discountPercentage: 20,
    href: '/product/n2',
    category: 'Men',
    subCategory: 'Jeans',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[5], CATALOG_COLORS[9]],
    sizes: ['Medium', 'Large', 'X-Large', 'XX-Large'],
  },
  {
    id: 'n3',
    title: 'Checkered Shirt',
    src: '/images/n3.png',
    rating: 4.5,
    price: 180,
    href: '/product/n3',
    category: 'Men',
    subCategory: 'Shirts',
    gender: 'Men',
    dressStyle: 'Formal',
    colors: [CATALOG_COLORS[1], CATALOG_COLORS[5]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'n4',
    title: 'Sleeve Striped T-shirt',
    src: '/images/n4.png',
    rating: 4.5,
    price: 130,
    originalPrice: 160,
    discountPercentage: 30,
    href: '/product/n4',
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[8], CATALOG_COLORS[9], CATALOG_COLORS[1]],
    sizes: ['Small', 'Medium', 'Large'],
  },
  {
    id: 't1',
    title: 'Vertical Striped Shirt',
    src: '/images/t1.png',
    rating: 5.0,
    price: 212,
    originalPrice: 232,
    discountPercentage: 20,
    href: '/product/t1',
    category: 'Men',
    subCategory: 'Shirts',
    gender: 'Men',
    dressStyle: 'Formal',
    colors: [CATALOG_COLORS[4], CATALOG_COLORS[8]],
    sizes: ['Medium', 'Large', 'X-Large'],
  },
  {
    id: 't2',
    title: 'Courage Graphic T-shirt',
    src: '/images/t2.png',
    rating: 4.0,
    price: 145,
    href: '/product/t2',
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[8], CATALOG_COLORS[7], CATALOG_COLORS[9]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 't3',
    title: 'Loose Fit Bermuda Shorts',
    src: '/images/t3.png',
    rating: 3.0,
    price: 80,
    href: '/product/t3',
    category: 'Men',
    subCategory: 'Shorts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[0], CATALOG_COLORS[9]],
    sizes: ['Medium', 'Large', 'X-Large'],
  },
  {
    id: 't4',
    title: 'Faded Skinny Jeans',
    src: '/images/t4.png',
    rating: 4.5,
    price: 210,
    href: '/product/t4',
    category: 'Men',
    subCategory: 'Jeans',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[9], CATALOG_COLORS[5]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'm1',
    title: 'Polo with Contrast Trims',
    src: '/images/m1.png',
    rating: 4.0,
    price: 212,
    originalPrice: 242,
    discountPercentage: 20,
    href: '/product/m1',
    category: 'Men',
    subCategory: 'Shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[4], CATALOG_COLORS[8]],
    sizes: ['Small', 'Medium', 'Large'],
  },
  {
    id: 'm2',
    title: 'Gradient Graphic T-shirt',
    src: '/images/m2.png',
    rating: 3.5,
    price: 145,
    href: '/product/m2',
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[8], CATALOG_COLORS[7]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: 'm3',
    title: 'Polo with Tipping Details',
    src: '/images/m3.png',
    rating: 4.5,
    price: 180,
    href: '/product/m3',
    category: 'Men',
    subCategory: 'Shirts',
    gender: 'Men',
    dressStyle: 'Formal',
    colors: [CATALOG_COLORS[1], CATALOG_COLORS[5]],
    sizes: ['Medium', 'Large', 'X-Large'],
  },
  {
    id: 'm4',
    title: 'Black Striped T-shirt',
    src: '/images/m4.png',
    rating: 5.0,
    price: 120,
    originalPrice: 150,
    discountPercentage: 30,
    href: '/product/m4',
    category: 'Men',
    subCategory: 'T-shirts',
    gender: 'Men',
    dressStyle: 'Casual',
    colors: [CATALOG_COLORS[9], CATALOG_COLORS[8]],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
];

export const NEW_ARRIVALS: Product[] = ALL_PRODUCTS.filter((p) =>
  ['n1', 'n2', 'n3', 'n4'].includes(p.id)
);

export const TOP_SELLING: Product[] = ALL_PRODUCTS.filter((p) =>
  ['t1', 't2', 't3', 't4'].includes(p.id)
);

export const DRESS_STYLES_ROW_1: DressStyleItem[] = [
  {
    id: 'casual',
    title: 'Casual',
    src: '/images/casual.png',
    href: '/shop?style=Casual',
    mobileObjectPosition: 'object-[75%_25%]',
    styleConfig: {
      width: '239.06%',
      height: '224.57%',
      left: '-85.26%',
      top: '-42.21%',
      transform: 'scaleX(-1)',
    },
  },
  {
    id: 'formal',
    title: 'Formal',
    src: '/images/formal.png',
    href: '/shop?style=Formal',
    mobileObjectPosition: 'object-[center_top]',
    styleConfig: {
      width: '190.93%',
      height: '301.03%',
      left: '0%',
      top: '-50.52%',
    },
  },
];

export const DRESS_STYLES_ROW_2: DressStyleItem[] = [
  {
    id: 'party',
    title: 'Party',
    src: '/images/party.png',
    href: '/shop?style=Party',
    mobileObjectPosition: 'object-[60%_20%]',
    styleConfig: {
      width: '112.57%',
      height: '213.15%',
      left: '6.14%',
      top: '-56.40%',
    },
  },
  {
    id: 'gym',
    title: 'Gym',
    src: '/images/gym.png',
    href: '/shop?style=Gym',
    mobileObjectPosition: 'object-[50%_15%]',
    styleConfig: {
      width: '111.05%',
      height: '234.25%',
      left: '13.02%',
      top: '-51.21%',
    },
  },
];

export const DRESS_STYLES: DressStyleItem[] = [
  ...DRESS_STYLES_ROW_1,
  ...DRESS_STYLES_ROW_2,
];

export const REVIEWS: Review[] = [
  {
    id: 'r0',
    author: 'Olivia T.',
    isVerified: true,
    rating: 5,
    content:
      '"Great customer service and premium quality fabrics. Will definitely be ordering again! The delivery was super quick as well."',
    date: 'August 12, 2023',
  },
  {
    id: 'r1',
    author: 'Sarah M.',
    isVerified: true,
    rating: 5,
    content:
      '"I\'m blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I\'ve bought has exceeded my expectations."',
    date: 'August 13, 2023',
  },
  {
    id: 'r2',
    author: 'Alex K.',
    isVerified: true,
    rating: 5,
    content:
      '"Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."',
    date: 'August 14, 2023',
  },
];

export const PDP_REVIEWS: Review[] = [
  {
    id: 'pd-r1',
    author: 'Samantha D.',
    isVerified: true,
    rating: 4.5,
    content:
      '"I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It\'s become my favorite go-to shirt."',
    date: 'August 14, 2023',
  },
  {
    id: 'pd-r2',
    author: 'Alex M.',
    isVerified: true,
    rating: 4.5,
    content:
      '"The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I\'m quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me."',
    date: 'August 15, 2023',
  },
];

export const MOCK_RELATED_PRODUCTS: Product[] = ALL_PRODUCTS.filter((p) =>
  ['m1', 'm2', 'm3', 'm4'].includes(p.id)
);

export const FEATURED_PDP_PRODUCT: DetailedProduct = {
  ...ALL_PRODUCTS[0],
  totalReviews: 451,
  description:
    'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
  images: {
    hero: '/images/pd1.png',
    thumbnails: ['/images/pd4.png', '/images/pd2.png', '/images/pd3.png'],
  },
  reviews: PDP_REVIEWS,
};

export function getProductById(id: string): DetailedProduct {
  const found = ALL_PRODUCTS.find((p) => p.id === id);
  if (found) {
    return {
      ...found,
      totalReviews: 451,
      description:
        'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
      images: {
        hero: found.src,
        thumbnails: [found.src, '/images/pd2.png', '/images/pd3.png'],
      },
      reviews: PDP_REVIEWS,
    };
  }
  return FEATURED_PDP_PRODUCT;
}

export function getFilteredProducts(params: FilterParams): Product[] {
  let list = [...ALL_PRODUCTS];

  if (params.search && params.search.trim() !== '') {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q)
    );
  }

  if (params.discount) {
    list = list.filter((p) => (p.discountPercentage ?? 0) > 0);
  }

  if (params.gender && params.gender.trim() !== '') {
    const g = params.gender.toLowerCase().trim();
    list = list.filter((p) => p.gender.toLowerCase() === g);
  }

  if (params.category && params.category.trim() !== '') {
    const c = params.category.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.category.toLowerCase() === c ||
        p.subCategory.toLowerCase() === c
    );
  }

  if (params.style && params.style.trim() !== '') {
    const s = params.style.toLowerCase().trim();
    list = list.filter((p) => p.dressStyle.toLowerCase() === s);
  }

  if (params.minPrice !== undefined) {
    list = list.filter((p) => p.price >= (params.minPrice ?? 0));
  }
  if (params.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= (params.maxPrice ?? 500));
  }

  if (params.color && params.color.trim() !== '') {
    const col = params.color.toLowerCase().trim();
    list = list.filter((p) =>
      p.colors.some((c) => c.name.toLowerCase() === col || c.hex.toLowerCase() === col)
    );
  }

  if (params.size && params.size.trim() !== '') {
    const sz = params.size.toLowerCase().trim();
    list = list.filter((p) =>
      p.sizes.some((s) => s.toLowerCase() === sz)
    );
  }

  if (params.sort) {
    switch (params.sort) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        break;
    }
  }

  return list;
}