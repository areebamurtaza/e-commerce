'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'COMPANY',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Features', href: '/features' },
      { label: 'Works', href: '/works' },
      { label: 'Career', href: '/career' },
    ],
  },
  {
    title: 'HELP',
    links: [
      { label: 'Customer Support', href: '/support' },
      { label: 'Delivery Details', href: '/delivery' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
  {
    title: 'FAQ',
    links: [
      { label: 'Account', href: '/account' },
      { label: 'Manage Deliveries', href: '/deliveries' },
      { label: 'Orders', href: '/orders' },
      { label: 'Payments', href: '/payments' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Free eBooks', href: '/ebooks' },
      { label: 'Development Tutorial', href: '/tutorials' },
      { label: 'How to - Blog', href: '/blog' },
      { label: 'Youtube Playlist', href: '/youtube' },
    ],
  },
];

function TwitterIcon({ className = 'w-[11.17px] h-[9.03px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.901 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-[6.32px] h-[12.17px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-[13.55px] h-[13.55px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function GithubIcon({ className = 'w-[12.96px] h-[12.65px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.09.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

interface DirectPaymentImageProps {
  src: string;
  alt: string;
}

function DirectPaymentImage({ src, alt }: DirectPaymentImageProps) {
  const [hasError, setHasError] = useState<boolean>(false);

  if (hasError) {
    return (
      <div className="w-[46.61px] h-[30.03px] bg-white rounded-[5.38px] border border-[#D6DCE5] shadow-[0px_4.48px_8.96px_rgba(183,183,183,0.08)] flex items-center justify-center p-1 shrink-0">
        <span className="font-satoshi font-bold text-[9px] text-black/70 uppercase text-center leading-none select-none">
          {alt.slice(0, 4)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-[46.61px] h-[30.03px] shrink-0 overflow-hidden rounded-[5.38px] flex items-center justify-center">
      <Image
        src={src}
        alt={alt}
        width={46.61}
        height={30.03}
        unoptimized
        className="w-[46.61px] h-[30.03px] object-cover shrink-0 scale-[1.18] transition-transform duration-200"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function Footer() {
  return (
    /* 
      Footer Mobile Specifications (image_269559.png):
      Padding top: pt-[160px] mobile / pt-[140px] desktop | Background: #F0F0F0
    */
    <footer className="w-full bg-[#F0F0F0] pt-[160px] sm:pt-[140px] pb-10 sm:pb-12 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[100px]">
        
        <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-6 xl:gap-[50px] pb-8 lg:pb-[50px]">
          
          {/* Brand Column */}
          <div className="w-full lg:w-[248px] flex flex-col items-start shrink-0">
            <Link href="/" className="inline-flex items-center mb-[12px] lg:mb-[25px]">
              <span className="font-integral font-bold text-[28px] lg:text-[33.45px] leading-[30px] lg:leading-[40px] text-black tracking-tighter uppercase select-none">
                SHOP.CO
              </span>
            </Link>

            <p className="font-satoshi font-normal text-[14px] leading-[22px] text-black/60 w-full lg:w-[248px] mb-[20px] lg:mb-[35px]">
              We have clothes that suits your style and which you&apos;re proud to wear. From women to men.
            </p>

            {/* Social Circles */}
            <div className="flex items-center gap-[12px] mb-2 lg:mb-0">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[28px] h-[28px] rounded-full bg-white border border-black/20 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[28px] h-[28px] rounded-full bg-black flex items-center justify-center text-white hover:bg-black/80 transition-opacity duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[28px] h-[28px] rounded-full bg-white border border-black/20 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[28px] h-[28px] rounded-full bg-white border border-black/20 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
            </div>
          </div>

          {/* 
            Navigation Grid Mobile Layout (image_269559.png):
            2x2 grid on mobile (COMPANY & HELP on row 1, FAQ & RESOURCES on row 2)
          */}
          <div className="w-full lg:w-auto flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 xl:gap-[40px] justify-between">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col items-start w-full">
                <h3 className="font-satoshi font-medium text-[14px] sm:text-[16px] leading-[18px] text-black tracking-[3px] uppercase mb-[14px] sm:mb-[26px] whitespace-nowrap">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-[10px] sm:gap-[16px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-satoshi font-normal text-[14px] sm:text-[16px] leading-[19px] text-black/60 hover:text-black transition-colors whitespace-nowrap"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Divider */}
        <div className="max-w-[1240px] mx-auto w-full h-[1px] bg-black/10 mb-[16px] lg:mb-[25px]" />

        {/* Bottom Bar: Stacked Centered Copyright & Payment Method Icons on Mobile */}
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-satoshi font-normal text-[14px] leading-[19px] text-black/40 text-center sm:text-left whitespace-nowrap">
            Shop.co © 2000-2026, All Rights Reserved
          </p>

          <div className="flex items-center gap-[12px] flex-wrap justify-center shrink-0">
            <DirectPaymentImage src="/images/visa.png" alt="Visa" />
            <DirectPaymentImage src="/images/mastercard.png" alt="Mastercard" />
            <DirectPaymentImage src="/images/paypal.png" alt="PayPal" />
            <DirectPaymentImage src="/images/applepay.png" alt="Apple Pay" />
            <DirectPaymentImage src="/images/gpay.png" alt="Google Pay" />
          </div>
        </div>

      </div>
    </footer>
  );
}