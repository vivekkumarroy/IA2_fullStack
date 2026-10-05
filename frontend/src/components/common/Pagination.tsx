import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageMeta } from '../../types/api';
import { Button } from './Button';

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  className = '',
}) => {
  const { page, totalPages, total, limit, hasPrev, hasNext } = meta;

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between border-x border-b border-[#d8d3c9] bg-[#f7f4ed] px-4 py-3.5 sm:px-6 ${className}`}
    >
      <div className="hidden sm:block">
        <p className="text-sm text-[#65716f]">
          Showing <span className="font-bold text-[#182935]">{startItem}</span> to{' '}
          <span className="font-bold text-[#182935]">{endItem}</span> of{' '}
          <span className="font-bold text-[#182935]">{total}</span> records
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-slate-600 sm:hidden">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </nav>
  );
};
