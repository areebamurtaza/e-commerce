// app/admin/layout.tsx
'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-satoshi text-black antialiased dark:bg-black dark:text-white transition-colors">
      {/* Collapsible Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Admin Content Region */}
      <div className="flex flex-1 flex-col min-w-0 bg-white dark:bg-black">
        <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 bg-[#F0F0F0]/30 p-4 sm:p-6 lg:p-8 dark:bg-zinc-950/60">
          <div className="mx-auto max-w-[1600px] w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}