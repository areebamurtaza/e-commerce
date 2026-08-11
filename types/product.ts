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
  | '4X-Large';

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
  src: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  href?: string;
  category: string;
  subCategory: string;
  gender: 'Men' | 'Women' | 'Kids';
  dressStyle: 'Casual' | 'Formal' | 'Party' | 'Gym';
  colors: ProductColor[];
  sizes: ProductSize[];
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