import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  className?: string;
  showScore?: boolean;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size,
  className = '',
  showScore = true,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

  // If dynamic size prop is provided, apply precise inline style, otherwise use default responsive classes
  const starDimensions = size
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  const defaultClasses = size
    ? ''
    : 'w-[15px] h-[15px] sm:w-[18.5px] sm:h-[18.5px] xl:w-[22.58px] xl:h-[22.58px]';

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
            style={starDimensions}
            className={`fill-[#FFC633] text-[#FFC633] ${defaultClasses}`}
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <StarHalf
            style={starDimensions}
            className={`fill-[#FFC633] text-[#FFC633] ${defaultClasses}`}
          />
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            style={starDimensions}
            className={`text-[#FFC633]/30 ${defaultClasses}`}
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