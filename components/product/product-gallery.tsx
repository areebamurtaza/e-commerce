'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  heroImage: string;
  thumbnails: string[];
  title: string;
}

export function ProductGallery({ heroImage, thumbnails = [], title }: ProductGalleryProps) {
  const allImages = [heroImage, ...thumbnails].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState<string>(heroImage || '/images/pd1.png');

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3.5 lg:h-[530px] w-full max-w-[610px] shrink-0 font-satoshi">
      {/* Thumbnail Column */}
      <div className="flex lg:flex-col justify-start gap-3.5 shrink-0 overflow-x-auto lg:overflow-visible lg:h-[530px] pb-2 lg:pb-0 no-scrollbar">
        {allImages.slice(0, 3).map((img, idx) => {
          const isSelected = selectedImage === img;
          return (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-[111px] sm:w-[152px] h-[106px] lg:h-[167px] rounded-[20px] overflow-hidden bg-[#F0EEED] dark:bg-zinc-900 border transition-all duration-200 shrink-0 cursor-pointer ${
                isSelected
                  ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                  : 'border-transparent hover:opacity-80'
              }`}
            >
              <Image
                src={img}
                alt={`${title} view ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 111px, 152px"
                className="object-cover object-center"
              />
            </button>
          );
        })}
      </div>

      {/* Main Hero Display Viewport */}
      <div className="relative w-full lg:w-[444px] h-[320px] sm:h-[420px] lg:h-[530px] rounded-[20px] overflow-hidden bg-[#F0EEED] dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shrink-0">
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 444px"
          className="object-cover object-center transition-all duration-300"
        />
      </div>
    </div>
  );
}