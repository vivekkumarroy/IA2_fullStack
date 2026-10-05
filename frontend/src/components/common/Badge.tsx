import React from 'react';

export type BadgeVariant = 'blue' | 'green' | 'red' | 'amber' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          variant === 'red'
            ? 'bg-rose-500'
            : variant === 'green'
            ? 'bg-emerald-500'
            : variant === 'blue'
            ? 'bg-blue-500'
            : variant === 'amber'
            ? 'bg-amber-500'
            : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
};
