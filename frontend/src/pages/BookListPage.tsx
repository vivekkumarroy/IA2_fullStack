import React, { useState, useCallback, useMemo } from 'react';
import { Search, BookPlus, BookOpen, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Book } from '../types/models';
import { Column, DataTable } from '../components/common/DataTable';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { fetchBooks, fetchGenres, createBook } from '../api/books';
import { getErrorMessage } from '../utils/errors';

export const BookListPage: React.FC = () => {
  // Query parameters state
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(8);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Debounce search input with 400ms delay
  const debouncedSearch = useDebounce(searchInput, 400);

  // Modal / Form state for Add Book
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newTotalCopies, setNewTotalCopies] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  // Fetch genres for filter dropdown
  const { data: genresData } = useAsync(() => fetchGenres(), []);
  const genreOptions = useMemo(() => genresData || [], [genresData]);

  // Main books query using useAsync hook
  const fetchBooksFn = useCallback(() => {
    return fetchBooks({
      page,
      limit,
      genre: selectedGenre || undefined,
      search: debouncedSearch.trim() || undefined,
    });
  }, [page, limit, selectedGenre, debouncedSearch]);

  const { data: booksData, loading, error, reload } = useAsync(fetchBooksFn, [
    fetchBooksFn,
  ]);

  // Reset page to 1 whenever filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleGenreChange = (genre: string | null) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  // Add Book submission
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const created = await createBook({
        title: newTitle.trim(),
        author: newAuthor.trim(),
        isbn: newIsbn.trim(),
        genre: newGenre.trim(),
        totalCopies: Number(newTotalCopies),
      });
      toast.success(`Book "${created.title}" added to catalog!`);
      setIsAddModalOpen(false);
      // Reset form fields
      setNewTitle('');
      setNewAuthor('');
      setNewIsbn('');
      setNewGenre('');
      setNewTotalCopies(3);
      reload();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns for DataTable<Book>
  const columns: Column<Book>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title & Author',
        render: (book) => (
          <div>
            <div className="font-semibold text-[#1d2c34]">{book.title}</div>
            <div className="mt-0.5 text-xs text-[#74807f]">by {book.author}</div>
          </div>
        ),
      },
      {
        key: 'isbn',
        header: 'ISBN',
        render: (book) => (
          <span className="rounded-md bg-[#f0ede5] px-2 py-1 font-mono text-[11px] text-[#586462]">
            {book.isbn}
          </span>
        ),
      },
      {
        key: 'genre',
        header: 'Genre',
        render: (book) => (
          <span className="inline-flex items-center rounded-full bg-[#e8f0ed] px-2.5 py-1 text-[11px] font-bold text-[#286050]">
            {book.genre}
          </span>
        ),
      },
      {
        key: 'availability',
        header: 'Availability',
        render: (book) => {
          const isZero = book.availableCopies === 0;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  isZero ? 'text-[#a73e35] font-bold' : 'text-[#237052]'
                }`}
              >
                {book.availableCopies}
              </span>
              <span className="text-[#a3aaa5]">/</span>
              <span className="text-[#66717a]">{book.totalCopies}</span>
              {isZero && (
                <span className="inline-flex items-center rounded-md bg-[#f9e4dc] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#9d3f31]">
                  <AlertTriangle className="w-3 h-3 mr-0.5" />
                  Out of Stock
                </span>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="page-stack">
      {/* Header section with Title and Add Book button */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow"><BookOpen className="h-3.5 w-3.5" /> Collection desk</span>
          <h1 className="page-title">Library catalog</h1>
          <p className="page-copy">
            Browse collection, verify live stock counts, and filter across genres.
          </p>
        </div>
        <div className="page-action"><Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <BookPlus className="w-4 h-4 mr-1.5" />
          Add New Book
        </Button></div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-surface grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem] md:items-end">
        {/* Title Search Input */}
        <div className="flex-1">
          <label htmlFor="book-search" className="field-label">
            Search by Title or Author
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#83908d]">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="book-search"
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="e.g. Great Gatsby, Orwell..."
              className="field-input pl-10"
            />
          </div>
        </div>

        {/* Genre Generic Select Filter */}
        <div className="w-full">
          <Select<string>
            label="Filter by Genre"
            options={genreOptions}
            value={selectedGenre}
            onChange={handleGenreChange}
            getKey={(g) => g}
            getLabel={(g) => g}
            placeholder="All Genres"
          />
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {/* Books Table & Pagination */}
      <div className="data-region">
        <DataTable<Book>
          columns={columns}
          rows={booksData?.data || []}
          rowKey={(book) => book._id}
          loading={loading}
          emptyMessage={
            debouncedSearch || selectedGenre
              ? 'No books match your current search and filter criteria.'
              : 'No books available in the catalog.'
          }
        />

        {booksData?.meta && (
          <Pagination
            meta={booksData.meta}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-backdrop"
        >
          <div className="modal-panel max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-[#e5e0d7] pb-4">
              <h3 className="font-serif text-xl font-bold text-[#1d2c34] flex items-center gap-2">
                <BookPlus className="w-5 h-5 text-[#a74a39]" />
                Add Book to Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#7c8885] transition hover:bg-[#f0ede5] hover:text-[#1d2c34]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="field-label">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Clean Code"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">
                  Author <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Robert C. Martin"
                  className="field-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">
                    ISBN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    placeholder="9780132350884"
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label">
                    Genre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="e.g. Technology"
                    className="field-input"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">
                  Total Copies <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTotalCopies}
                  onChange={(e) => setNewTotalCopies(parseInt(e.target.value, 10) || 1)}
                  className="field-input"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e5e0d7] pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Save Book
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
