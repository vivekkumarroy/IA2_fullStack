/**
 * Date utility helpers for ShelfLife frontend
 */

/**
 * Formats an ISO date string into a clean, human-readable format.
 * e.g., "Oct 5, 2026"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Checks if a borrow record is overdue client-side:
 * Return date is null AND due date is strictly in the past.
 */
export function isOverdue(dueDate: string, returnDate: string | null): boolean {
  if (returnDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

/**
 * Computes how many full days a loan is overdue.
 */
export function getDaysOverdue(dueDate: string): number {
  const diffMs = Date.now() - new Date(dueDate).getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
