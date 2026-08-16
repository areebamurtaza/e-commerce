// components/checkout/reservation-timer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface ReservationTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(
    null
  );
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.minutes < 5 && !isExpired;

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`flex items-center justify-between rounded-[16px] p-3.5 sm:p-4 text-xs sm:text-sm font-medium transition-all ${
        isExpired
          ? 'bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
          : isUrgent
          ? 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300 animate-pulse'
          : 'bg-zinc-100 dark:bg-zinc-800/80 border border-black/10 dark:border-zinc-700 text-black/80 dark:text-zinc-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {isExpired || isUrgent ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        ) : (
          <Timer className="h-4 w-4 shrink-0 text-black/60 dark:text-zinc-400" />
        )}
        <span>
          {isExpired
            ? 'Your 30-minute stock reservation has expired.'
            : 'Items in your cart are reserved for:'}
        </span>
      </div>

      <div className="font-mono font-bold text-sm tracking-wider">
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}