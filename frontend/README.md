# ShelfLife Frontend

A modern, responsive, strictly typed React 18 SPA built with Vite, TypeScript, Tailwind CSS, and React Router v6.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

---

## 2. Running Locally

### Development Server
```bash
npm run dev
```
Launches at `http://localhost:5173`.

### Production Build & Preview
```bash
npm run build
npm run preview
```
Runs strict TypeScript checks (`strict: true`, `noUncheckedIndexedAccess: true`) and produces an optimized production bundle.

---

## 3. Mock Mode Demo (Offline Testing)

ShelfLife includes a full in-memory mock API layer that mirrors all backend endpoints and shapes, with simulated network latency:
1. In `.env`, set:
   ```env
   VITE_USE_MOCK=true
   ```
2. Restart or reload the dev server.
3. You can log in using demo credentials, browse books, issue loans, view overdue history, and trigger simulated 409 errors (e.g. attempting to borrow "The Catcher in the Rye" which has 0 available copies).

---

## 4. Demo Credentials
- **Email:** `librarian@shelflife.test`
- **Password:** `Passw0rd!`

---

## 5. Application Routes

| Path | Component | Access | Description |
|---|---|---|---|
| `/login` | `LoginPage` | Public | Librarian authentication; redirects to `/` if already logged in |
| `/` | `BookListPage` | Protected | Catalog view with search, genre filter, stock counters, and Add Book |
| `/issue` | `IssueBookPage` | Protected | Loan issuance with Member/Book selectors and real-time stock check |
| `/members` | `MembersPage` | Protected | Member directory with search and new member registration |
| `/members/:id/history` | `MemberHistoryPage` | Protected | Real-time loan history, client-calculated overdue badges, return button |
| `*` | `NotFoundPage` | Public | Friendly 404 handler with return link |

---

## 6. Architecture & Generic Components

- **`DataTable<T>`:** Completely reusable, type-safe data table component used across:
  - `Book` (`DataTable<Book>`)
  - `Member` (`DataTable<Member>`)
  - `PopulatedBorrowRecord` (`DataTable<PopulatedBorrowRecord>`)
- **`Select<T>`:** Generic dropdown component supporting any entity type with disabled-option predicates, key extractors, and accessible labels.
- **`useAsync<T>`:** Custom data-fetching hook with stale-response cancellation, loading indicators, and error normalization.
- **`useDebounce<T>`:** 400ms debouncing hook for responsive search filtering.
- **State Architecture:** Documented in [State Management Note](../docs/state-management-note.md).
