import React from 'react';

interface ShelfLifeMarkProps {
  className?: string;
  title?: string;
}

/** A book opening into a leaf, representing a collection that stays alive through its readers. */
export const ShelfLifeMark: React.FC<ShelfLifeMarkProps> = ({ className = '', title = 'ShelfLife' }) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
    <path d="M32 12.5c-5.7-4.9-13.5-6.2-20.2-3.5v36.8c6.6-2.5 14.3-1.2 20.2 3.7V12.5Z" fill="#FFF8ED" />
    <path d="M32 12.5c5.7-4.9 13.5-6.2 20.2-3.5v36.8c-6.6-2.5-14.3-1.2-20.2 3.7V12.5Z" fill="#D8EEE7" />
    <path d="M32 17.8c-4.7-3.7-10.7-4.4-15.6-2.2M32 17.8c4.7-3.7 10.7-4.4 15.6-2.2" fill="none" stroke="#1D5968" strokeLinecap="round" strokeWidth="2.25" />
    <path d="M32 12.5v36.9" stroke="#1D5968" strokeLinecap="round" strokeWidth="2.25" />
    <path d="M33.2 11.9c.2-5.3 4.3-8.3 9.3-8.4.3 4.7-2.4 9.4-8.9 10.4" fill="#E87861" />
    <path d="M34.5 11.1c1.4-2.1 3.4-3.9 6-5.1" fill="none" stroke="#FFF8ED" strokeLinecap="round" strokeWidth="1.35" />
  </svg>
);
