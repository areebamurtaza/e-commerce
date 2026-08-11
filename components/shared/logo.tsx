import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'text' | 'vector';
}

export function Logo({ className = '', variant = 'text' }: LogoProps) {
  if (variant === 'vector') {
    return (
      <Link
        href="/"
        className={`inline-flex items-center shrink-0 ${className}`}
        aria-label="SHOP.CO Homepage"
      >
        {/* Exact 160x22 SVG Vector Typography representing Integral CF 'SHOP.CO' */}
        <svg
          width="160"
          height="22"
          viewBox="0 0 160 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[160px] h-[22px] text-black fill-current object-contain"
        >
          <text
            x="0"
            y="18"
            fill="currentColor"
            fontFamily="var(--font-integral), sans-serif"
            fontSize="25"
            fontWeight="900"
            letterSpacing="-0.03em"
          >
            SHOP.CO
          </text>
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`inline-flex items-center shrink-0 w-[160px] h-[22px] ${className}`}
      aria-label="SHOP.CO Homepage"
    >
      {/* 
        Figma Typography Spec:
        Width: 160px | Height: 22px | Font: Integral CF | Weight: 700
        Size: 32px | Line-Height: 38px | Flex Align: Center
      */}
      <span className="font-integral font-bold text-[28px] xl:text-[32px] leading-[22px] xl:leading-[38px] text-black tracking-tighter uppercase select-none">
        SHOP.CO
      </span>
    </Link>
  );
}