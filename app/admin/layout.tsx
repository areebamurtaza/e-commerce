'use client';

import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-white dark:bg-black font-satoshi flex text-black dark:text-white antialiased transition-colors">
        <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0 bg-white dark:bg-black">
          <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F0F0F0]/30 dark:bg-zinc-950/60">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}