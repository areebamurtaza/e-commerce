export interface Product {
  id: string;
  title: string;
  src: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  href?: string;
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

export interface Review {
  id: string;
  author: string;
  isVerified: boolean;
  rating: number;
  content: string;
  date?: string;
}