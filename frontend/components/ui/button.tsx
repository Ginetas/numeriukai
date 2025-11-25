import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'destructive';
}

export function Button({
  className,
  children,
  variant = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:pointer-events-none';
  const variants: Record<ButtonProps['variant'], string> = {
    default: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400',
    outline:
      'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400',
    ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-700',
  };

  return (
    <button type={type} className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
