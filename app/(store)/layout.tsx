// app/(store)/layout.tsx
import { AnnouncementBar } from '@/components/shared/announcement-bar';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { NewsletterBox } from '@/components/shared/newsletter-box';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white text-black dark:bg-black dark:text-white transition-colors">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <div className="mt-auto">
        <NewsletterBox />
        <Footer />
      </div>
    </div>
  );
}