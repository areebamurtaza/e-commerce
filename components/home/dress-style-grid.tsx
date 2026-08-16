'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface DressStyleItem {
  id: string;
  title: string;
  href: string;
  src: string;
  /**
   * Precise Figma positioning & bleed configurations per style card
   */
  imageStyles: {
    mobile: {
      width: string;
      height: string;
      right: string;
      top: string;
      transform?: string;
    };
    desktop: {
      width: string;
      height: string;
      right: string;
      top: string;
      transform?: string;
    };
  };
}

const DRESS_STYLES_DATA: {
  row1: DressStyleItem[];
  row2: DressStyleItem[];
} = {
  row1: [
    {
      id: 'casual',
      title: 'Casual',
      href: '/shop?style=CASUAL',
      src: '/images/casual.png',
      imageStyles: {
        mobile: {
          width: '280px',
          height: '240px',
          right: '-45px',
          top: '-25px',
        },
        desktop: {
          width: '407px',
          height: '350px',
          right: '-30px',
          top: '-30px',
        },
      },
    },
    {
      id: 'formal',
      title: 'Formal',
      href: '/shop?style=FORMAL',
      src: '/images/formal.png',
      imageStyles: {
        mobile: {
          width: '320px',
          height: '240px',
          right: '-50px',
          top: '-15px',
        },
        desktop: {
          width: '684px',
          height: '420px',
          right: '-30px',
          top: '-65px',
        },
      },
    },
  ],
  row2: [
    {
      id: 'party',
      title: 'Party',
      href: '/shop?style=PARTY',
      src: '/images/party.png',
      imageStyles: {
        mobile: {
          width: '320px',
          height: '240px',
          right: '-50px',
          top: '-20px',
        },
        desktop: {
          width: '684px',
          height: '420px',
          right: '-40px',
          top: '-65px',
        },
      },
    },
    {
      id: 'gym',
      title: 'Gym',
      href: '/shop?style=GYM',
      src: '/images/gym.png',
      imageStyles: {
        mobile: {
          width: '260px',
          height: '240px',
          right: '-35px',
          top: '-20px',
        },
        desktop: {
          width: '407px',
          height: '360px',
          right: '-30px',
          top: '-35px',
        },
      },
    },
  ],
};

interface DressStyleCardProps {
  item: DressStyleItem;
}

function DressStyleCard({ item }: DressStyleCardProps) {
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <Link
      href={item.href}
      className="group relative h-[190px] sm:h-[289px] w-full bg-white dark:bg-zinc-950 rounded-[20px] overflow-hidden border border-black/5 dark:border-zinc-800 shadow-xs transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-zinc-700 block select-none"
    >
      {/* Category Header: Top-Left Anchor */}
      <span className="absolute top-4 sm:top-[25px] left-6 sm:left-[36px] z-20 font-satoshi font-bold text-[24px] sm:text-[36px] leading-[32px] sm:leading-[49px] text-black dark:text-white capitalize">
        {item.title}
      </span>

      {/* Intentionally Cropped / Bleed Image Wrapper */}
      <div className="relative w-full h-full overflow-hidden pointer-events-none">
        {!hasError ? (
          <>
            {/* Mobile Viewport Positioning (< 640px) */}
            <div
              className="sm:hidden absolute transition-transform duration-500 ease-out group-hover:scale-105"
              style={{
                width: item.imageStyles.mobile.width,
                height: item.imageStyles.mobile.height,
                right: item.imageStyles.mobile.right,
                top: item.imageStyles.mobile.top,
                transform: item.imageStyles.mobile.transform,
              }}
            >
              <Image
                src={item.src}
                alt={`${item.title} Dress Style`}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 350px"
                className="object-contain object-top"
                onError={() => setHasError(true)}
              />
            </div>

            {/* Desktop & Tablet Viewport Positioning (>= 640px) */}
            <div
              className="hidden sm:block absolute transition-transform duration-500 ease-out group-hover:scale-105"
              style={{
                width: item.imageStyles.desktop.width,
                height: item.imageStyles.desktop.height,
                right: item.imageStyles.desktop.right,
                top: item.imageStyles.desktop.top,
                transform: item.imageStyles.desktop.transform,
              }}
            >
              <Image
                src={item.src}
                alt={`${item.title} Dress Style`}
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 684px"
                className="object-contain object-top"
                onError={() => setHasError(true)}
              />
            </div>
          </>
        ) : (
          /* Subtle Fallback Watermark */
          <div className="w-full h-full flex items-center justify-end pr-8 text-black/10 dark:text-white/10 font-integral font-bold text-3xl sm:text-5xl uppercase select-none">
            {item.title}
          </div>
        )}
      </div>
    </Link>
  );
}

export function DressStyleGrid() {
  return (
    <section className="w-full bg-white dark:bg-black py-10 sm:py-16 xl:py-20 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Main Shell Container */}
        <div className="bg-[#F0F0F0] dark:bg-zinc-900/60 rounded-[20px] sm:rounded-[40px] px-4 sm:px-12 xl:px-[64px] pt-8 sm:pt-[70px] pb-8 sm:pb-[76px] border border-black/5 dark:border-zinc-800">
          
          <h2 className="font-integral font-bold text-[32px] sm:text-[44px] lg:text-[48px] leading-[1.1] text-black dark:text-white text-center uppercase tracking-tight mb-7 sm:mb-[56px] xl:mb-[64px]">
            BROWSE BY DRESS STYLE
          </h2>

          {/* Asymmetric Proportional Grid matching Figma: 407fr / 684fr */}
          <div className="flex flex-col gap-4 sm:gap-5 xl:gap-[20px]">
            {/* Row 1: Casual (407fr) & Formal (684fr) */}
            <div className="grid grid-cols-1 lg:grid-cols-[407fr_684fr] gap-4 sm:gap-5 xl:gap-[20px]">
              {DRESS_STYLES_DATA.row1.map((item) => (
                <DressStyleCard key={item.id} item={item} />
              ))}
            </div>

            {/* Row 2: Party (684fr) & Gym (407fr) */}
            <div className="grid grid-cols-1 lg:grid-cols-[684fr_407fr] gap-4 sm:gap-5 xl:gap-[20px]">
              {DRESS_STYLES_DATA.row2.map((item) => (
                <DressStyleCard key={item.id} item={item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}