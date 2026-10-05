# ShelfLife Backend API

ShelfLife is a modern, race-safe library management backend built with Node.js, Express, MongoDB (Mongoose), Zod, and JWT.

---

## 1. Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0 (running locally on port 27017, or a MongoDB Atlas URI)
- **npm** >= 9.0.0

---

## 2. Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Verify or adjust the `.env` settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shelflife
   JWT_SECRET=shelflife-dev-secret-key-change-in-production
   JWT_EXPIRES_IN=8h
   LOAN_PERIOD_DAYS=14
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

---

## 3. Database Seeding

Run the seed script to populate default data:
```bash
npm run seed
```

This creates:
- **1 Librarian:** `librarian@shelflife.test` / `Passw0rd!`
- **25 Books** spanning 10+ genres (including single-copy books for race condition testing)
- **8 Members** with auto-generated membership IDs (`MEM-XXXXXX`)
- **6 Borrow Records** (including 2 actively overdue, 2 returned, and 2 active loans)

---

## 4. Running the Server

- **Development mode (with auto-restart via nodemon):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  ```
The API will be available at `http://localhost:5000/api`.

---

## 5. Running Tests

ShelfLife includes comprehensive unit and concurrency tests powered by `Jest`, `Supertest`, and an in-memory MongoDB instance (`mongodb-memory-server`):
```bash
npm test
```
The test suite validates:
- **10 parallel borrow requests** against a 1-copy book: strictly 1 success (201) and 9 conflicts (409)
- Stock increment on return
- Idempotency / 409 rejection on double returns
- Route authentication enforcement (401)
- Request validation rejection (400)

---

## 6. API Endpoints Reference

All requests and responses use JSON.
- **Success envelope:** `{ "success": true, "data": ..., "meta"?: ... }`
- **Error envelope:** `{ "success": false, "error": { "code": "STRING", "message": "Human readable", "details"?: [...] } }`

| # | Method & Path | Auth | Request Body / Query | Success Code | Error Codes | Description |
|---|---|---|---|---|---|---|
| 1 | `GET /api/health` | Public | None | `200` | — | Liveness & health check |
| 2 | `POST /api/auth/login` | Public | `{ email, password }` | `200` | `400`, `401 INVALID_CREDENTIALS` | Issues JWT token with 8h validity |
| 3 | `GET /api/books` | Public | `page, limit, genre, search, sort` | `200` | `400` | Paginated catalog with search & filter |
| 4 | `GET /api/books/genres` | Public | None | `200` | — | List of distinct genres |
| 5 | `POST /api/books` | **JWT** | `{ title, author, isbn, genre, totalCopies, availableCopies? }` | `201` | `400`, `401`, `409 DUPLICATE_KEY` | Adds a new book to catalog |
| 6 | `GET /api/members` | **JWT** | `page, limit, search` | `200` | `400`, `401` | Paginated member list with name/email search |
| 7 | `POST /api/members` | **JWT** | `{ name, email, membershipId?, joinedDate? }` | `201` | `400`, `401`, `409 DUPLICATE_KEY` | Registers a new member |
| 8 | `POST /api/borrow` | **JWT** | `{ bookId, memberId, dueDate? }` | `201` | `400`, `401`, `404`, `409 NO_COPIES_AVAILABLE`, `409 ALREADY_BORROWED` | Atomically issues a book |
| 9 | `POST /api/return/:borrowId` | **JWT** | Path parameter: `borrowId` | `200` | `400`, `401`, `404`, `409 ALREADY_RETURNED` | Returns book and restores stock |
| 10 | `GET /api/members/:id/history`| **JWT** | `page, limit, status` | `200` | `400`, `401`, `404` | Full loan history with real-time status |

---

## 7. Concurrency Safety & Race Condition Prevention

### The Race Condition
Two librarians clicking "issue" on the last copy at the same moment could both read `availableCopies = 1`, both pass an `if (> 0)` check, and both decrement, giving -1 and two loans for one copy. A read-then-write is not atomic.

### The Solution
To prevent it, we make the check and the decrement a single database operation:
```js
const book = await Book.findOneAndUpdate(
  { _id: bookId, availableCopies: { $gt: 0 } },
  { $inc: { availableCopies: -1 } },
  { new: true }
);
```
MongoDB applies single-document updates atomically, so exactly one request matches the filter and gets the document back; the other gets `null` and is answered with 409 "no copies available".

### Compensation & Defense in Depth
1. **Compensation:** If creating the `BorrowRecord` fails after decrementing (e.g. duplicate active loan caught by partial index), the controller increments the counter back via `Book.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } })`.
2. **Schema validation:** `min: 0` on `availableCopies` prevents negative counts at the database schema level.
3. **Partial Unique Index:** `{ book: 1, member: 1 }` where `status: { $in: ['issued', 'overdue'] }` enforces that no member can simultaneously borrow multiple active copies of the same book.

---

## 8. Key Architecture & Design Decisions

### 1. Overdue Handling: Real-time Derivation + Lazy Sync
- Rather than relying solely on background schedulers that can fall out of sync, `BorrowRecord` computes `effectiveStatus` on every read: if `status === 'issued'` and `dueDate < now`, it reports as `overdue`.
- On `GET /members/:id/history`, a lightweight `updateMany` synchronizes the database status lazily for that member.
- In production, this is paired with a recurring cron sweep.

### 2. Standalone vs Replica Set Compatibility
- Multi-document transactions require a MongoDB replica set. To ensure ShelfLife runs seamlessly in both development (standalone Mongo) and production (Atlas replica sets), the default path uses single-document atomic update + compensation rollback.

### 3. Fail-Fast Configuration
- `config/env.js` validates critical environment variables (`MONGO_URI`, `JWT_SECRET`) immediately at boot, failing fast with descriptive guidance if missing.

---

## 9. Folder Structure

```
backend/
├── package.json
├── .env.example
├── README.md
├── src/
│   ├── server.js              # Database connection and HTTP server listener
│   ├── app.js                 # Express application configuration, middleware pipeline
│   ├── config/
│   │   ├── db.js              # Mongoose connection
│   │   └── env.js             # Fail-fast environment variable validation
│   ├── models/
│   │   ├── Book.js            # ISBN validation, text index, stock constraints
│   │   ├── Member.js          # Membership ID generation, email validation
│   │   ├── BorrowRecord.js    # Partial unique index, virtual effectiveStatus
│   │   └── Librarian.js       # Bcrypt password hashing, role management
│   ├── routes/
│   │   ├── index.js           # Central /api router with health check & return route
│   │   ├── auth.routes.js     # /api/auth/login
│   │   ├── book.routes.js     # /api/books, /api/books/genres
│   │   ├── member.routes.js   # /api/members, /api/members/:id/history
│   │   └── borrow.routes.js   # /api/borrow
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── book.controller.js
│   │   ├── member.controller.js
│   │   └── borrow.controller.js
│   ├── middleware/
│   │   ├── auth.js            # JWT bearer token verification
│   │   ├── validate.js        # Zod request validation wrapper
│   │   ├── requestLogger.js   # Unique x-request-id + Morgan logging
│   │   ├── notFound.js        # 404 Route Not Found handler
│   │   └── errorHandler.js    # Centralized JSON error envelope formatter
│   ├── validators/            # Zod validation schemas
│   │   ├── auth.schema.js
│   │   ├── book.schema.js
│   │   ├── member.schema.js
│   │   └── borrow.schema.js
│   ├── utils/
│   │   ├── ApiError.js        # Typed HTTP error carrier
│   │   ├── asyncHandler.js    # Unhandled promise rejection wrapper
│   │   └── dates.js           # Date and overdue helpers
│   └── scripts/
│       └── seed.js            # Comprehensive demo data seeder
├── tests/
│   └── borrow.concurrency.test.js # 10-parallel request concurrency proof
└── requests/
    └── curl.sh                # End-to-end runnable bash script
```

---

## 10. Sample Requests & Testing Tools

- **Shell Script:** Run `./requests/curl.sh` to execute a full interactive sequence of requests including login, CRUD, atomic borrowing, returns, and failure conditions.
- **Postman Collection:** Import `docs/postman/ShelfLife.postman_collection.json` into Postman. It includes pre-configured environment variables and test scripts that automatically capture and propagate JWT tokens and entity IDs.
