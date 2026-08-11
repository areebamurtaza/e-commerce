import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  className?: string;
  showScore?: boolean;
}

export function RatingStars({
  rating,
  maxStars = 5,
  className = '',
  showScore = true,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={`flex items-center gap-[8px] sm:gap-[11px] ${className}`}>
      <div
        className="flex items-center gap-[3px] sm:gap-[6.49px]"
        aria-label={`Rating: ${rating} out of ${maxStars}`}
      >
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="fill-[#FFC633] text-[#FFC633] w-[15px] h-[15px] sm:w-[18.5px] sm:h-[18.5px] xl:w-[22.58px] xl:h-[22.58px]"
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <StarHalf className="fill-[#FFC633] text-[#FFC633] w-[15px] h-[15px] sm:w-[18.5px] sm:h-[18.5px] xl:w-[22.58px] xl:h-[22.58px]" />
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="text-[#FFC633]/30 w-[15px] h-[15px] sm:w-[18.5px] sm:h-[18.5px] xl:w-[22.58px] xl:h-[22.58px]"
          />
        ))}
      </div>

      {/* Numeric Score Tag */}
      {showScore && (
        <span className="font-satoshi font-normal text-[11px] sm:text-[14px] text-black">
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-black/60">/5</span>
        </span>
      )}
    </div>
  );
}