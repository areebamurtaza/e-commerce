'use client';

import { useState } from 'react';
import { Check, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { RatingStars } from '@/components/shared/rating-stars';
import { ProductColor, ProductSize } from '@/types/product';
import { useCartStore } from '@/lib/cart-store';

interface ProductInfoProps {
  productId?: string;
  title: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  description: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  heroImage?: string;
}

export function ProductInfo({
  productId = '1',
  title,
  rating,
  price,
  originalPrice,
  discountPercentage,
  description,
  colors,
  sizes,
  heroImage = '/images/pd1.png',
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    colors[0] || { name: 'Olive', hex: '#4F4631' }
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize>('Large');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrement = () => setQuantity((prev) => prev + 1);

  const handleAddToCart = () => {
    addItemToCart({
      productId,
      title,
      image: heroImage,
      size: selectedSize,
      color: selectedColor.name,
      price,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-[600px] min-w-0 flex-1 overflow-hidden">
      {/* Title */}
      <h1 className="font-integral font-bold text-[clamp(1.2rem,2vw,2.25rem)] leading-[1.1] text-black tracking-tight uppercase mb-3">
        {title}
      </h1>

      {/* Rating Row */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <RatingStars rating={rating} size={18} showScore={false} />
        <span className="font-satoshi font-normal text-[14px] sm:text-[16px] text-black">
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-black/60">/5</span>
        </span>
      </div>

      {/* Pricing & Discount Badge */}
      <div className="flex items-center gap-3 mb-3.5">
        <span className="font-satoshi font-bold text-[22px] sm:text-[28px] xl:text-[32px] leading-none text-black">
          ${price}
        </span>
        {originalPrice && (
          <span className="font-satoshi font-bold text-[22px] sm:text-[28px] xl:text-[32px] leading-none text-black/30 line-through">
            ${originalPrice}
          </span>
        )}
        {discountPercentage && (
          <span className="bg-[#FF3333]/10 text-[#FF3333] font-satoshi font-medium text-[12px] sm:text-[14px] px-3 py-1 rounded-[62px]">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Description */}
      <p className="font-satoshi font-normal text-[13px] sm:text-[15px] xl:text-[16px] leading-[20px] sm:leading-[22px] text-black/60 pb-5 border-b border-black/10 mb-5">
        {description}
      </p>

      {/* Color Swatches */}
      <div className="pb-5 border-b border-black/10 mb-5">
        <span className="font-satoshi font-normal text-[14px] sm:text-[15px] text-black/60 block mb-3">
          Select Colors
        </span>
        <div className="flex items-center gap-3.5">
          {colors.map((color) => {
            const isSelected = selectedColor.hex === color.hex;
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select color ${color.name}`}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 focus:outline-none cursor-pointer"
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className="pb-5 border-b border-black/10 mb-5">
        <span className="font-satoshi font-normal text-[14px] sm:text-[15px] text-black/60 block mb-3">
          Choose Size
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap w-full overflow-x-auto no-scrollbar">
          {sizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-[38px] sm:h-[44px] px-3.5 sm:px-5 rounded-[62px] font-satoshi text-[12px] sm:text-[14px] xl:text-[15px] whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
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

      {/* Action Row */}
      <div className="flex items-center gap-2.5 sm:gap-4 w-full">
        <div className="w-[100px] sm:w-[130px] xl:w-[150px] h-[42px] sm:h-[48px] bg-[#F0F0F0] rounded-[62px] flex items-center justify-between px-3 sm:px-4 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            className="p-1 text-black hover:opacity-60 transition-opacity focus:outline-none disabled:opacity-30 cursor-pointer"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={16} className="sm:w-5 sm:h-5" />
          </button>
          <span className="font-satoshi font-medium text-[14px] sm:text-[16px] text-black">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            className="p-1 text-black hover:opacity-60 transition-opacity focus:outline-none cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 h-[42px] sm:h-[48px] font-satoshi font-medium text-[13px] sm:text-[15px] xl:text-[16px] rounded-[62px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            isAdded
              ? 'bg-[#01AB31] text-white'
              : 'bg-black text-white hover:bg-black/80 active:scale-98'
          }`}
        >
          {isAdded ? (
            <>
              <CheckCircle2 size={18} />
              <span>Added to Cart!</span>
            </>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}