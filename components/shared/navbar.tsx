'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';

/* 
  Pixel-Perfect User Account Circle Primitive matching Figma image_26ee79.png
  Features 2.25px stroke weight, centered head circle, and anchored shoulder arc.
*/
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
      {/* Outer Boundary Ring */}
      <circle cx="12" cy="12" r="10" />
      {/* Inner Head Circle */}
      <circle cx="12" cy="9.5" r="3.25" />
      {/* Inner Shoulder Arc */}
      <path d="M6.5 18.5a6 6 0 0 1 11 0" />
    </svg>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-black/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] h-[62px] lg:h-[96px] flex items-center justify-between gap-4 lg:gap-10">
        
        {/* Left Section: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1 text-black hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* SHOP.CO Brand Logo */}
          <Link
            href="/"
            className="font-integral font-bold text-[25px] sm:text-[32px] lg:text-[36px] leading-[1.0] text-black tracking-tighter uppercase select-none"
          >
            SHOP.CO
          </Link>
        </div>

        {/* Center Section: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
          {/* Shop Dropdown Link */}
          <div className="relative group">
            <Link
              href="/shop"
              className="font-satoshi font-normal text-[16px] text-black flex items-center gap-1 hover:text-black/70 transition-colors py-2"
            >
              Shop
              <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
            </Link>
          </div>

          <Link
            href="/shop?sort=on-sale"
            className="font-satoshi font-normal text-[16px] text-black hover:text-black/70 transition-colors"
          >
            On Sale
          </Link>

          <Link
            href="/shop?sort=new-arrivals"
            className="font-satoshi font-normal text-[16px] text-black hover:text-black/70 transition-colors"
          >
            New Arrivals
          </Link>

          <Link
            href="/brands"
            className="font-satoshi font-normal text-[16px] text-black hover:text-black/70 transition-colors"
          >
            Brands
          </Link>
        </nav>

        {/* Center-Right Section: Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-[577px] h-[48px] bg-[#F0EEED] rounded-[62px] px-4 items-center gap-3 focus-within:ring-1 focus-within:ring-black/20 transition-all">
          <Search size={20} className="text-black/40 shrink-0" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search for products..."
            className="w-full bg-transparent font-satoshi font-normal text-[16px] text-black placeholder:text-black/40 focus:outline-none"
            aria-label="Search products"
          />
        </div>

        {/* Right Section: Interactive Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Mobile Search Icon Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden p-1 text-black hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="Search"
          >
            <Search size={22} />
          </button>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="p-1 text-black hover:opacity-70 transition-opacity focus:outline-none relative"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart size={22} className="sm:w-6 sm:h-6" />
          </Link>

          {/* Account Profile Icon (Figma image_26ee79.png) */}
          <Link
            href="/account"
            className="p-1 text-black hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="User Account"
          >
            <UserAccountIcon className="w-[22px] h-[22px] sm:w-6 sm:h-6" />
          </Link>
        </div>

      </div>

      {/* Expandable Mobile Search Bar */}
      {isSearchOpen && (
        <div className="sm:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <div className="w-full h-[44px] bg-[#F0EEED] rounded-[62px] px-4 flex items-center gap-3">
            <Search size={18} className="text-black/40 shrink-0" />
            <input
              type="search"
              placeholder="Search for products..."
              className="w-full bg-transparent font-satoshi font-normal text-[14px] text-black placeholder:text-black/40 focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white px-4 py-6 flex flex-col gap-4 animate-in fade-in duration-200">
          <Link
            href="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black hover:text-black/70"
          >
            Shop
          </Link>
          <Link
            href="/shop?sort=on-sale"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black hover:text-black/70"
          >
            On Sale
          </Link>
          <Link
            href="/shop?sort=new-arrivals"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black hover:text-black/70"
          >
            New Arrivals
          </Link>
          <Link
            href="/brands"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-satoshi font-medium text-[18px] text-black hover:text-black/70"
          >
            Brands
          </Link>
        </div>
      )}
    </header>
  );
}