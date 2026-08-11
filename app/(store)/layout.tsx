import { AnnouncementBar } from '@/components/shared/announcement-bar';
import { Navbar } from '@/components/shared/navbar';
import { NewsletterBox } from '@/components/shared/newsletter-box';
import { Footer } from '@/components/shared/footer';

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <NewsletterBox />
      <Footer />
    </div>
  );
}