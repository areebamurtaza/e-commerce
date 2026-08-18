// components/shared/navbar.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { DEPARTMENT_TAXONOMY } from '@/constants/shop';
import { PredictiveSearch } from '@/components/shared/predictive-search';

function UserAccountIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9.5" r="3.25" />
      <path d="M6.5 18.5a6 6 0 0 1 11 0" />
    </svg>
  );
}

export function Navbar() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState<boolean>(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const totalCartCount = useCartStore((state) => state.getTotalItemsCount());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const navDepartments = [
    DEPARTMENT_TAXONOMY.MEN,
    DEPARTMENT_TAXONOMY.WOMEN,
    DEPARTMENT_TAXONOMY.KIDS,
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-black border-b border-black/10 dark:border-zinc-800 text-black dark:text-white transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] h-[62px] lg:h-[96px] flex items-center justify-between gap-4 lg:gap-10">
        
        {/* Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1 text-black dark:text-white hover:opacity-70 transition-opacity focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link
            href="/"
            className="font-integral font-bold text-[25px] sm:text-[32px] lg:text-[36px] leading-[1.0] text-black dark:text-white tracking-tighter uppercase select-none"
          >
            SHOP.CO
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
          {/* Shop Dropdown */}
          <div
            className="relative py-4"
            onMouseEnter={() => setIsShopDropdownOpen(true)}
            onMouseLeave={() => setIsShopDropdownOpen(false)}
          >
            <Link
              href="/shop"
              className="font-satoshi font-normal text-[16px] text-black dark:text-white flex items-center gap-1 hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
            >
              Shop
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isShopDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </Link>

            {isShopDropdownOpen && (
              <div className="absolute top-full left-0 w-[540px] bg-white dark:bg-zinc-900 rounded-[16px] shadow-2xl border border-black/10 dark:border-zinc-800 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                {navDepartments.map((dept) => (
                  <div key={dept.name} className="flex flex-col gap-3">
                    <Link
                      href={dept.href}
                      className="font-satoshi font-bold text-[16px] text-black dark:text-white hover:underline"
                    >
                      {dept.name}
                    </Link>
                    <ul className="flex flex-col gap-2">
                      {dept.subcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            href={`/shop?gender=${dept.gender.toLowerCase()}&category=${sub.slug}`}
                            className="font-satoshi font-normal text-[14px] text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/shop?discount=true"
            className="font-satoshi font-normal text-[16px] text-black dark:text-white hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
          >
            On Sale
          </Link>

          <Link
            href="/#new-arrivals"
            className="font-satoshi font-normal text-[16px] text-black dark:text-white hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
          >
            New Arrivals
          </Link>

          <Link
            href="/#brands"
            className="font-satoshi font-normal text-[16px] text-black dark:text-white hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
          >
            Brands
          </Link>
        </nav>

        {/* Desktop Predictive Search Bar */}
        <div className="hidden sm:block flex-1 max-w-[577px]">
          <PredictiveSearch />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden p-1.5 text-black dark:text-white hover:opacity-70 transition-opacity focus:outline-none cursor-pointer rounded-full"
            aria-label="Toggle search input"
          >
            {isSearchOpen ? <X size={22} /> : <Search size={22} />}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle theme"
            className="p-1.5 text-black dark:text-white hover:bg-black/5 dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none cursor-pointer"
          >
            {isMounted ? (
              resolvedTheme === 'dark' ? (
                <Sun className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] text-black animate-in spin-in-90 duration-200" />
              )
            ) : (
              <div className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
            )}
          </button>

          <Link
            href="/cart"
            className="p-1.5 text-black dark:text-white hover:opacity-70 transition-opacity focus:outline-none relative inline-flex items-center justify-center rounded-full"
            aria-label={`View Shopping Cart with ${isMounted ? totalCartCount : 0} items`}
          >
            <ShoppingCart className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px]" />
            {isMounted && totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#FF3333] text-white font-satoshi font-bold text-[10px] sm:text-[11px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-in zoom-in-50 duration-150">
                {totalCartCount > 99 ? '99+' : totalCartCount}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            className="p-1.5 text-black dark:text-white hover:opacity-70 transition-opacity focus:outline-none rounded-full"
            aria-label="User Account"
          >
            <UserAccountIcon className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px]" />
          </Link>
        </div>
      </div>

      {/* Mobile Predictive Search Bar Drawer */}
      {isSearchOpen && (
        <div className="sm:hidden px-4 py-3 border-t border-black/10 dark:border-zinc-800 bg-white dark:bg-black animate-in slide-in-from-top-2 duration-150">
          <PredictiveSearch isMobile onCloseMobile={() => setIsSearchOpen(false)} />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-6 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col gap-2">
            <span className="font-satoshi font-semibold text-[18px] text-black dark:text-white">
              Shop Categories
            </span>
            {navDepartments.map((dept) => (
              <div key={dept.name} className="flex flex-col pl-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMobileCategory(
                      activeMobileCategory === dept.name ? null : dept.name
                    )
                  }
                  className="flex items-center justify-between py-2 text-left font-satoshi font-medium text-[16px] text-black/80 dark:text-zinc-300 cursor-pointer"
                >
                  <span>{dept.name}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      activeMobileCategory === dept.name ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeMobileCategory === dept.name && (
                  <div className="pl-4 flex flex-col gap-2 py-1">
                    {dept.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={`/shop?gender=${dept.gender.toLowerCase()}&category=${sub.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-satoshi text-[14px] text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/shop?discount=true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black dark:text-white hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
          >
            On Sale
          </Link>
          <Link
            href="/#new-arrivals"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black dark:text-white hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
          >
            New Arrivals
          </Link>
          <Link
            href="/#brands"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black dark:text-white hover:text-black/70 dark:hover:text-zinc-300 transition-colors"
          >
            Brands
          </Link>
        </div>
      )}
    </header>
  );
}