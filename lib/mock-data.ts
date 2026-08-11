import { Product, DressStyleItem, Review } from '@/types/product';

export const NEW_ARRIVALS: Product[] = [
  {
    id: 'n1',
    title: 'T-shirt with Tape Details',
    src: '/images/n1.png',
    rating: 4.5,
    price: 120,
    href: '/shop/t-shirt-with-tape-details',
  },
  {
    id: 'n2',
    title: 'Skinny Fit Jeans',
    src: '/images/n2.png',
    rating: 3.5,
    price: 240,
    originalPrice: 260,
    discountPercentage: 20,
    href: '/shop/skinny-fit-jeans',
  },
  {
    id: 'n3',
    title: 'Checkered Shirt',
    src: '/images/n3.png',
    rating: 4.5,
    price: 180,
    href: '/shop/checkered-shirt',
  },
  {
    id: 'n4',
    title: 'Sleeve Striped T-shirt',
    src: '/images/n4.png',
    rating: 4.5,
    price: 130,
    originalPrice: 160,
    discountPercentage: 30,
    href: '/shop/sleeve-striped-t-shirt',
  },
];

export const TOP_SELLING: Product[] = [
  {
    id: 't1',
    title: 'Vertical Striped Shirt',
    src: '/images/t1.png',
    rating: 5.0,
    price: 212,
    originalPrice: 232,
    discountPercentage: 20,
    href: '/shop/vertical-striped-shirt',
  },
  {
    id: 't2',
    title: 'Courage Graphic T-shirt',
    src: '/images/t2.png',
    rating: 4.0,
    price: 145,
    href: '/shop/courage-graphic-t-shirt',
  },
  {
    id: 't3',
    title: 'Loose Fit Bermuda Shorts',
    src: '/images/t3.png',
    rating: 3.0,
    price: 80,
    href: '/shop/loose-fit-bermuda-shorts',
  },
  {
    id: 't4',
    title: 'Faded Skinny Jeans',
    src: '/images/t4.png',
    rating: 4.5,
    price: 210,
    href: '/shop/faded-skinny-jeans',
  },
];

export const DRESS_STYLES_ROW_1: DressStyleItem[] = [
  {
    id: 'casual',
    title: 'Casual',
    src: '/images/casual.png',
    href: '/shop?category=casual',
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
    href: '/shop?category=formal',
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
    href: '/shop?category=party',
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
    href: '/shop?category=gym',
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
  },
  {
    id: 'r1',
    author: 'Sarah M.',
    isVerified: true,
    rating: 5,
    content:
      '"I\'m blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I\'ve bought has exceeded my expectations."',
  },
  {
    id: 'r2',
    author: 'Alex K.',
    isVerified: true,
    rating: 5,
    content:
      '"Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."',
  },
  {
    id: 'r3',
    author: 'James L.',
    isVerified: true,
    rating: 5,
    content:
      '"As someone who\'s always on the lookout for unique fashion pieces, I\'m thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."',
  },
  {
    id: 'r4',
    author: 'Mooen',
    isVerified: true,
    rating: 5,
    content:
      '"As someone who\'s always on the lookout for unique fashion pieces, I\'m thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."',
  },
  {
    id: 'r5',
    author: 'Ethan R.',
    isVerified: true,
    rating: 5,
    content:
      '"This is hands down the best online shopping experience I\'ve had. Fast shipping, exceptional customer service, and high-quality garments that fit perfectly!"',
  },
  {
    id: 'r6',
    author: 'Liam P.',
    isVerified: true,
    rating: 5,
    content:
      '"The fit and finish on these jackets are unmatched. Highly recommend SHOP.CO to anyone looking to upgrade their everyday style."',
  },
];