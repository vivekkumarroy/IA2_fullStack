import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 ease-out focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50';

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-sm gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#1d5968] text-[#fffdf9] shadow-[0_7px_16px_rgba(29,89,104,0.2)] hover:-translate-y-0.5 hover:bg-[#174b58] focus:ring-[#1d5968]/25',
    secondary: 'bg-[#e8e4da] text-[#35434a] hover:bg-[#ddd7ca] focus:ring-[#6d7875]/20',
    danger: 'bg-[#a73e35] text-white shadow-[0_7px_16px_rgba(167,62,53,0.18)] hover:bg-[#8d332c] focus:ring-[#a73e35]/25',
    outline: 'border border-[#cfc9be] bg-[#fffdf9] text-[#35434a] hover:border-[#a9b2ad] hover:bg-[#f6f2ea] focus:ring-[#1d5968]/15',
    ghost: 'text-[#53616a] hover:bg-[#ede9df] hover:text-[#182935] focus:ring-[#1d5968]/15',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-1.5" />}
      {children}
    </button>
  );
};
