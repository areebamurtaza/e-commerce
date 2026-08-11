export type DressStyle = 'Casual' | 'Formal' | 'Party' | 'Gym';

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  dressStyle: DressStyle;
  isNew?: boolean;
  isTopSelling?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  date?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface Brand {
  name: string;
  logoText: string;
}