import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { satoshi, integralCF } from '@/lib/fonts';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SHOP.CO | Modern E-Commerce Platform',
    template: '%s | SHOP.CO',
  },
  description: 'High-fashion e-commerce storefront and admin management system.',
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
    <ClerkProvider>
      <html
        lang="en"
        className={`${satoshi.variable} ${integralCF.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-white dark:bg-black font-satoshi text-black dark:text-white antialiased transition-colors">
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