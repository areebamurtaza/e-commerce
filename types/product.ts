// types/product.ts
import { DressStyle, Gender } from '@prisma/client';

export type ProductSize =
  | 'XXS'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL'
  | '3XL'
  | '4XL'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'X-Large'
  | string;

export interface ProductColor {
  name: string;
  hex?: string;
  colorHex?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment?: string;
  content?: string;
  date?: string;
  createdAt?: string | Date;
  verified?: boolean;
  isVerified?: boolean;
}

export interface DressStyleItem {
  id?: string;
  name?: string;
  title?: string;
  slug: string;
  image: string;
  href?: string;
}

export interface FilterParams {
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  color?: string;
  sizes?: string[];
  size?: string;
  dressStyle?: string;
  style?: string;
  discount?: number | boolean | string;
  sort?: string;
  page?: number;
  search?: string;
}

export interface ProductImagesObject {
  hero?: string;
  gallery?: string[];
  [key: string]: unknown;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  basePrice?: number;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount?: number;
  src?: string;
  image?: string;
  category?: string;
  subCategory?: string;
  dressStyle?: DressStyle | 'Casual' | 'Formal' | 'Party' | 'Gym' | string;
  gender?: Gender | 'Men' | 'Women' | 'Kids' | 'Unisex' | string;
  description?: string;
  colors?: ProductColor[];
  sizes?: string[];
  images?: string[] | ProductImagesObject | Array<string | ProductImagesObject>;
  isNewArrival?: boolean;
  isFeatured?: boolean;
}

export interface DetailedProduct extends Product {
  breadcrumbs?: { label: string; href: string }[];
  sku?: string;
  details?: string[];
  faqs?: { question: string; answer: string }[];
  reviewsList?: Review[];
  totalReviews?: number;
}

export type ProductCardData = Product;