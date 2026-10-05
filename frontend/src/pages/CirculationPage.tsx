import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, RotateCcw, Search, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { PopulatedBorrowRecord } from '../types/models';
import { Column, DataTable } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Pagination } from '../components/common/Pagination';
import { Select } from '../components/common/Select';
import { fetchCirculation, returnBook } from '../api/borrow';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate, getDaysOverdue, isOverdue } from '../utils/date';
import { getErrorMessage } from '../utils/errors';

const statusOptions = ['issued', 'overdue', 'returned'];

export const CirculationPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const search = useDebounce(searchInput, 350);

  const fetchCirculationFn = useCallback(
    () => fetchCirculation({ page, limit: 10, status: selectedStatus || undefined, search: search.trim() || undefined }),
    [page, search, selectedStatus]
  );
  const { data, loading, error, reload } = useAsync(fetchCirculationFn, [fetchCirculationFn]);

  const handleReturn = useCallback(async (recordId: string) => {
    try {
      setReturningId(recordId);
      const response = await returnBook(recordId);
      toast.success(response.wasLate ? 'Book returned, overdue return recorded.' : 'Book returned successfully.');
      reload();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturningId(null);
    }
  }, [reload]);

  const statusBadge = (record: PopulatedBorrowRecord) => {
    if (isOverdue(record.dueDate, record.returnDate)) {
      const days = getDaysOverdue(record.dueDate);
      return <Badge variant="red">Overdue{days > 0 ? ` (${days}d)` : ''}</Badge>;
    }
    if (record.returnDate) return <Badge variant="green">Returned</Badge>;
    return <Badge variant="blue">With member</Badge>;
  };

  const columns: Column<PopulatedBorrowRecord>[] = useMemo(() => [
    {
      key: 'book',
      header: 'Book',
      render: (record) => <div className="min-w-[11rem]"><p className="font-semibold text-[#1d2c34]">{record.book.title}</p><p className="mt-0.5 text-xs text-[#74807f]">{record.book.author} · <span className="font-mono">{record.book.isbn}</span></p></div>,
    },
    {
      key: 'member',
      header: 'Issued to',
      render: (record) => <Link to={`/members/${record.member._id}/history`} className="group block min-w-[10rem] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#1d5968]"><p className="font-semibold text-[#1d5968] group-hover:underline">{record.member.name}</p><p className="mt-0.5 text-xs text-[#74807f]">{record.member.membershipId}</p></Link>,
    },
    {
      key: 'issueDate',
      header: 'Issued',
      render: (record) => <span className="text-xs text-[#4f5c61]">{formatDate(record.issueDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due / returned',
      render: (record) => <div className="text-xs"><p className={isOverdue(record.dueDate, record.returnDate) ? 'font-semibold text-[#a73e35]' : 'text-[#4f5c61]'}>Due {formatDate(record.dueDate)}</p><p className="mt-0.5 text-[#74807f]">{record.returnDate ? `Returned ${formatDate(record.returnDate)}` : 'Not returned'}</p></div>,
    },
    { key: 'status', header: 'Status', render: statusBadge },
    {
      key: 'action',
      header: 'Action',
      render: (record) => record.returnDate ? <span className="text-xs text-[#74807f]">Complete</span> : <Button variant="outline" size="sm" loading={returningId === record._id} disabled={returningId === record._id} onClick={() => handleReturn(record._id)}><RotateCcw className="h-3.5 w-3.5" />Return book</Button>,
    },
  ], [handleReturn, returningId]);

  return (
    <div className="page-stack">
      <div className="page-header lg:items-end">
        <div>
          <span className="page-eyebrow"><CalendarDays className="h-3.5 w-3.5" /> Circulation desk</span>
          <h1 className="page-title">Circulation</h1>
          <p className="page-copy">Every issue and return in one register. A title can appear many times, once for each member who takes it.</p>
        </div>
        <Link to="/issue" className="page-action"><Button variant="primary"><BookOpen className="h-4 w-4" />Issue a book</Button></Link>
      </div>

      <div className="filter-surface grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
        <div>
          <label htmlFor="circulation-search" className="field-label">Find a book or member</label>
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#83908d]" /><input id="circulation-search" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setPage(1); }} placeholder="Title, author, ISBN, or member..." className="field-input pl-10" /></div>
        </div>
        <Select<string> label="Show" options={statusOptions} value={selectedStatus} onChange={(value) => { setSelectedStatus(value); setPage(1); }} getKey={(option) => option} getLabel={(option) => option === 'issued' ? 'With members' : option.charAt(0).toUpperCase() + option.slice(1)} placeholder="All activity" />
      </div>

      {error && <ErrorMessage message={error} onRetry={reload} />}

      <div className="data-region">
        <div className="flex items-center gap-2 text-sm text-[#66717a]"><UsersRound className="h-4 w-4 text-[#1d5968]" /><span>{data?.meta.total ?? 0} issue record{data?.meta.total === 1 ? '' : 's'}</span></div>
        <DataTable columns={columns} rows={data?.data || []} rowKey={(record) => record._id} loading={loading} emptyMessage="No circulation records match this view." />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
    </div>
  );
};
