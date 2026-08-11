interface PriceTagProps {
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  className?: string;
}

export function PriceTag({
  price,
  originalPrice,
  discountPercentage,
  className = '',
}: PriceTagProps) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <span className="font-satoshi font-bold text-[20px] sm:text-[24px] leading-[27px] sm:leading-[32px] text-black">
        ${price}
      </span>

      {originalPrice && (
        <span className="font-satoshi font-bold text-[20px] sm:text-[24px] leading-[27px] sm:leading-[32px] text-black/40 line-through">
          ${originalPrice}
        </span>
      )}

      {discountPercentage && (
        <span className="bg-[#FF3333]/10 text-[#FF3333] font-satoshi font-medium text-[10px] sm:text-[12px] leading-[14px] sm:leading-[16px] px-2.5 py-1 rounded-full">
          -{discountPercentage}%
        </span>
      )}
    </div>
  );
}