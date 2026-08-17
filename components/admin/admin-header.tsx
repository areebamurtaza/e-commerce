'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { user } = useUser();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-black/10 dark:border-zinc-800 bg-white/90 dark:bg-black/90 px-4 backdrop-blur md:px-6 font-admin transition-colors">
      {/* Left: Mobile Drawer Trigger & Search Input */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-black dark:text-white hover:bg-black/5 dark:hover:bg-zinc-800"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40 dark:text-zinc-500" />
          <Input
            placeholder="Search orders, products, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 rounded-[62px] bg-[#F0F0F0] dark:bg-zinc-900 border-none pl-9 pr-12 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none rounded border border-black/10 dark:border-zinc-800 bg-white dark:bg-black px-1.5 text-[10px] font-mono text-black/40 dark:text-zinc-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2">
        {/* Working Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle Theme"
          aria-label="Toggle theme"
          className="h-8 w-8 text-black dark:text-white hover:bg-black/5 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {mounted ? (
            resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-black" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHasNotifications(false)}
          title="Notifications"
          aria-label="Notifications"
          className="relative h-8 w-8 text-black dark:text-white hover:bg-black/5 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black" />
          )}
        </Button>

        {/* Clerk User Button */}
        <div className="pl-2 border-l border-black/10 dark:border-zinc-800">
          {user ? (
            <UserButton />
          ) : (
            <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center">
              AD
            </div>
          )}
        </div>
      </div>
    </header>
  );
}