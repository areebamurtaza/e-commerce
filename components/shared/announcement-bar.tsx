'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  if (!isVisible) return null;

  return (
    <div className="relative w-full h-[38px] bg-black flex items-center justify-center px-4 z-50">
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 lg:px-[clamp(2rem,6vw,6.25rem)] flex items-center justify-center relative">
        <p className="font-satoshi font-normal text-[12px] sm:text-[14px] leading-[19px] text-white text-center">
          Sign up and get 20% off to your first order.{' '}
          <Link
            href="/sign-up"
            className="font-medium underline underline-offset-4 hover:text-white/80 transition-colors"
          >
            Sign Up Now
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute right-4 lg:right-[clamp(2rem,6vw,6.25rem)] top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-opacity p-1"
          aria-label="Close Announcement"
        >
          <X size={20} className="w-[20px] h-[20px]" />
        </button>
      </div>
    </div>
  );
}