'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BrandAsset {
  name: string;
  src: string;
  width: number;
  height: number;
}

const BRAND_ASSETS: BrandAsset[] = [
  { name: 'VERSACE', src: '/images/versace.png', width: 166, height: 33 },
  { name: 'ZARA', src: '/images/zara.png', width: 91, height: 38 },
  { name: 'GUCCI', src: '/images/gucci.png', width: 156, height: 36 },
  { name: 'PRADA', src: '/images/prada.png', width: 194, height: 32 },
  { name: 'Calvin Klein', src: '/images/calvin.png', width: 207, height: 33 },
];

export function BrandBar() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (brandName: string) => {
    setImageErrors((prev) => ({ ...prev, [brandName]: true }));
  };

  return (
    <section
      id="brands"
      className="w-full bg-black py-6 sm:py-8 lg:py-0 lg:h-[122px] flex items-center justify-center scroll-mt-16 lg:scroll-mt-24"
    >
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 lg:px-[clamp(1.5rem,5vw,6.25rem)]">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-x-7 sm:gap-x-10 md:gap-x-6 gap-y-4">
          {BRAND_ASSETS.map((brand) => (
            <div
              key={brand.name}
              className="relative flex items-center justify-center shrink-0"
            >
              {!imageErrors[brand.name] ? (
                <Image
                  src={brand.src}
                  alt={`${brand.name} Logo`}
                  width={brand.width}
                  height={brand.height}
                  priority
                  unoptimized
                  style={{ width: 'auto' }}
                  className="h-[22px] sm:h-[28px] md:h-[32px] lg:h-[34px] w-auto object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity"
                  onError={() => handleImageError(brand.name)}
                />
              ) : (
                <span className="text-white font-integral text-[14px] sm:text-[20px] lg:text-[26px] tracking-wider uppercase opacity-90 whitespace-nowrap select-none">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}