'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DressStyleItem } from '@/types/product';
import { DRESS_STYLES_ROW_1, DRESS_STYLES_ROW_2 } from '@/lib/mock-data';

interface CardProps {
  item: DressStyleItem;
}

function DressStyleCard({ item }: CardProps) {
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    <Link
      href={item.href}
      className="relative h-[190px] sm:h-[289px] bg-white rounded-[20px] overflow-hidden group block w-full shadow-xs"
    >
      {/* Category Title: Top-Left Anchor matching Figma image_2685dc.png */}
      <span className="absolute top-4 sm:top-[25px] left-6 sm:left-[36px] z-20 font-satoshi font-bold text-[24px] sm:text-[36px] leading-[32px] sm:leading-[49px] text-black select-none">
        {item.title}
      </span>

      {/* Subject Image Layer: Uniform percentage transform across mobile and desktop */}
      <div className="relative w-full h-full overflow-hidden pointer-events-none">
        {!imageError ? (
          <div
            className="absolute max-w-none transition-transform duration-500 ease-out group-hover:scale-105"
            style={{
              width: item.styleConfig.width,
              height: item.styleConfig.height,
              left: item.styleConfig.left,
              top: item.styleConfig.top,
              transform: item.styleConfig.transform,
            }}
          >
            <Image
              src={item.src}
              alt={`${item.title} Dress Style`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 50vw, 684px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-end pr-8 text-black/10 font-integral font-bold text-3xl uppercase select-none">
            {item.title}
          </div>
        )}
      </div>
    </Link>
  );
}

export function DressStyleGrid() {
  return (
    <section className="w-full bg-white pb-10 sm:pb-16 xl:pb-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        {/* Container Shell */}
        <div className="bg-[#F0F0F0] rounded-[20px] sm:rounded-[40px] px-4 sm:px-12 xl:px-[64px] pt-8 sm:pt-[70px] pb-8 sm:pb-[76px]">
          
          <h2 className="font-integral font-bold text-[32px] sm:text-[48px] leading-[36px] sm:leading-[58px] text-black text-center uppercase tracking-tight mb-7 sm:mb-[64px]">
            BROWSE BY DRESS STYLE
          </h2>

          {/* Cards Stack */}
          <div className="flex flex-col gap-4 sm:gap-5 xl:gap-[20px]">
            <div className="grid grid-cols-1 lg:grid-cols-[407fr_684fr] gap-4 sm:gap-5 xl:gap-[20px]">
              {DRESS_STYLES_ROW_1.map((item) => (
                <DressStyleCard key={item.id} item={item} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[684fr_407fr] gap-4 sm:gap-5 xl:gap-[20px]">
              {DRESS_STYLES_ROW_2.map((item) => (
                <DressStyleCard key={item.id} item={item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}