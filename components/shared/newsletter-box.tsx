'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { newsletterSchema, NewsletterFormValues } from '@/schemas/newsletter';

export function NewsletterBox() {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('Newsletter Subscription:', data.email);
    setIsSubmitted(true);
    reset();
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    /* 
      Figma Frame 45 Mobile Specifications (image_269576.png):
      Padding: px-6 py-8 mobile / px-16 py-9 desktop | Radius: 20px | Background: #000000
    */
    <div className="relative z-20 max-w-[1440px] w-full mx-auto px-4 md:px-8 xl:px-[100px] -mb-[140px] sm:-mb-[120px] lg:-mb-[90px]">
      <div className="w-full max-w-[1240px] mx-auto bg-black rounded-[20px] px-6 sm:px-8 lg:px-[64px] py-7 lg:py-[36px] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-[60px] shadow-xl overflow-hidden box-border">
        
        {/* 
          Headline Mobile Wrap (image_269576.png):
          Integral CF Bold 32px on mobile | 3 lines: "STAY UPTO DATE", "ABOUT OUR", "LATEST OFFERS"
        */}
        <h2 className="font-integral font-bold text-[32px] sm:text-[36px] lg:text-[40px] leading-[35px] sm:leading-[40px] lg:leading-[45px] text-white max-w-[551px] tracking-tight text-left shrink-0 uppercase">
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h2>

        {/* Mobile Form Box: Full width inputs */}
        <div className="w-full max-w-[349px] lg:w-[349px] flex flex-col gap-[12px] sm:gap-[14px] shrink-0 box-border">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[12px] sm:gap-[14px] w-full">
              
              <div className="flex flex-col gap-1 w-full">
                <div className="relative w-full h-[42px] sm:h-[48px] bg-white rounded-[62px] px-[16px] py-[10px] sm:py-[12px] flex items-center gap-[12px] box-border">
                  <Mail className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] text-black/40 shrink-0" aria-hidden="true" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full bg-transparent font-satoshi font-normal text-[14px] sm:text-[16px] leading-[22px] text-black placeholder:text-black/40 focus:outline-none"
                    aria-label="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <span className="font-satoshi text-[12px] text-[#FF3333] pl-4">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[42px] sm:h-[46px] bg-white text-black font-satoshi font-medium text-[14px] sm:text-[16px] leading-[22px] rounded-[62px] flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-70 shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  'Subscribe to Newsletter'
                )}
              </button>

            </form>
          ) : (
            <div className="w-full h-[100px] bg-white/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center text-white gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#01AB31]" />
              <p className="font-satoshi font-medium text-[14px] leading-[18px]">
                Thank you for subscribing!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}