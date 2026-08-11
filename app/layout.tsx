// app/layout.tsx
import type { Metadata } from 'next';
import { satoshi, integralCF } from '@/lib/fonts';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'SHOP.CO | High Quality E-Commerce Fashion',
  description: 'Find clothes that matches your style.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${satoshi.variable} ${integralCF.variable}`}
    >
      <body className="min-h-screen font-satoshi bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}