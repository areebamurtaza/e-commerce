'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  CreditCard,
  X,
  PackagePlus,
  Boxes,
  ListOrdered,
  Receipt,
  LayoutDashboard,
  Store,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const ecommerceItems = [
    { title: 'Overview', href: '/admin', icon: LayoutDashboard },
    { title: 'Product Catalog', href: '/admin/products', icon: Boxes },
    { title: 'Add Product', href: '/admin/products/new', icon: PackagePlus },
    { title: 'Orders List', href: '/admin/orders', icon: ListOrdered },
    { title: 'Coupons & Ads', href: '/admin/coupons', icon: Tag },
  ];

  const paymentItems = [
    { title: 'Overview', href: '/admin/payments', icon: CreditCard },
    { title: 'Transactions Ledger', href: '/admin/payments/transactions', icon: Receipt },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-black text-black dark:text-white border-r border-black/10 dark:border-zinc-800 p-4 font-admin select-none transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-admin font-extrabold text-lg">
              S
            </div>
            <span className="font-admin text-base font-extrabold tracking-tight text-black dark:text-white">
              SHOP.CO ADMIN
            </span>
          </Link>

          {onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              onClick={onMobileClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {/* E-Commerce Group */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-black/40 dark:text-zinc-500 uppercase tracking-wider">
              <span>E-Commerce</span>
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>

            <div className="space-y-0.5 pt-1">
              {ecommerceItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm'
                        : 'text-black/70 dark:text-zinc-400 hover:bg-[#F0F0F0] dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-white dark:text-black' : 'text-black/50 dark:text-zinc-400'
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Payments Group */}
          <div className="space-y-1 pt-3 border-t border-black/10 dark:border-zinc-800">
            <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-black/40 dark:text-zinc-500 uppercase tracking-wider">
              <span>Payments</span>
              <CreditCard className="h-3.5 w-3.5" />
            </div>

            <div className="space-y-0.5 pt-1">
              {paymentItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm'
                        : 'text-black/70 dark:text-zinc-400 hover:bg-[#F0F0F0] dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-white dark:text-black' : 'text-black/50 dark:text-zinc-400'
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Storefront External Link */}
      <div className="pt-4 border-t border-black/10 dark:border-zinc-800">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs font-bold border-black/10 dark:border-zinc-800 rounded-[62px] justify-start gap-2 bg-[#F0F0F0] dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        >
          <Link href="/" target="_blank">
            <Store className="h-3.5 w-3.5" /> Visit Storefront ↗
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-black/10 dark:border-zinc-800 lg:block lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-black shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}