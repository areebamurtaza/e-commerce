'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/shared/scroll-reveal';

interface FourPointStarProps {
  className?: string;
}

function FourPointStar({ className }: FourPointStarProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative w-full bg-[#F2F0F1] overflow-hidden pt-8 sm:pt-0 lg:h-[clamp(520px,46vw,663px)] flex items-center">
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 lg:px-[clamp(1.5rem,5vw,6.25rem)] h-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full items-center">
          
          {/* Left Column: Heading, Subtext, CTA & Statistics */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 pt-4 sm:pt-8 lg:pt-12 pb-4 sm:pb-8 lg:pb-12 justify-center">
            
            <ScrollReveal direction="up" delay={50} distance={20}>
              {/* Fluid Heading: Clamps between 36px and 64px */}
              <h1 className="font-integral font-bold text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.0] text-black max-w-[577px] tracking-tight uppercase">
                FIND CLOTHES THAT MATCHES YOUR STYLE
              </h1>

              {/* Subtext */}
              <p className="font-satoshi font-normal text-[clamp(0.875rem,1.1vw,1rem)] leading-[1.38] text-black/60 max-w-[545px] mt-[12px] sm:mt-[16px] lg:mt-[32px] tracking-[-0.01em]">
                Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
              </p>

              {/* CTA Button */}
              <Link
                href="/shop"
                className="w-full sm:w-[210px] h-[52px] bg-black text-white rounded-[62px] font-satoshi font-medium text-[16px] leading-[22px] flex items-center justify-center mt-[24px] sm:mt-[20px] lg:mt-[32px] hover:bg-black/80 transition-all duration-200 active:scale-95 shadow-sm shrink-0"
              >
                Shop Now
              </Link>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150} distance={20} className="w-full">

            {/* Statistics Section: Mobile 2-row layout vs Desktop 1-row layout */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-[clamp(1rem,2vw,2rem)] mt-[28px] lg:mt-[48px]">
              
              {/* Top Row on Mobile: Stat 1 & Stat 2 separated by vertical divider */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 sm:gap-[clamp(1rem,2vw,2rem)]">
                <div className="flex flex-col items-start shrink-0">
                  <span className="font-satoshi font-bold text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.2] text-black">
                    200+
                  </span>
                  <span className="font-satoshi font-normal text-[clamp(0.75rem,1vw,1rem)] leading-[1.38] text-black/60 whitespace-nowrap">
                    International Brands
                  </span>
                </div>

                <div className="h-[48px] lg:h-[74px] w-[1px] bg-black/10 shrink-0" />

                <div className="flex flex-col items-start shrink-0">
                  <span className="font-satoshi font-bold text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.2] text-black">
                    2,000+
                  </span>
                  <span className="font-satoshi font-normal text-[clamp(0.75rem,1vw,1rem)] leading-[1.38] text-black/60 whitespace-nowrap">
                    High-Quality Products
                  </span>
                </div>
              </div>

              {/* Desktop Second Divider (hidden on mobile) */}
              <div className="hidden sm:block h-[48px] lg:h-[74px] w-[1px] bg-black/10 shrink-0" />

              {/* Bottom Row on Mobile: Stat 3 centered underneath */}
              <div className="flex flex-col items-center sm:items-start shrink-0 text-center sm:text-left">
                <span className="font-satoshi font-bold text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.2] text-black">
                  30,000+
                </span>
                <span className="font-satoshi font-normal text-[clamp(0.75rem,1vw,1rem)] leading-[1.38] text-black/60 whitespace-nowrap">
                  Happy Customers
                </span>
              </div>

            </div>
            </ScrollReveal>

          </div>
 
          {/* Right Column: Hero Couple Photography */}
          <div className="relative lg:absolute lg:right-0 lg:bottom-0 lg:top-0 w-full lg:w-[48%] lg:max-w-[660px] h-[400px] sm:h-[500px] lg:h-full z-0 flex items-end justify-center pointer-events-none mt-2 lg:mt-0">
            <ScrollReveal direction="right" delay={150} duration={1100} distance={36} className="w-full h-full relative flex items-end justify-center">
              <div className="relative w-full h-full">
                <Image
                  src="/images/hero1.png"
                  alt="Trendy Fashionable Couple Posing"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain object-bottom lg:object-bottom"
                />
              </div>

              {/* Top Right Big Star */}
              <FourPointStar className="absolute top-[20px] lg:top-[50px] right-[20px] lg:right-[60px] xl:right-[80px] w-[56px] h-[56px] sm:w-[76px] sm:h-[76px] lg:w-[104px] lg:h-[104px] text-black z-20 pointer-events-none animate-float-subtle" />

              {/* Middle Left Small Star */}
              <FourPointStar className="absolute top-[140px] lg:top-[240px] left-[10px] lg:left-[-10px] xl:left-[20px] w-[32px] h-[32px] sm:w-[44px] sm:h-[44px] lg:w-[56px] lg:h-[56px] text-black z-20 pointer-events-none animate-star-twinkle" />
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}