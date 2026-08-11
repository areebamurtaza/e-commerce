'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  heroImage: string;
  thumbnails: string[];
  title: string;
}

export function ProductGallery({ heroImage, thumbnails, title }: ProductGalleryProps) {
  const allImages = [heroImage, ...thumbnails];
  const [selectedImage, setSelectedImage] = useState<string>(heroImage);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3.5 lg:h-[530px] w-full max-w-[610px] shrink-0">
      {/* Thumbnail Column - Exact 530px height matching 3 items + gaps */}
      <div className="flex lg:flex-col justify-between gap-3.5 shrink-0 overflow-x-auto lg:overflow-visible lg:h-[530px] pb-2 lg:pb-0">
        {allImages.slice(0, 3).map((img, idx) => {
          const isSelected = selectedImage === img;
          return (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-[111px] sm:w-[152px] h-[106px] lg:h-[167px] rounded-[20px] overflow-hidden bg-[#F0EEED] border transition-all duration-200 shrink-0 cursor-pointer ${
                isSelected ? 'border-black ring-1 ring-black' : 'border-transparent hover:opacity-80'
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail view ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 111px, 152px"
                className="object-cover object-center"
              />
            </button>
          );
        })}
      </div>

      {/* Main Hero Display Container */}
      <div className="relative w-full lg:w-[444px] h-[290px] lg:h-[530px] rounded-[20px] overflow-hidden bg-[#F0EEED] shrink-0">
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