# IA2_fullStack — ShelfLife Library Management System

A full-stack, concurrency-safe library management platform comprising an **Express/MongoDB backend**, a **React/TypeScript SPA frontend**, and complete **System Design documentation** built for the IA2 FullStack assessment.

---

## 🎯 What Was Built

### 1. Backend (Section A — Express, Node.js, MongoDB, Mongoose 8, Zod, JWT)
- **Atomic Concurrency Control**: Solved the last-copy race condition by making stock checks and decrements a single database operation (`findOneAndUpdate({ _id, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } })`) with automatic compensation rollbacks if borrow record creation fails.
- **Mongoose Schemas & Validation**:
  - `Book`: Strict ISBN-10/13 validation, text index on `title`, unique `isbn`, stock constraints (`availableCopies <= totalCopies`, `min: 0`).
  - `Member`: Unique `email`, auto-generated `MEM-XXXXXX` membership IDs.
  - `BorrowRecord`: Partial unique index preventing duplicate active loans, `effectiveStatus` virtual for real-time overdue detection.
  - `Librarian`: Bcrypt password hashing (`select: false`).
- **REST API Endpoints**:
  - `POST /api/auth/login` — Issues 8h JWT token
  - `GET /api/books` — Paginated catalog with case-insensitive search and genre filtering
  - `GET /api/books/genres` — Distinct genres list
  - `POST /api/books` — Protected book creation
  - `GET /api/members` — Paginated members list with name/email search
  - `POST /api/members` — Member registration
  - `POST /api/borrow` — Atomic book issuing
  - `POST /api/return/:borrowId` — Idempotent book return restoring available stock
  - `GET /api/members/:id/history` — Full loan history with real-time overdue statuses
  - `GET /api/health` — API liveness check
- **Middleware**: Unique `x-request-id` + Morgan logging, Zod validation, JWT bearer protection, centralized error handler.
- **Automated Concurrency Tests**: Verified via Jest + Supertest + in-memory MongoDB (`tests/borrow.concurrency.test.js`) firing 10 parallel requests at a single-copy book with strictly 1 success (201) and 9 conflicts (409).

### 2. Frontend (Section B — React 18, Vite, TypeScript, Tailwind CSS)
- **Type Safety**: Strictly typed (`strict: true`, `noUncheckedIndexedAccess: true`, zero `any`).
- **Generic Components**:
  - `DataTable<T>`: Used across `Book`, `Member`, and `PopulatedBorrowRecord`.
  - `Select<T>`: Generic selector with option disabling (e.g. 0 available copies).
- **Views & Routing**:
  - `BookListPage`: Debounced search (400ms), genre dropdown, stock badges, pagination, Add Book modal.
  - `IssueBookPage`: Member and Book dropdowns, 14-day due date preview, double-submit protection, toast feedback.
  - `MembersPage`: Searchable member table with loan history links and member registration.
  - `MemberHistoryPage`: Real-time overdue badges, return book actions with instant stock update.
  - `LoginPage`: Secure librarian login with prefilled credentials.
  - `ProtectedRoute`: Route protection redirecting unauthenticated users to `/login`.
- **Offline / Mock Mode**: Toggle `VITE_USE_MOCK=true` to demo the full UI without needing a live backend/database.

### 3. System Design (Section C — High-Scale Architecture)
- **Scale Document** (`docs/system-design.md`): Detailed 1-2 page write-up covering 500 libraries, 2M members, 10× peak semester registration spikes.
- **Sharding Strategy**: Compound shard keys `{ libraryId: 1, _id: 1 }` for single-shard targeted queries.
- **Caching Architecture**: Redis cache-aside with versioned invalidation and stampede mutex locks.
- **Diagrams**: Vector SVG (`docs/architecture.svg`), 3× HD PNG (`docs/architecture.png`), Mermaid source (`docs/architecture.mmd`), and interactive viewer (`docs/architecture.html`).

---

## 📁 Repository Layout

```
IA2_fullStack/
├── README.md                          # Top-level overview and run instructions
├── package.json                       # Monorepo root helper scripts
├── .gitignore                         # Prevents node_modules & .env leaks
├── backend/                           # Express 4 + Mongoose 8 + JWT API
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   ├── src/
│   │   ├── server.js                  # Entry point
│   │   ├── dev-server.js              # Embedded in-memory MongoDB runner
│   │   ├── app.js                     # Express app setup
│   │   ├── config/                    # db.js, env.js (fail-fast validation)
│   │   ├── models/                    # Book, Member, BorrowRecord, Librarian
│   │   ├── routes/                    # API route definitions
│   │   ├── controllers/               # Race-safe controllers
│   │   ├── middleware/                # Auth, validation, requestLogger, errorHandler
│   │   ├── validators/                # Zod schemas
│   │   └── scripts/seed.js            # Standalone database seeder
│   ├── tests/
│   │   └── borrow.concurrency.test.js # 10-parallel request concurrency proof
│   └── requests/
│       ├── curl.sh                    # Bash walkthrough script
│       └── test-api.ps1               # PowerShell walkthrough script
├── frontend/                          # React 18 + TypeScript + Vite + Tailwind
│   ├── package.json
│   ├── tsconfig.json                  # strict: true, noUncheckedIndexedAccess: true
│   ├── README.md
│   └── src/
│       ├── types/                     # models.ts, api.ts
│       ├── api/                       # Typed client + mock layer
│       ├── context/                   # AuthContext
│       ├── hooks/                     # useAsync, useDebounce
│       ├── components/                # DataTable<T>, Select<T>, Badge, etc.
│       └── pages/                     # Catalog, Issue, Members, History, Login
└── docs/
    ├── system-design.md               # Section C architecture write-up
    ├── architecture.mmd               # Mermaid diagram source
    ├── architecture.svg               # Vector architecture diagram
    ├── architecture.png               # 3x HD architecture diagram
    ├── architecture.html              # Standalone diagram viewer
    ├── state-management-note.md       # Frontend state management rationale
    └── postman/
        └── ShelfLife.postman_collection.json # Postman v2.1 collection
```

---

## 🚀 Quick Start (Running Locally)

### 1. Install All Dependencies
```bash
npm run setup
```

### 2. Start the Backend (Zero-Setup Embedded Database)
```bash
npm run backend:dev-memory
```
*Runs on `http://localhost:5000/api` with an in-memory MongoDB engine pre-seeded with 25 books, 8 members, and overdue loans.*

### 3. Start the Frontend (In a New Terminal)
```bash
npm run frontend:dev
```
*Runs on `http://localhost:5173`.*

### 4. Log In
- **URL:** `http://localhost:5173/login`
- **Email:** `librarian@shelflife.test`
- **Password:** `Passw0rd!`

---

## 🧪 Running Tests & Verifications

```bash
# Run backend concurrency tests
npm run backend:test

# Run frontend strict TypeScript build
npm run frontend:build

# Run API walkthrough (PowerShell)
cd backend && powershell -ExecutionPolicy Bypass -File requests/test-api.ps1

# Run API walkthrough (Bash)
cd backend && ./requests/curl.sh
```
