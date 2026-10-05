# Frontend State Management Architecture Note

For the ShelfLife frontend, we selected a lightweight, resilient state architecture based on **local component state for server data and form state**, paired with **a single React Context (`AuthContext`) for global authentication**.

### Why This Architecture
1. **Local Server State via `useAsync`:** Each page owns its lifecycle data (books list, members list, member history) through a generic `useAsync<T>` hook. None of these server datasets require sharing across disparate or distant component subtrees. Keeping data scoped to the consuming view guarantees predictable cleanup, prevents stale-state pollution, and removes unnecessary boilerplate.
2. **Dedicated `AuthContext`:** The JWT token, active librarian profile, and authentication helpers represent the only truly global application state. Because auth state changes only on login or logout, hosting it in a focused React Context causes zero spurious re-renders across the rest of the application tree.

### Rejected Alternatives & Upgrade Path
- **Redux / Zustand:** Introducing external flux stores with actions, reducers, and global slices would be significant over-engineering for a 5-view administrative SPA.
- **TanStack / React Query:** Recognized as the optimal long-term upgrade path if cross-page caching, automatic background window re-focusing, or optimistic mutation invalidation become requirements. Our custom `useAsync` hook exports an identical signature (`{ data, loading, error, reload }`), allowing a drop-in replacement with `@tanstack/react-query` without altering page component interfaces.

### Known Trade-Off
Without an in-memory server-data cache, navigating away and returning to a screen initiates a fresh fetch request. For administrative library workflows, this guarantees librarians always interact with fresh stock and loan statuses.
