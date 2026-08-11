import localFont from 'next/font/local';
import { Montserrat } from 'next/font/google';

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
  fallback: ['Space_Grotesk', 'Montserrat', 'sans-serif'],
});

export const satoshi = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-satoshi',
  display: 'swap',
});