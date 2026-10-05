import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, RotateCcw, BookCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { PopulatedBorrowRecord } from '../types/models';
import { Column, DataTable } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAsync } from '../hooks/useAsync';
import { fetchMemberHistory, returnBook } from '../api/borrow';
import { formatDate, isOverdue, getDaysOverdue } from '../utils/date';
import { getErrorMessage } from '../utils/errors';

export const MemberHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchHistoryFn = useCallback(() => {
    if (!id) return Promise.reject(new Error('Member ID is missing in route'));
    return fetchMemberHistory(id);
  }, [id]);

  const { data: historyData, loading, error, reload } = useAsync(
    fetchHistoryFn,
    [fetchHistoryFn]
  );

  const memberInfo = historyData?.meta?.member;
  const records = useMemo(() => historyData?.data || [], [historyData]);

  // Handle return book action
  const handleReturn = useCallback(async (borrowId: string) => {
    try {
      setReturningId(borrowId);
      const res = await returnBook(borrowId);
      if (res.wasLate) {
        toast('Book returned (overdue return noted).', { icon: '⚠️' });
      } else {
        toast.success('Book returned successfully!');
      }
      reload();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturningId(null);
    }
  }, [reload]);

  // Helper to determine status badge text and variant as required by PRD §3.6
  const getStatusBadge = (record: PopulatedBorrowRecord) => {
    const overdue = isOverdue(record.dueDate, record.returnDate);

    if (overdue) {
      const days = getDaysOverdue(record.dueDate);
      return (
        <Badge variant="red">
          Overdue {days > 0 ? `(${days}d)` : ''}
        </Badge>
      );
    }

    if (record.status === 'returned' && record.returnDate) {
      const wasLate = new Date(record.returnDate).getTime() > new Date(record.dueDate).getTime();
      if (wasLate) {
        return <Badge variant="amber">Returned late</Badge>;
      }
      return <Badge variant="green">Returned</Badge>;
    }

    // Issued & active (not overdue)
    return <Badge variant="blue">Issued</Badge>;
  };

  // Define columns for DataTable<PopulatedBorrowRecord>
  const columns: Column<PopulatedBorrowRecord>[] = useMemo(
    () => [
      {
        key: 'book',
        header: 'Book Details',
        render: (record) => (
          <div>
            <div className="font-semibold text-[#1d2c34]">{record.book.title}</div>
            <div className="mt-0.5 text-xs text-[#74807f]">
              {record.book.author} • <span className="font-mono">{record.book.isbn}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'issueDate',
        header: 'Issued Date',
        render: (record) => (
          <span className="text-xs text-[#66717a]">{formatDate(record.issueDate)}</span>
        ),
      },
      {
        key: 'dueDate',
        header: 'Due Date',
        render: (record) => {
          const overdue = isOverdue(record.dueDate, record.returnDate);
          return (
            <span
              className={`text-xs font-medium ${
                overdue ? 'text-[#a73e35] font-semibold' : 'text-[#4f5c61]'
              }`}
            >
              {formatDate(record.dueDate)}
            </span>
          );
        },
      },
      {
        key: 'returnDate',
        header: 'Returned Date',
        render: (record) => (
          <span className="text-xs text-[#66717a]">{formatDate(record.returnDate)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (record) => getStatusBadge(record),
      },
      {
        key: 'action',
        header: 'Action',
        render: (record) => {
          const isReturned = record.status === 'returned' || Boolean(record.returnDate);
          if (isReturned) {
            return (
              <span className="inline-flex items-center gap-1 text-xs text-[#83908d]">
                <BookCheck className="h-3.5 w-3.5 text-[#237052]" />
                Completed
              </span>
            );
          }

          const inFlight = returningId === record._id;
          return (
            <Button
              variant="outline"
              size="sm"
              loading={inFlight}
              disabled={inFlight}
              onClick={() => handleReturn(record._id)}
              className="text-xs text-[#286050] hover:border-[#98b9af] hover:bg-[#e8f0ed]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Return Book
            </Button>
          );
        },
      },
    ],
    [handleReturn, returningId]
  );

  return (
    <div className="space-y-7">
      {/* Back button link */}
      <div>
        <Link
          to="/members"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#66717a] transition-colors hover:text-[#1d5968]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members List
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={reload}
          className="my-4"
        />
      )}

      {/* Member Details Header Card */}
      {memberInfo && (
        <div className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <span className="rounded-full bg-[#e8f0ed] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#286050]">
              Member Profile
            </span>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1d2c34]">{memberInfo.name}</h1>
            <p className="mt-1 text-sm text-[#74807f]">{memberInfo.email}</p>
          </div>
          <div className="rounded-xl bg-[#f0ede5] p-3.5 sm:text-right">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#74807f]">Membership Identifier</div>
            <div className="mt-1 font-mono text-sm font-bold text-[#263640]">{memberInfo.membershipId}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#83908d] sm:justify-end">
              <Clock className="w-3 h-3" />
              Total Loans: {records.length}
            </div>
          </div>
        </div>
      )}

      {/* Loans History Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1d2c34]">Borrow history</h2>
          <span className="text-xs text-[#74807f]">
            Real-time status calculated against current date
          </span>
        </div>

        <DataTable<PopulatedBorrowRecord>
          columns={columns}
          rows={records}
          rowKey={(r) => r._id}
          loading={loading}
          emptyMessage="No borrow history recorded for this member yet."
        />
      </div>
    </div>
  );
};
