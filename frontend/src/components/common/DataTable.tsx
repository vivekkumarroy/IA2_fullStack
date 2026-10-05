import React from 'react';
import { Inbox } from 'lucide-react';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  className = '',
}: DataTableProps<T>): JSX.Element {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-[#d8d3c9] bg-[#fffdf9] shadow-[0_10px_30px_rgba(39,49,53,0.055)] ${className}`}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#d8d3c9] bg-[#f0ede5] text-[11px] font-bold uppercase tracking-[0.11em] text-[#65716f]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-5 py-4 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e0d7] bg-[#fffdf9]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-14 text-center text-[#66717a]">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Spinner size="md" />
                  <span className="text-sm font-medium">Retrieving records…</span>
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-14 text-center"
              >
                <Inbox className="mx-auto h-7 w-7 text-[#9ba3a1]" />
                <p className="mt-3 text-sm text-[#66717a]">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const key = rowKey(row);
              const isClickable = Boolean(onRowClick);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                  isClickable ? 'cursor-pointer hover:bg-[#edf4f1]' : 'hover:bg-[#faf8f3]'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={`${key}-${col.key}`}
                      className={`whitespace-nowrap px-5 py-4 text-[#4f5c61] ${col.className || ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
