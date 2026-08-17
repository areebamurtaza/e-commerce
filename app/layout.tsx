// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { integralCF, satoshi, adminFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import '@/app/globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://shopco-byareeba.netlify.app'
  ),
  title: {
    default: 'SHOP.CO | High-End Fashion & Apparel',
    template: '%s | SHOP.CO',
  },
  description:
    'Discover meticulously crafted fashion apparel designed for your unique style. Browse curated collections of contemporary garments, streetwear, and formal luxury.',
  keywords: [
    'fashion',
    'luxury clothing',
    'streetwear',
    'apparel',
    'e-commerce',
    'men fashion',
    'women fashion',
    'shop.co',
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(
          'scroll-smooth antialiased',
          integralCF.variable,
          satoshi.variable,
          adminFont.variable
        )}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-white font-satoshi text-black antialiased transition-colors duration-200 selection:bg-black selection:text-white dark:bg-black dark:text-white dark:selection:bg-white dark:selection:text-black">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}