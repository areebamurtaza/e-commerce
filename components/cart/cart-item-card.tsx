'use client';

import Image from 'next/image';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '@/types/cart';

interface CartItemCardProps {
  item: CartItem;
  isLast: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartItemCard({
  item,
  isLast,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemCardProps) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 py-4 sm:py-6 ${
        !isLast ? 'border-b border-black/10' : ''
      }`}
    >
      {/* Product Image Thumbnail */}
      <div className="relative w-[99px] sm:w-[124px] h-[99px] sm:h-[124px] bg-[#F0EEED] rounded-[8.66px] overflow-hidden shrink-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 99px, 124px"
          className="object-cover object-center"
        />
      </div>

      {/* Details & Actions Split Container */}
      <div className="flex-1 flex justify-between items-stretch h-[99px] sm:h-[124px] min-w-0">
        {/* Left Info Column */}
        <div className="flex flex-col justify-between min-w-0 pr-2">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h3 className="font-satoshi font-bold text-[16px] sm:text-[20px] leading-[22px] sm:leading-[27px] text-black truncate">
              {item.title}
            </h3>
            <p className="font-satoshi font-normal text-[12px] sm:text-[14px] text-black">
              Size: <span className="text-black/60">{item.size}</span>
            </p>
            <p className="font-satoshi font-normal text-[12px] sm:text-[14px] text-black">
              Color: <span className="text-black/60">{item.color}</span>
            </p>
          </div>

          <span className="font-satoshi font-bold text-[20px] sm:text-[24px] leading-[27px] sm:leading-[32px] text-black">
            ${item.price}
          </span>
        </div>

        {/* Right Action Column (Delete Icon + Quantity Pill) */}
        <div className="flex flex-col justify-between items-end shrink-0">
          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            className="text-[#FF3333] hover:text-rose-700 hover:scale-115 active:scale-90 transition-all duration-150 p-1 focus:outline-none cursor-pointer"
            aria-label={`Remove ${item.title} from cart`}
          >
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="w-[105px] sm:w-[126px] h-[36px] sm:h-[44px] bg-[#F0F0F0] rounded-[62px] flex items-center justify-between px-2.5 sm:px-3.5 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="p-1 rounded-full text-black hover:bg-black/10 active:scale-75 transition-all duration-150 disabled:opacity-30 focus:outline-none cursor-pointer"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="font-satoshi font-bold text-[14px] sm:text-[16px] text-black select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="p-1 rounded-full text-black hover:bg-black/10 active:scale-75 transition-all duration-150 focus:outline-none cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}