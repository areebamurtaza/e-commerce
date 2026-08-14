// types/product.ts

export interface ProductColor {
  name: string;
  hex: string;
}

export type ProductSize =
  | 'XX-Small'
  | 'X-Small'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'X-Large'
  | 'XX-Large'
  | '3X-Large'
  | '4X-Large'
  | string; // Added string to support DB dynamic sizes

export interface Review {
  id: string;
  author: string;
  isVerified: boolean;
  rating: number;
  content: string;
  date?: string;
}

export interface Product {
  id: string;
  slug?: string;
  title: string;
  src?: string;
  image?: string; // Support new DB mapping
  rating: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  discount?: number; // Support new DB mapping
  href?: string;
  category?: string; // Made optional for lightweight DB queries
  subCategory?: string; // Made optional
  gender?: 'Men' | 'Women' | 'Kids' | string; // Made optional
  dressStyle?: 'Casual' | 'Formal' | 'Party' | 'Gym' | string; // Made optional
  colors?: ProductColor[]; // Made optional
  sizes?: ProductSize[]; // Made optional
}

export interface DetailedProduct extends Product {
  totalReviews: number;
  description: string;
  images: {
    hero: string;
    thumbnails: string[];
  };
  reviews: Review[];
}

export interface DressStyleItem {
  id: string;
  title: string;
  src: string;
  href: string;
  styleConfig: {
    width: string;
    height: string;
    left: string;
    top: string;
    transform?: string;
  };
  mobileObjectPosition: string;
}

export interface FilterParams {
  search?: string;
  discount?: boolean;
  gender?: string;
  category?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  sort?: string;
  page?: number;
}