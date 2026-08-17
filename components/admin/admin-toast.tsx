// components/admin/admin-toast.tsx
'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface AdminToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminToastProps {
  toast: AdminToastState | null;
  onDismiss: () => void;
  duration?: number;
}

export function AdminToast({ toast, onDismiss, duration = 4000 }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 text-xs font-admin font-medium backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : isError
            ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            : 'bg-white/95 dark:bg-zinc-900/90 border-black/10 dark:border-zinc-800 text-black dark:text-white'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          ) : isError ? (
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400" />
          ) : (
            <Info size={18} className="text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <div className="flex-1 leading-relaxed">
          <p className="font-bold text-[13px] mb-0.5">
            {isSuccess ? 'Action Completed' : isError ? 'Action Failed' : 'Notification'}
          </p>
          <p className="text-[12px] opacity-90">{toast.message}</p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
