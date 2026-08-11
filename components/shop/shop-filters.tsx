'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronRight, Check } from 'lucide-react';
import { CATALOG_COLORS, CATALOG_SIZES } from '@/lib/mock-data';

const CATEGORIES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];

const DRESS_STYLES = ['Casual', 'Formal', 'Party', 'Gym'];

interface ShopFiltersProps {
  onApplyMobileClose?: () => void;
}

export function ShopFilters({ onApplyMobileClose }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentStyle = searchParams.get('style') || '';
  const currentColor = searchParams.get('color') || '';
  const currentSize = searchParams.get('size') || '';
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || 200;

  const [priceRange, setPriceRange] = useState<number>(currentMaxPrice);
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [selectedSize, setSelectedSize] = useState<string>(currentSize);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');

    if (selectedStyle) params.set('style', selectedStyle);
    else params.delete('style');

    if (selectedColor) params.set('color', selectedColor);
    else params.delete('color');

    if (selectedSize) params.set('size', selectedSize);
    else params.delete('size');

    params.set('minPrice', '50');
    params.set('maxPrice', priceRange.toString());

    router.push(`/shop?${params.toString()}`);
    if (onApplyMobileClose) onApplyMobileClose();
  };

  return (
    <aside className="w-full bg-white rounded-[20px] border border-black/10 p-5 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-black/10">
        <h2 className="font-satoshi font-bold text-[20px] leading-[27px] text-black">
          Filters
        </h2>
        <SlidersHorizontal size={20} className="text-black/40 rotate-90" />
      </div>

      {/* Category List */}
      <div className="flex flex-col gap-3.5 pb-6 border-b border-black/10">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? '' : cat)}
              className={`flex items-center justify-between text-left font-satoshi text-[16px] leading-[22px] transition-colors cursor-pointer ${
                isSelected ? 'font-bold text-black' : 'text-black/60 hover:text-black'
              }`}
            >
              <span>{cat}</span>
              <ChevronRight size={16} className="text-black/40" />
            </button>
          );
        })}
      </div>

      {/* Price Slider ($50 - $200) */}
      <div className="flex flex-col gap-3 pb-6 border-b border-black/10">
        <div className="flex items-center justify-between">
          <span className="font-satoshi font-bold text-[20px] leading-[27px] text-black">
            Price
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="300"
          step="10"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
        />

        <div className="flex items-center justify-between font-satoshi font-medium text-[14px] text-black">
          <span>$50</span>
          <span>${priceRange}</span>
        </div>
      </div>

      {/* Colors Grid (Figma 37px Swatches) */}
      <div className="flex flex-col gap-3.5 pb-6 border-b border-black/10">
        <span className="font-satoshi font-bold text-[20px] leading-[27px] text-black">
          Colors
        </span>
        <div className="grid grid-cols-5 gap-3 pt-1">
          {CATALOG_COLORS.map((col) => {
            const isSelected = selectedColor.toLowerCase() === col.name.toLowerCase();
            return (
              <button
                key={col.name}
                type="button"
                onClick={() => setSelectedColor(isSelected ? '' : col.name)}
                style={{ backgroundColor: col.hex }}
                aria-label={`Filter by ${col.name}`}
                className={`w-[37px] h-[37px] rounded-full flex items-center justify-center border transition-transform active:scale-95 cursor-pointer ${
                  col.hex === '#FFFFFF' ? 'border-black/20' : 'border-transparent'
                }`}
              >
                {isSelected && (
                  <Check
                    size={16}
                    className={col.hex === '#FFFFFF' ? 'text-black' : 'text-white'}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Pills (9 Size Options) */}
      <div className="flex flex-col gap-3.5 pb-6 border-b border-black/10">
        <span className="font-satoshi font-bold text-[20px] leading-[27px] text-black">
          Size
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {CATALOG_SIZES.map((size) => {
            const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(isSelected ? '' : size)}
                className={`h-[39px] px-5 rounded-[62px] font-satoshi text-[14px] leading-[19px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white font-medium'
                    : 'bg-[#F0F0F0] text-black/60 font-normal hover:bg-black/10'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dress Style List */}
      <div className="flex flex-col gap-3.5 pb-6">
        <span className="font-satoshi font-bold text-[20px] leading-[27px] text-black">
          Dress Style
        </span>
        {DRESS_STYLES.map((style) => {
          const isSelected = selectedStyle.toLowerCase() === style.toLowerCase();
          return (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(isSelected ? '' : style)}
              className={`flex items-center justify-between text-left font-satoshi text-[16px] leading-[22px] transition-colors cursor-pointer ${
                isSelected ? 'font-bold text-black' : 'text-black/60 hover:text-black'
              }`}
            >
              <span>{style}</span>
              <ChevronRight size={16} className="text-black/40" />
            </button>
          );
        })}
      </div>

      {/* Apply Filter CTA */}
      <button
        type="button"
        onClick={applyFilters}
        className="w-full h-[48px] bg-black text-white font-satoshi font-medium text-[14px] leading-[19px] rounded-[62px] hover:bg-black/80 active:scale-98 transition-all cursor-pointer"
      >
        Apply Filter
      </button>
    </aside>
  );
}