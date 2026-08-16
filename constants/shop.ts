// constants/shop.ts
import { Gender } from '@prisma/client';

export interface SubCategoryItem {
  name: string;
  slug: string;
}

export interface DepartmentTaxonomy {
  name: string;
  gender: Gender;
  href: string;
  subcategories: SubCategoryItem[];
}

export const DEPARTMENT_TAXONOMY: Record<Gender, DepartmentTaxonomy> = {
  MEN: {
    name: 'Men',
    gender: 'MEN',
    href: '/shop?gender=men',
    subcategories: [
      { name: 'T-shirts', slug: 't-shirts' },
      { name: 'Shirts', slug: 'shirts' },
      { name: 'Jeans', slug: 'jeans' },
      { name: 'Shorts', slug: 'shorts' },
    ],
  },
  WOMEN: {
    name: 'Women',
    gender: 'WOMEN',
    href: '/shop?gender=women',
    subcategories: [
      { name: 'Tops & Tees', slug: 'tops' },
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Jeans', slug: 'jeans' },
      { name: 'Jackets', slug: 'jackets' },
    ],
  },
  KIDS: {
    name: 'Kids',
    gender: 'KIDS',
    href: '/shop?gender=kids',
    subcategories: [
      { name: 'Casual Wear', slug: 'casual' },
      { name: 'Outerwear', slug: 'outerwear' },
      { name: 'Sets', slug: 'sets' },
    ],
  },
  UNISEX: {
    name: 'Unisex',
    gender: 'UNISEX',
    href: '/shop?gender=unisex',
    subcategories: [
      { name: 'T-shirts', slug: 't-shirts' },
      { name: 'Shirts', slug: 'shirts' },
      { name: 'Jeans', slug: 'jeans' },
      { name: 'Jackets', slug: 'jackets' },
      { name: 'Outerwear', slug: 'outerwear' },
    ],
  },
};

export const ALL_TAXONOMY_CATEGORIES: SubCategoryItem[] = [
  { name: 'T-shirts', slug: 't-shirts' },
  { name: 'Shirts', slug: 'shirts' },
  { name: 'Jeans', slug: 'jeans' },
  { name: 'Shorts', slug: 'shorts' },
  { name: 'Tops & Tees', slug: 'tops' },
  { name: 'Dresses', slug: 'dresses' },
  { name: 'Jackets', slug: 'jackets' },
  { name: 'Casual Wear', slug: 'casual' },
  { name: 'Outerwear', slug: 'outerwear' },
  { name: 'Sets', slug: 'sets' },
];