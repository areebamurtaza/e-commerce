// lib/fonts.ts
import localFont from 'next/font/local';
import { Plus_Jakarta_Sans } from 'next/font/google';

export const adminFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-admin',
  display: 'swap',
});

export const integralCF = localFont({
  src: [
    {
      path: '../public/fonts/IntegralCF-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-integral',
  display: 'swap',
  preload: true,
});

export const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/Montserrat-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Montserrat-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Montserrat-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
  preload: true,
});