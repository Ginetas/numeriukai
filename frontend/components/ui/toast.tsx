'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { cn } from '@/lib/utils';

export type ToastMessage = { id: number; title: string; description?: string; variant?: 'default' | 'destructive' };

const ToastContext = createContext<{
  toasts: ToastMessage[];
  push: (toast: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: number) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'rounded-md border border-slate-200 bg-white p-4 shadow-lg',
              toast.variant === 'destructive' && 'border-red-200 bg-red-50 text-red-700'
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{toast.title}</p>
              <button onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="text-slate-500">
                ✕
              </button>
            </div>
            {toast.description && <p className="text-sm text-slate-600">{toast.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
