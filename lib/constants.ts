import { Brand, NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Shop',
    href: '/shop',
    children: [
      { label: 'Casual', href: '/shop?style=Casual' },
      { label: 'Formal', href: '/shop?style=Formal' },
      { label: 'Party', href: '/shop?style=Party' },
      { label: 'Gym', href: '/shop?style=Gym' },
    ],
  },
  { label: 'On Sale', href: '/shop?sale=true' },
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Brands', href: '/#brands' },
];

export const BRANDS: Brand[] = [
  { name: 'VERSACE', logoText: 'VERSACE' },
  { name: 'ZARA', logoText: 'ZARA' },
  { name: 'GUCCI', logoText: 'GUCCI' },
  { name: 'PRADA', logoText: 'PRADA' },
  { name: 'Calvin Klein', logoText: 'Calvin Klein' },
];