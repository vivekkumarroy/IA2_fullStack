import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookUp, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Book, Member } from '../types/models';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Spinner } from '../components/common/Spinner';
import { useAsync } from '../hooks/useAsync';
import { fetchBooks } from '../api/books';
import { fetchMembers } from '../api/members';
import { issueBook } from '../api/borrow';
import { formatDate } from '../utils/date';
import { getErrorMessage } from '../utils/errors';

export const IssueBookPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [lastIssue, setLastIssue] = useState<{ title: string; member: string; dueDate: string } | null>(null);

  // Load books list (100 items to populate dropdown)
  const {
    data: booksData,
    loading: loadingBooks,
    error: errorBooks,
    reload: reloadBooks,
  } = useAsync(() => fetchBooks({ page: 1, limit: 100 }), []);

  // Load members list (100 items to populate dropdown)
  const {
    data: membersData,
    loading: loadingMembers,
    error: errorMembers,
    reload: reloadMembers,
  } = useAsync(() => fetchMembers({ page: 1, limit: 100 }), []);

  const booksList = useMemo(() => booksData?.data || [], [booksData]);
  const membersList = useMemo(() => membersData?.data || [], [membersData]);

  // Due date preview: 14 days from today
  const previewDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return formatDate(d.toISOString());
  }, []);

  const isFormValid = Boolean(selectedBook && selectedMember && selectedBook.availableCopies > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember || submitting) return;

    try {
      setSubmitting(true);
      setLastIssue(null);
      const res = await issueBook({
        bookId: selectedBook._id,
        memberId: selectedMember._id,
      });

      const dueFormatted = formatDate(res.borrowRecord.dueDate);
      toast.success(
        `Issued "${selectedBook.title}" to ${selectedMember.name}. Due ${dueFormatted}`,
        { duration: 5000 }
      );
      setLastIssue({ title: selectedBook.title, member: selectedMember.name, dueDate: dueFormatted });

      // Reset form and reload fresh book availability
      setSelectedBook(null);
      setSelectedMember(null);
      reloadBooks();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loadingBooks || loadingMembers;
  const hasError = errorBooks || errorMembers;

  return (
    <div className="page-stack mx-auto max-w-4xl">
      <div>
        <span className="page-eyebrow"><BookUp className="h-3.5 w-3.5" /> Circulation desk</span>
        <h1 className="page-title">Issue a book</h1>
        <p className="page-copy">
          Select a registered library member and a book with available copies.
        </p>
      </div>

      {lastIssue && (
        <div role="status" aria-live="polite" className="success-moment">
          <div className="flex items-start gap-3">
            <CheckCircle className="success-mark mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">Book issued successfully</p>
              <p className="mt-0.5 text-sm text-[#376f59]"><span className="font-semibold">{lastIssue.title}</span> is with {lastIssue.member} until {lastIssue.dueDate}.</p>
            </div>
          </div>
          <Link to="/circulation" className="shrink-0 text-sm font-bold text-[#1f6048] underline decoration-[#87bba3] underline-offset-4 transition hover:text-[#174b38]">View circulation</Link>
        </div>
      )}

      {hasError && (
        <ErrorMessage
          message={errorBooks || errorMembers || 'Failed to load options'}
          onRetry={() => {
            if (errorBooks) reloadBooks();
            if (errorMembers) reloadMembers();
          }}
        />
      )}

      {isLoading ? (
        <div className="surface p-12 text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm font-medium text-[#66717a]">Checking available copies and member records...</p>
        </div>
      ) : (
        <div className="surface">
          <div className="border-b border-[#dfdad0] bg-[#f0ede5] px-6 py-4 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#65716f]">New book issue</p><p className="mt-1 text-sm text-[#66717a]">Choose a member and an available title to record a book issue.</p></div>
          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {/* Member Generic Select */}
            <Select<Member>
              label="Select Member"
              required
              options={membersList}
              value={selectedMember}
              onChange={setSelectedMember}
              getKey={(m) => m._id}
              getLabel={(m) => `${m.name} (${m.membershipId}) — ${m.email}`}
              placeholder="Search or choose a member..."
            />

            {/* Book Generic Select */}
            <Select<Book>
              label="Select Book"
              required
              options={booksList}
              value={selectedBook}
              onChange={setSelectedBook}
              getKey={(b) => b._id}
              getLabel={(b) => `${b.title} (${b.availableCopies}/${b.totalCopies} available)`}
              isOptionDisabled={(b) => b.availableCopies <= 0}
              placeholder="Search or choose a book..."
            />

            {/* Dynamic Stock & Due Date Preview */}
            <div className="rounded-xl border border-[#d8d3c9] bg-[#f7f4ed] p-4 space-y-3">
              <div className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1.5 font-medium text-[#5e6a6c]">
                  <Calendar className="w-4 h-4 text-[#a74a39]" />
                  Standard issue period:
                </span>
                <span className="font-semibold text-[#263640]">14 Days</span>
              </div>

              <div className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[#5e6a6c]">Calculated Due Date:</span>
                <span className="rounded-md bg-[#e8f0ed] px-2.5 py-1 font-semibold text-[#286050]">
                  {previewDueDate}
                </span>
              </div>

              {selectedBook && (
                <div className="flex flex-col gap-1.5 border-t border-[#d8d3c9] pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[#5e6a6c]">Stock Availability:</span>
                  {selectedBook.availableCopies > 0 ? (
                    <span className="flex items-center text-xs font-medium text-[#237052]">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      {selectedBook.availableCopies} of {selectedBook.totalCopies} copies in stock
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-semibold text-[#a73e35]">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      0 copies available (cannot issue)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={!isFormValid || submitting}
              className="w-full"
            >
              {submitting ? 'Issuing book...' : 'Issue book'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
