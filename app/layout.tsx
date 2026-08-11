import type { Metadata, Viewport } from 'next';
import { satoshi, integralCF } from '@/lib/fonts';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SHOP.CO | High Quality E-Commerce Fashion',
    template: '%s | SHOP.CO',
  },
  description:
    'Find clothes that match your style. Explore our curated high-quality e-commerce fashion collection.',
  keywords: ['fashion', 'e-commerce', 'clothing', 'streetwear', 'shop.co'],
  authors: [{ name: 'SHOP.CO Team' }],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${integralCF.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-satoshi text-black antialiased selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}