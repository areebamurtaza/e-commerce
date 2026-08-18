// components/product/product-info.tsx
'use client';

import { useState, useMemo } from 'react';
import { Check, Minus, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { RatingStars } from '@/components/shared/rating-stars';
import { useCartStore } from '@/lib/cart-store';

export interface ProductVariantData {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  priceOffset: number;
  stockQuantity: number;
}

export interface ColorOption {
  name: string;
  hex: string;
}

interface ProductInfoProps {
  productId: string;
  title: string;
  rating: number;
  price: number;
  discountPercentage?: number;
  description: string;
  colors: ColorOption[];
  sizes: string[];
  variants: ProductVariantData[];
  heroImage?: string;
}

export function ProductInfo({
  productId,
  title,
  rating,
  price,
  discountPercentage = 0,
  description,
  colors = [],
  sizes = [],
  variants = [],
  heroImage = '/images/pd1.png',
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    colors[0] || { name: 'Black', hex: '#000000' }
  );
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  // 1. Resolve Active Variant from Selection Matrix
  const activeVariant = useMemo(() => {
    const matched = variants.find(
      (v) =>
        v.colorHex.toLowerCase() === selectedColor.hex.toLowerCase() &&
        v.size.toLowerCase() === selectedSize.toLowerCase()
    );
    return matched || variants[0] || null;
  }, [variants, selectedColor, selectedSize]);

  // 2. Pricing Calculations with Variant Price Offsets
  const basePlusOffset = price + (activeVariant?.priceOffset || 0);
  const hasDiscount = discountPercentage > 0;
  const finalUnitPrice = hasDiscount
    ? basePlusOffset * (1 - discountPercentage / 100)
    : basePlusOffset;

  const isOutOfStock = !activeVariant || activeVariant.stockQuantity <= 0;

  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrement = () => {
    if (activeVariant && quantity >= activeVariant.stockQuantity) return;
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !activeVariant) return;

    // Fixed: Passing strictly Omit<CartItem, 'id'> (no explicit 'id' property)
    addItemToCart({
      variantId: activeVariant.id,
      productId,
      title,
      image: heroImage,
      size: selectedSize,
      color: selectedColor.name,
      price: finalUnitPrice,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-[600px] min-w-0 flex-1 overflow-hidden font-satoshi text-black dark:text-white">
      {/* Title */}
      <h1 className="font-integral font-bold text-[clamp(1.5rem,2.5vw,2.5rem)] leading-[1.1] text-black dark:text-white tracking-tight uppercase mb-3">
        {title}
      </h1>

      {/* Rating Row */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <RatingStars rating={rating} size={18} showScore={false} />
        <span className="font-satoshi font-normal text-[14px] sm:text-[16px] text-black dark:text-white">
          <span className="font-bold">{rating.toFixed(1)}</span>
          <span className="text-black/60 dark:text-zinc-400">/5</span>
        </span>
      </div>

      {/* Pricing & Discount Badge */}
      <div className="flex items-center gap-3 mb-3.5">
        <span className="font-satoshi font-bold text-[24px] sm:text-[28px] xl:text-[32px] leading-none text-black dark:text-white">
          ${finalUnitPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <>
            <span className="font-satoshi font-bold text-[24px] sm:text-[28px] xl:text-[32px] leading-none text-black/30 dark:text-zinc-600 line-through">
              ${basePlusOffset.toFixed(2)}
            </span>
            <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-satoshi font-bold text-[12px] sm:text-[14px] px-3 py-1 rounded-[62px]">
              -{discountPercentage}%
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="font-satoshi font-normal text-[14px] sm:text-[15px] leading-[22px] text-black/60 dark:text-zinc-300 pb-5 border-b border-black/10 dark:border-zinc-800 mb-5">
        {description}
      </p>

      {/* Color Swatches */}
      {colors.length > 0 && (
        <div className="pb-5 border-b border-black/10 dark:border-zinc-800 mb-5">
          <span className="font-satoshi font-medium text-[14px] sm:text-[15px] text-black/60 dark:text-zinc-400 block mb-3">
            Select Colors: <span className="font-bold text-black dark:text-white">{selectedColor.name}</span>
          </span>
          <div className="flex items-center gap-3.5">
            {colors.map((color) => {
              const isSelected = selectedColor.hex.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select color ${color.name}`}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-90 focus:outline-none cursor-pointer border shadow-xs ${
                    color.hex.toUpperCase() === '#FFFFFF'
                      ? 'border-black/20 dark:border-zinc-700'
                      : 'border-transparent'
                  }`}
                >
                  {isSelected && (
                    <Check
                      className={`w-4 h-4 stroke-[3] animate-in zoom-in-75 duration-150 ${
                        color.hex.toUpperCase() === '#FFFFFF' ? 'text-black' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="pb-5 border-b border-black/10 dark:border-zinc-800 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-satoshi font-medium text-[14px] sm:text-[15px] text-black/60 dark:text-zinc-400">
              Choose Size
            </span>
            {activeVariant && (
              <span
                className={`text-xs font-bold transition-colors ${
                  activeVariant.stockQuantity < 5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-black/40 dark:text-zinc-500'
                }`}
              >
                {activeVariant.stockQuantity > 0
                  ? `${activeVariant.stockQuantity} in stock`
                  : 'Out of stock'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full">
            {sizes.map((size) => {
              const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`h-[42px] px-5 rounded-[62px] font-satoshi text-[14px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                      : 'bg-[#F0F0F0] dark:bg-zinc-900 text-black/60 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-zinc-800'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Alert Warning */}
      {isOutOfStock && (
        <div className="mb-4 p-3 rounded-[12px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in zoom-in-95 duration-200">
          <AlertCircle size={16} className="shrink-0" />
          <span>The selected size and color combination is currently sold out.</span>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        {/* Quantity Stepper */}
        <div className="w-[120px] sm:w-[140px] h-[48px] bg-[#F0F0F0] dark:bg-zinc-900 rounded-[62px] flex items-center justify-between px-4 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={handleDecrement}
            className="p-1.5 rounded-full text-black dark:text-white hover:bg-black/10 dark:hover:bg-zinc-800 active:scale-75 transition-all duration-150 focus:outline-none disabled:opacity-30 cursor-pointer"
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="font-satoshi font-bold text-[15px] sm:text-[16px] text-black dark:text-white select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            className="p-1.5 rounded-full text-black dark:text-white hover:bg-black/10 dark:hover:bg-zinc-800 active:scale-75 transition-all duration-150 focus:outline-none disabled:opacity-30 cursor-pointer"
            disabled={
              isOutOfStock ||
              (activeVariant ? quantity >= activeVariant.stockQuantity : false)
            }
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`flex-1 h-[48px] font-satoshi font-bold text-[14px] sm:text-[15px] rounded-[62px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdded
              ? 'bg-emerald-600 text-white animate-badge-pop'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 active:scale-95'
          }`}
        >
          {isAdded ? (
            <>
              <CheckCircle2 size={18} className="animate-in zoom-in duration-200" />
              <span>Added to Cart!</span>
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}