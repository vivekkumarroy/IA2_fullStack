import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Search, History, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Member } from '../types/models';
import { Column, DataTable } from '../components/common/DataTable';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { fetchMembers, createMember } from '../api/members';
import { formatDate } from '../utils/date';
import { getErrorMessage } from '../utils/errors';

export const MembersPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');

  const debouncedSearch = useDebounce(searchInput, 400);

  // Register Member form modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Members fetcher
  const fetchMembersFn = useCallback(() => {
    return fetchMembers({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
    });
  }, [page, limit, debouncedSearch]);

  const { data: membersData, loading, error, reload } = useAsync(
    fetchMembersFn,
    [fetchMembersFn]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      setSubmitting(true);
      const newMember = await createMember({
        name: name.trim(),
        email: email.trim(),
        membershipId: membershipId.trim() || undefined,
      });

      toast.success(`Registered ${newMember.name} (${newMember.membershipId})!`);
      setIsRegisterModalOpen(false);
      setName('');
      setEmail('');
      setMembershipId('');
      reload();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns for DataTable<Member>
  const columns: Column<Member>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Member Name',
        render: (member) => (
          <div className="font-semibold text-[#1d2c34]">{member.name}</div>
        ),
      },
      {
        key: 'membershipId',
        header: 'Membership ID',
        render: (member) => (
          <span className="rounded-md bg-[#e8f0ed] px-2 py-1 font-mono text-[11px] font-bold text-[#286050]">
            {member.membershipId}
          </span>
        ),
      },
      {
        key: 'email',
        header: 'Email Address',
        render: (member) => (
          <span className="flex items-center gap-1.5 text-xs text-[#66717a]">
            <Mail className="w-3.5 h-3.5 text-[#83908d]" />
            {member.email}
          </span>
        ),
      },
      {
        key: 'joinedDate',
        header: 'Joined Date',
        render: (member) => (
          <span className="text-xs text-[#74807f]">{formatDate(member.joinedDate)}</span>
        ),
      },
      {
        key: 'actions',
        header: 'Borrow History',
        render: (member) => (
          <Link
            to={`/members/${member._id}/history`}
            className="inline-flex items-center gap-1 rounded-lg bg-[#eef2ef] px-2.5 py-1.5 text-xs font-bold text-[#286050] transition hover:bg-[#dcebe4]"
          >
            <History className="w-3.5 h-3.5" />
            View Loans
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="page-eyebrow"><Users className="h-3.5 w-3.5" /> Community desk</span>
          <h1 className="page-title">Registered members</h1>
          <p className="page-copy">
            Browse library members, inspect their borrow histories, or register new students.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsRegisterModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Register Member
        </Button>
      </div>

      {/* Search Input Bar */}
      <div className="surface p-4 sm:max-w-2xl sm:p-5">
        <label htmlFor="member-search" className="field-label">
          Search by Name or Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#83908d]">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="member-search"
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="e.g. Alice, bob@example.com..."
            className="field-input pl-10"
          />
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {/* Members Table via DataTable<Member> */}
      <div className="space-y-0">
        <DataTable<Member>
          columns={columns}
          rows={membersData?.data || []}
          rowKey={(m) => m._id}
          loading={loading}
          emptyMessage={
            debouncedSearch
              ? 'No members match your search criteria.'
              : 'No members registered yet.'
          }
        />

        {membersData?.meta && (
          <Pagination
            meta={membersData.meta}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* Register Member Modal */}
      {isRegisterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-backdrop"
        >
          <div className="modal-panel max-w-md space-y-5">
            <div className="flex items-center justify-between border-b border-[#e5e0d7] pb-4">
              <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-[#1d2c34]">
                <UserPlus className="w-5 h-5 text-[#a74a39]" />
                Register New Member
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#7c8885] transition hover:bg-[#f0ede5] hover:text-[#1d2c34]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-4">
              <div>
                <label className="field-label">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@university.edu"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">
                  Membership ID <span className="text-xs text-slate-400 font-normal">(Optional: auto-generated if left blank)</span>
                </label>
                <input
                  type="text"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  placeholder="e.g. MEM-123456"
                  className="field-input"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e5e0d7] pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegisterModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Register
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
