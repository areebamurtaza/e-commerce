'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

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

const NAV_CATEGORIES = [
  {
    name: 'Men',
    href: '/shop?gender=men',
    subcategories: [
      { name: 'T-shirts', href: '/product/1' },
      { name: 'Shirts', href: '/shop?category=men&type=shirts' },
      { name: 'Jeans', href: '/shop?category=men&type=jeans' },
      { name: 'Shorts', href: '/shop?category=men&type=shorts' },
    ],
  },
  {
    name: 'Women',
    href: '/shop?gender=women',
    subcategories: [
      { name: 'Tops & Tees', href: '/shop?category=women&type=tops' },
      { name: 'Dresses', href: '/shop?category=women&type=dresses' },
      { name: 'Jeans', href: '/shop?category=women&type=jeans' },
      { name: 'Jackets', href: '/shop?category=women&type=jackets' },
    ],
  },
  {
    name: 'Kids',
    href: '/shop?gender=kids',
    subcategories: [
      { name: 'Casual Wear', href: '/shop?category=kids&type=casual' },
      { name: 'Outerwear', href: '/shop?category=kids&type=outerwear' },
      { name: 'Sets', href: '/shop?category=kids&type=sets' },
    ],
  },
];

export function Navbar() {
  const router = useRouter();
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

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-black/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] h-[62px] lg:h-[96px] flex items-center justify-between gap-4 lg:gap-10">
        {/* Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1 text-black hover:opacity-70 transition-opacity focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link
            href="/"
            className="font-integral font-bold text-[25px] sm:text-[32px] lg:text-[36px] leading-[1.0] text-black tracking-tighter uppercase select-none"
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
              className="font-satoshi font-normal text-[16px] text-black flex items-center gap-1 hover:text-black/70 transition-colors"
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
              <div className="absolute top-full left-0 w-[540px] bg-white rounded-[16px] shadow-2xl border border-black/10 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                {NAV_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex flex-col gap-3">
                    <Link
                      href={cat.href}
                      className="font-satoshi font-bold text-[16px] text-black hover:underline"
                    >
                      {cat.name}
                    </Link>
                    <ul className="flex flex-col gap-2">
                      {cat.subcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            href={sub.href}
                            className="font-satoshi font-normal text-[14px] text-black/60 hover:text-black transition-colors"
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

          {/* On Sale: Filters items with discount percentage */}
          <Link
            href="/shop?discount=true"
            className="font-satoshi font-normal text-[16px] text-black hover:text-black/70 transition-colors"
          >
            On Sale
          </Link>

          {/* New Arrivals: Navigates to home page New Arrivals section */}
          <Link
            href="/#new-arrivals"
            className="font-satoshi font-normal text-[16px] text-black hover:text-black/70 transition-colors"
          >
            New Arrivals
          </Link>

          {/* Brands: Navigates to home page Brand Bar */}
          <Link
            href="/#brands"
            className="font-satoshi font-normal text-[16px] text-black hover:text-black/70 transition-colors"
          >
            Brands
          </Link>
        </nav>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex flex-1 max-w-[577px] h-[48px] bg-[#F0EEED] rounded-[62px] px-4 items-center gap-3 focus-within:ring-1 focus-within:ring-black/20 transition-all"
        >
          <button
            type="submit"
            className="text-black/40 hover:text-black transition-colors p-0.5 focus:outline-none cursor-pointer"
            aria-label="Submit search"
          >
            <Search size={20} className="shrink-0" />
          </button>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full bg-transparent font-satoshi font-normal text-[16px] text-black placeholder:text-black/40 focus:outline-none"
            aria-label="Search products"
          />
        </form>

        {/* User Account & Cart Controls */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden p-1 text-black hover:opacity-70 transition-opacity focus:outline-none cursor-pointer"
            aria-label="Toggle search input"
          >
            <Search size={22} />
          </button>

          {/* Cart Icon with Dynamic Counter Badge */}
          <Link
            href="/cart"
            className="p-1 text-black hover:opacity-70 transition-opacity focus:outline-none relative inline-flex items-center justify-center"
            aria-label={`View Shopping Cart with ${isMounted ? totalCartCount : 0} items`}
          >
            <ShoppingCart size={22} className="sm:w-6 sm:h-6" />
            {isMounted && totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF3333] text-white font-satoshi font-bold text-[10px] sm:text-[11px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50 duration-150">
                {totalCartCount > 99 ? '99+' : totalCartCount}
              </span>
            )}
          </Link>

          {/* Account Link */}
          <Link
            href="/account"
            className="p-1 text-black hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="User Account"
          >
            <UserAccountIcon className="w-[22px] h-[22px] sm:w-6 sm:h-6" />
          </Link>
        </div>
      </div>

      {/* Mobile Search Input Drawer */}
      {isSearchOpen && (
        <div className="sm:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full h-[44px] bg-[#F0EEED] rounded-[62px] px-4 flex items-center gap-3"
          >
            <button type="submit" aria-label="Submit search" className="text-black/40 p-0.5">
              <Search size={18} className="shrink-0" />
            </button>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full bg-transparent font-satoshi font-normal text-[14px] text-black placeholder:text-black/40 focus:outline-none"
              autoFocus
              aria-label="Search products mobile"
            />
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white px-4 py-6 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col gap-2">
            <span className="font-satoshi font-semibold text-[18px] text-black">
              Shop Categories
            </span>
            {NAV_CATEGORIES.map((cat) => (
              <div key={cat.name} className="flex flex-col pl-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMobileCategory(
                      activeMobileCategory === cat.name ? null : cat.name
                    )
                  }
                  className="flex items-center justify-between py-2 text-left font-satoshi font-medium text-[16px] text-black/80 cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      activeMobileCategory === cat.name ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeMobileCategory === cat.name && (
                  <div className="pl-4 flex flex-col gap-2 py-1">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-satoshi text-[14px] text-black/60 hover:text-black"
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
            className="font-satoshi font-medium text-[18px] text-black"
          >
            On Sale
          </Link>
          <Link
            href="/#new-arrivals"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black"
          >
            New Arrivals
          </Link>
          <Link
            href="/#brands"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black"
          >
            Brands
          </Link>
        </div>
      )}
    </header>
  );
}