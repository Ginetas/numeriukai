'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import clsx from 'clsx';

export type ToastVariant = 'default' | 'destructive';

export interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  push: (message: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((message: Omit<ToastMessage, 'id'>) => {
    setToasts((current) => {
      const id = Date.now() + current.length;
      return [...current, { id, ...message }];
    });
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-3 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto w-full max-w-sm rounded-md border border-slate-200 bg-white p-4 shadow-lg',
            toast.variant === 'destructive' && 'border-red-200 bg-red-50'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{toast.title}</p>
              {toast.description && <p className="text-sm text-slate-600">{toast.description}</p>}
            </div>
            <button
              className="text-slate-500 hover:text-slate-800"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
