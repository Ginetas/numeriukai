import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="h-full w-72 bg-white shadow-xl p-4">{children}</div>
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <Button
        aria-label="Close sheet"
        className={cn('absolute right-4 top-4')}
        variant="ghost"
        size="icon"
        onClick={onClose}
      >
        ✕
      </Button>
    </div>
  );
}
